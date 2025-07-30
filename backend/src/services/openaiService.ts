import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ChoreCompletion = z.object({
  is_completed: z.boolean(),
  explanation: z.string(),
});

export async function compareImagesWithOpenAI(
  referenceUrl: string,
  proofUrl: string,
  title: string,
  description: string,
): Promise<typeof ChoreCompletion._type> {
  const response = await openai.chat.completions.parse({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that verifies household chores by comparing a clean reference image with a user-submitted proof image. Use visual reasoning to assess whether the proof image matches the expected clean/finished state.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Here is the reference image showing how the chore should look when completed:",
          },
          { type: "image_url", image_url: { url: referenceUrl } },
          {
            type: "text",
            text: "Here is the proof photo submitted by the user. Determine whether the chore was completed properly. Focus on visual cues like cleanliness, order, and completeness.",
          },
          { type: "image_url", image_url: { url: proofUrl } },
          {
            type: "text",
            text:
              "Chore: " +
              title +
              "\nDescription: " +
              description +
              "\n\nIs this chore completed correctly? Reply with:\n\n1. A short true/false answer (true if it is completed, false if it is not completed)\n2. One-sentence justification explaining why.\n3.",
          },
        ],
      },
    ],
    response_format: zodResponseFormat(ChoreCompletion, "chore_completion"),
  });

  const parsed = response.choices[0].message.parsed;
  console.log("AI Verification Response:", parsed);
  if (!parsed) {
    throw new Error("Failed to parse OpenAI response");
  }
  return parsed;
}
