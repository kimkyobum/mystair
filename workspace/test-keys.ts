import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const keys = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_API_KEY2: process.env.GEMINI_API_KEY2,
  GEMINI_API_KEY3: process.env.GEMINI_API_KEY3,
  GEMINI_API_KEY4: process.env.GEMINI_API_KEY4,
  VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
};

const models = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-3.6-flash"
];

async function runDiagnostics() {
  console.log("Starting Gemini API Keys Diagnostics...");
  
  for (const [keyName, apiKey] of Object.entries(keys)) {
    if (!apiKey) {
      console.log(`- ${keyName}: [NOT CONFIGURED]`);
      continue;
    }
    
    console.log(`\nTesting ${keyName} (${apiKey.substring(0, 6)}...):`);
    
    for (const model of models) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model,
          contents: "Hello, reply with one word.",
        });
        console.log(`  -> Model ${model}: [SUCCESS] (Response: "${response.text?.trim()}")`);
      } catch (err: any) {
        console.log(`  -> Model ${model}: [FAILED] - ${err.message || err}`);
      }
    }
  }
}

runDiagnostics();
