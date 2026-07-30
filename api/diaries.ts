const memoryDiaries: Record<string, any[]> = {};

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
      const diaries = memoryDiaries[userId] || [];
      return res.status(200).json({ status: "success", userId, diaries });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const { userId, diary } = body;
      const targetUid = userId || diary?.userId || "default_user";

      if (!memoryDiaries[targetUid]) {
        memoryDiaries[targetUid] = [];
      }

      const existingIdx = memoryDiaries[targetUid].findIndex(d => d.id === diary.id);
      if (existingIdx >= 0) {
        memoryDiaries[targetUid][existingIdx] = diary;
      } else {
        memoryDiaries[targetUid].push(diary);
      }

      return res.status(200).json({ status: "success", userId: targetUid, diary });
    }

    if (req.method === "DELETE") {
      const userId = (req.query?.userId as string) || "default_user";
      const diaryId = req.query?.diaryId as string;

      if (memoryDiaries[userId] && diaryId) {
        memoryDiaries[userId] = memoryDiaries[userId].filter(d => d.id !== diaryId);
      }

      return res.status(200).json({ status: "success", userId, diaryId });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error: any) {
    console.error("Diaries handler error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
