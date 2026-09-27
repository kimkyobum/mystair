const OGQ_API_KEY_FALLBACK = "ogqc_c3ad18e9908f34113fec37e0d6362884aa4b6e25f27a48b2283db046e0c6f238";

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
    const key = process.env.OGQ_API_KEY || OGQ_API_KEY_FALLBACK;
    const query = req.query?.query ? encodeURIComponent(String(req.query.query)) : "";
    const pageSize = req.query?.pageSize || 10;
    const targetUrl = `https://4th-ai-ogq.competition.ogq.me/v1/assets?pageSize=${pageSize}${query ? `&query=${query}` : ""}`;

    const response = await fetch(targetUrl, {
      headers: {
        "X-OGQ-API-KEY": key
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ elements: [] });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("OGQ Proxy Error on Vercel:", err);
    return res.status(200).json({ elements: [] });
  }
}
