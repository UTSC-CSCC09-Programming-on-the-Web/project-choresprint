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
      select: { name: true, points: true },
      take: 5,
    });

    const htmlList = leaderboard
      .map((u: { name: string | null; points: number | null }, idx: number) =>
        `<li>${idx + 1}. ${u.name ?? "User"} - ${u.points ?? 0} pts</li>`
      )
      .join("");

    const textList = leaderboard
      .map((u: { name: string | null; points: number | null }, idx: number) =>
        `${idx + 1}. ${u.name ?? "User"} - ${u.points ?? 0} pts`
      )
      .join("\n");

    // send digest to each member
    for (const member of house.members) {
      try {
        await sendMail({
          to: member.email,
          subject: `Weekly Stats for ${house.name}`,
          html: `<p>Hi ${member.name ?? "there"}, here are this week's top performers in ${house.name}:</p><ul>${htmlList}</ul>`,
          text: `Hi ${member.name ?? "there"},\n\nHere are this week's top performers in ${house.name}:\n${textList}`,
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