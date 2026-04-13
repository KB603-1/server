import express from "express";
import rateLimit from 'express-rate-limit'
import cors from "cors";
import {createProxyMiddleware} from "http-proxy-middleware";
import {exec} from "child_process";

// json-server를 3000 포트로 별도 실행
exec("npx json-server db.json --port 3000", (err) => {
    if (err) console.error("json-server error:", err);
});

const app = express();

const allowedOrigin = process.env.ORIGIN;

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    message: {message: "Too Many Requests"},
});

// 모든 요청에 적용
app.use(limiter);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    // origin 없거나, 허용된 origin이 아니면 차단
    if (!origin || origin !== allowedOrigin) {
        return res.status(403).json({message: "Forbidden: Invalid Origin"});
    }

    next();
});

app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

// 모든 요청을 json-server로 프록시
app.use("/", createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true
}));

app.listen(8080, () => {
    console.log("Server running on port 8080");
});
