export default function handler(_req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
}
