export default async function handler(req: any, res: any) {
  // Set CORS headers
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
    const uid = "user_" + Math.random().toString(36).substring(2, 11);

    return res.status(200).json({
      status: "success",
      uid,
      email: normalizedEmail,
      displayName: normalizedEmail.split('@')[0]
    });
  } catch (error: any) {
    console.error("Login handler error:", error);
    return res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
  }
}
