const memoryProfiles: Record<string, any> = {};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const userId = (req.query?.userId as string) || "default_user";
      const profile = memoryProfiles[userId] || null;
      return res.status(200).json({ status: "success", userId, profile });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const { userId, profile } = body;
      const targetUid = userId || profile?.uid || "default_user";

      memoryProfiles[targetUid] = {
        ...profile,
        uid: targetUid,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({ status: "success", userId: targetUid, profile: memoryProfiles[targetUid] });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error: any) {
    console.error("Profile handler error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
