import "dotenv/config";
import { prisma } from "../lib/prisma";
import { sendMail } from "../lib/mailer";

// worker sends weekly digest emails to house members
async function sendWeeklyDigest() {
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
      .map((u: { name: string | null; points: number }, idx: number) =>
        `<li>${idx + 1}. ${u.name ?? "User"} - ${u.points} pts</li>`
      )
      .join("");

    const textList = leaderboard
      .map((u: { name: string | null; points: number }, idx: number) =>
        `${idx + 1}. ${u.name ?? "User"} - ${u.points} pts`
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

sendWeeklyDigest()
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });