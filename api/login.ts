import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : undefined
}) : null;

// Safe fallback storage in /tmp or in-memory (strictly never touching /Data)
const USERS_FILE = path.join("/tmp", "users_registry.json");
const inMemoryUsers: any[] = [];

function getLocalUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      if (Array.isArray(fileData)) return fileData;
    }
  } catch (e) {
    // Ignore read errors
  }
  return inMemoryUsers;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. PostgreSQL check
    if (pool) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          if (user.password === password) {
            return res.status(200).json({
              status: "success",
              uid: user.uid,
              email: user.email,
              displayName: user.display_name
            });
          } else {
            return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
          }
        }
      } catch (dbErr) {
        console.error("PG login error:", dbErr);
      }
    }

    // 2. Local fallback check
    const localUsers = getLocalUsers();
    const user = localUsers.find(u => u.email === normalizedEmail);
    if (user) {
      if (user.password === password) {
        return res.status(200).json({
          status: "success",
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0]
        });
      } else {
        return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
      }
    }

    return res.status(400).json({ message: "가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다." });
  } catch (error: any) {
    console.error("Login handler error:", error);
    return res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
  }
}
