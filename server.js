import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { exec } from 'child_process'

// json-server를 3000 포트로 별도 실행
exec('npx json-server db.json --port 3000', (err) => {
    if (err) console.error('json-server error:', err)
})

const app = express()

app.use(cors({
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}))

// 모든 요청을 json-server로 프록시
app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true
}))

app.listen(8080, () => {
    console.log('Server running on port 8080')
})
