import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: "API 키가 없습니다" });
  }
  
  // ✅ 사용 가능한 모델: gemini-2.5-flash
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();
    console.log("📥 Gemini API 응답:", JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error("❌ API 에러:", data);
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (err) {
    console.error("❌ Gemini 호출 실패:", err);
    res.status(500).json({ error: "Gemini 호출 실패", details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`✅ Proxy server running on http://localhost:${PORT}`));