import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; 
import api from "./routes/index.js";
import signupRouter from "./routes/signup.js";
import userRouter from './routes/user.js';
import loginRouter from "./routes/login.js";
import chatRouter from "./routes/chat.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



//MySQL 연결 설정 (연동 준비)
const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mydatabase",
});

try {
  await db.connect();
  console.log("MySQL connected successfully!");
} catch (err) {
  console.error("MySQL connection failed:", err);
}



// api 처리는 './routes/index'에서 일괄처리
app.use('/api', api);

// server port 4000 할당
// 클라이언트와 다른 번호로 충돌나지 않도록
app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/chat", chatRouter);


// Gemini API 엔드포인트
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: "API 키가 없습니다" });
  }
  
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
    console.log("Gemini API 응답:", JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error("API error:", data);
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (err) {
    console.error("Failed to Gemini:", err);
    res.status(500).json({ error: "Failed to Gemini", details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));






