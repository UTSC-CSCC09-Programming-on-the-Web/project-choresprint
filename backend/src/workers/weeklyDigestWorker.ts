import "dotenv/config";
import { prisma } from "../lib/prisma";
import { sendMail } from "../lib/mailer";
import cron from "node-cron";

// worker sends weekly digest emails to house members
export async function sendWeeklyDigest() {
  const houses = await prisma.house.findMany({
    include: {
      members: {
        where: { weeklyDigest: true },
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Filter out houses with no members who want the digest
  for (const house of houses) {
    const leaderboard = await prisma.user.findMany({
      where: { houseId: house.id },
      orderBy: { points: "desc" },
      select: { id: true, name: true, points: true },
    });

    // get top 5 performers
    const topPerformers = await Promise.all(
      leaderboard.slice(0, 5).map(async (u: { id: number; name: string | null; points: number | null }) => ({
        id: u.id,
        name: u.name,
        points: u.points,
        chores: await prisma.chore.findMany({
          where: { assignedToId: u.id, isCompleted: false },
          select: { title: true },
        }),
      }))
    );

    // create an HTML version of the top performers
    const htmlList = topPerformers
      .map((u, idx) => {
        const chores = u.chores.map((c: { title: string }) => c.title).join(", ") || "None";
        return `<li>${idx + 1}. ${u.name ?? "User"} - ${u.points ?? 0} pts <br/>Remaining chores: ${chores}</li>`;
      })
      .join("");

    // create a text version of the top performers
    const textList = topPerformers
      .map((u, idx) => {
        const chores = u.chores.map((c: { title: string }) => c.title).join(", ") || "None";
        return `${idx + 1}. ${u.name ?? "User"} - ${u.points ?? 0} pts\nRemaining chores: ${chores}`;
      })
      .join("\n\n");

    // send digest to each member
    for (const member of house.members) {
      const memberRank = leaderboard.findIndex((u: { id: number }) => u.id === member.id) + 1;
      const memberPoints = leaderboard.find((u: { id: number; points: number | null }) => u.id === member.id)?.points ?? 0;
      const pendingChores = await prisma.chore.findMany({
        where: { assignedToId: member.id, isCompleted: false },
        select: { title: true },
      });
      const choresList = pendingChores.map((c: { title: string }) => c.title).join(", ") || "None";
      try {
        await sendMail({
          to: member.email,
          subject: `Weekly Stats for ${house.name}`,
          html: `<p>Hi ${member.name ?? "there"}, here are this week's top performers in ${house.name}:</p><ul>${htmlList}</ul><p>Your position: ${memberRank}<br/>Your points: ${memberPoints}<br/>Chores left: ${choresList}</p>`,
          text: `Hi ${member.name ?? "there"},\n\nHere are this week's top performers in ${house.name}:\n${textList}\n\nYour position: ${memberRank}\nYour points: ${memberPoints}\nChores left: ${choresList}`,
        });
        console.log(`Sent weekly digest to ${member.email}`);
      } catch (err) {
        console.error(`Failed to send digest to ${member.email}:`, err);
      }
    }
  }
}

export function scheduleWeeklyDigest() {
  // schedule for every sunday at 12:00 PM UTC
  cron.schedule("0 12 * * 0", () => {
    sendWeeklyDigest().catch((err: unknown) =>
      console.error("Failed to send weekly digest:", err)
    );
  });
}

// if ran directly, then send the digest
if (require.main === module) {
  prisma
    .$connect()
    .then(sendWeeklyDigest)
    .catch((err: unknown) => console.error(err))
    .finally(async () => {
      await prisma.$disconnect();
    });
}