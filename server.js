// ------------------------------
// 기본 서버 설정 및 모듈 로드
// ------------------------------
import express from "express";
import fetch from "node-fetch";      // 서버 측에서 Gemini API 호출할 때 사용
import cors from "cors";
import dotenv from "dotenv";         // 환경변수 관리
import mysql from "mysql2/promise";  // MySQL 비동기 연결을 위한 모듈

// 라우터 모듈 (역할별로 분리)
import api from "./routes/index.js";
import signupRouter from "./routes/signup.js";
import userRouter from './routes/user.js';
import loginRouter from "./routes/login.js";
import chatRouter from "./routes/chat.js";

dotenv.config(); // .env 파일 로드

const app = express();
app.use(cors());            // CORS 에러 방지
app.use(express.json());    // JSON 바디 파싱


// ------------------------------
// MySQL 연결 설정
// ------------------------------
// 발표 포인트:
// - DB 연결을 서버 시작 시점에 1회만 설정
// - mysql2/promise 사용으로 async/await 가능
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
  // 발표 포인트: 연결 실패 시 서버 종료 또는 에러 로그 필요
  console.error("MySQL connection failed:", err);
}


// ------------------------------
// 라우팅 구조
// ------------------------------
// 발표 포인트:
// - 역할별 라우터 분리: 유지보수 용이
// - /api 아래에 모든 비즈니스 로직을 모아둠
app.use('/api', api);
app.use("/api/signup", signupRouter); // 회원가입
app.use("/api/login", loginRouter);   // 로그인
app.use("/api/chat", chatRouter);     // 채팅 기능


// ------------------------------
// Gemini API Proxy 엔드포인트
// ------------------------------
// 발표 포인트:
// - 프론트엔드에서 직접 Gemini API를 호출하지 않고
//   서버가 중간에서 Proxy 역할 수행 → API KEY 보안 강화
// - 요청/응답 구조를 직접 핸들링할 수 있음
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: "API 키가 없습니다" });
  }
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    // Gemini API 서버로 직접 HTTP POST 요청
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
    
    // Gemini API에서 오류가 발생하면 그대로 응답 반환
    if (!response.ok) {
      console.error("API error:", data);
      return res.status(response.status).json(data);
    }
    
    // 정상적인 모델 응답 반환
    res.json(data);

  } catch (err) {
    console.error("Failed to Gemini:", err);
    res.status(500).json({ error: "Failed to Gemini", details: err.message });
  }
});


// ------------------------------
// 서버 포트 설정 및 실행
// ------------------------------
// 발표 포인트:
// - 프론트와 포트를 분리하여 CORS 문제 방지
// - 백엔드 API는 3001 포트에서 작동
const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
