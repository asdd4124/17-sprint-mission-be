import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// 다른 주소(프론트엔드)에서 오는 요청 허용
app.use(cors());

// 요청 body의 JSON을 req.body 객체로 변환
app.use(express.json());

// 서버 동작 확인 (GET /)
app.get("/", (req, res) => {
  res.send("판다마켓 API 서버");
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
