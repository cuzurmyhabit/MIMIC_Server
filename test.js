import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const prompt = "안녕하세요";

const API_KEY = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${API_KEY}`;

const run = async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: prompt,
      temperature: 0.7,
      maxOutputTokens: 256
    }),
  });
  const data = await res.json();
  console.log(data);
};

run();
