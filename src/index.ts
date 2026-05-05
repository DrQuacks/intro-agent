import "dotenv/config";
import { createAgent, tool } from "langchain";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import getModel from "./getModel";


type Pediatrician = {
  name: string;
  address: string;
  phone: string;
  rating: number;
  driveMinutes: number;
};

const mockPediatricians: Pediatrician[] = [
  {
    name: "Bay Area Pediatrics",
    address: "3700 California St, San Francisco, CA",
    phone: "415-555-1000",
    rating: 4.7,
    driveMinutes: 14,
  },
  {
    name: "Golden Gate Pediatric Care",
    address: "1 Shrader St, San Francisco, CA",
    phone: "415-555-2000",
    rating: 4.5,
    driveMinutes: 22,
  },
  {
    name: "Peninsula Children’s Clinic",
    address: "San Mateo, CA",
    phone: "650-555-3000",
    rating: 4.8,
    driveMinutes: 41,
  },
];

const findPediatricians = tool(
  async ({ address, maxDriveMinutes }) => {
    const results = mockPediatricians
      .filter((p) => p.driveMinutes <= maxDriveMinutes)
      .sort((a, b) => a.driveMinutes - b.driveMinutes);

    return JSON.stringify({
      originAddress: address,
      maxDriveMinutes,
      results,
    });
  },
  {
    name: "find_pediatricians_within_drive_time",
    description:
      "Find pediatricians near a user's address and return only those within a maximum driving time.",
    schema: z.object({
      address: z.string().describe("The user's starting address"),
      maxDriveMinutes: z.number().default(30),
    }),
  }
);


const agent = createAgent({
  model: getModel(),
  tools: [findPediatricians],
  systemPrompt: `
You are a healthcare location search assistant.

Rules:
- Use the pediatrician search tool whenever the user asks for pediatricians by location or drive time.
- Do not invent pediatricians.
- Return results sorted by shortest drive time.
- Include name, address, phone, rating, and estimated drive time.
- If no results are found, say that clearly.
`,
});

async function main() {
  const userInput =
    process.argv.slice(2).join(" ") ||
    "Find pediatricians within 30 minutes of 123 Main St, San Francisco";

  const result = await agent.invoke({
    messages: [{ role: "user", content: userInput }],
  });

  console.log(result.messages.at(-1)?.content);

  for (const message of result.messages) {
    console.log("\n--- MESSAGE ---");
    console.log(message);
  }

  console.log("\n--- FINAL ANSWER ---");
  console.log(result.messages.at(-1)?.content);
}

main().catch((error) => {
  console.error("Agent failed:", error);
  process.exit(1);
});