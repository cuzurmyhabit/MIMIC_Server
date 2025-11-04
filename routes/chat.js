import express from "express";
import { db } from "../db.js";

const router = express.Router();

// 채팅 저장
router.post("/", async (req, res) => {
  const { session_id, sender, text } = req.body;

  if (!session_id || !sender || !text) {
    return res.status(400).json({ error: "필수 데이터가 누락되었습니다." });
  }

  try {
    await db.execute("INSERT INTO chat (text) VALUES (?)", [text]);
    res.json({ message: "채팅 저장 성공" });
  } catch (err) {
    console.error("채팅 저장 실패:", err);
    res.status(500).json({ error: "DB 저장 실패" });
  }
});

// 세션별 대화 불러오기
router.get("/:session_id", async (req, res) => {
  const { session_id } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM chat WHERE session_id = ? ORDER BY created_at ASC",
      [session_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("채팅 불러오기 실패:", err);
    res.status(500).json({ error: "DB 조회 실패" });
  }
});

export default router;