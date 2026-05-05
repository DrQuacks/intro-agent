import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

function getModel() {
  const provider = process.env.MODEL_PROVIDER ?? "ollama";

  if (provider === "openai") {
    return new ChatOpenAI({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0,
    });
  }

  return new ChatOllama({
    model: process.env.OLLAMA_MODEL ?? "llama3.2",
    temperature: 0,
  });
}

export default getModel;