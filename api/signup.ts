import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : undefined
}) : null;

if (pool) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      uid VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(err => console.error("Error creating users table in api/signup:", err));
}

const USERS_FILE = path.join(process.cwd(), "Data", "users_registry.json");

function getLocalUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading users_registry.json:", e);
  }
  return [];
}

function saveLocalUsers(users: any[]) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing users_registry.json:", e);
  }
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

    if (password.length < 8) {
      return res.status(400).json({ message: "비밀번호는 8글자 이상이어야 합니다." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const uid = "user_" + Math.random().toString(36).substring(2, 11);
    const displayName = normalizedEmail.split('@')[0];

    // 1. PostgreSQL check & insert
    if (pool) {
      try {
        const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (checkRes.rows.length > 0) {
          return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        }
        await pool.query('INSERT INTO users (email, password, uid, display_name) VALUES ($1, $2, $3, $4)', [
          normalizedEmail,
          password,
          uid,
          displayName
        ]);
        return res.status(200).json({ status: "success", uid, email: normalizedEmail, displayName });
      } catch (dbErr) {
        console.error("PG signup error:", dbErr);
      }
    }

    // 2. Local JSON file check
    const localUsers = getLocalUsers();
    if (localUsers.some(u => u.email === normalizedEmail)) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    const newUser = { uid, email: normalizedEmail, password, displayName };
    localUsers.push(newUser);
    saveLocalUsers(localUsers);

    return res.status(200).json({ status: "success", uid, email: normalizedEmail, displayName });
  } catch (error: any) {
    console.error("Signup handler error:", error);
    return res.status(500).json({ message: "회원가입 처리 중 오류가 발생했습니다.", details: error?.message });
  }
}
