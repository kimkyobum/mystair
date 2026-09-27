import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// Voice configuration map
export const VOICE_PROFILES: Record<string, { voice: string; pitch?: string; rate?: string; label: string }> = {
  injoon: {
    voice: "ko-KR-InJoonNeural",
    label: "이인준 (40대 신뢰감 있는 남성 면접관)"
  },
  bongjin: {
    voice: "ko-KR-BongJinNeural",
    label: "신봉진 (50대 묵직한 베테랑 남성 면접관)"
  },
  hyunsu: {
    voice: "ko-KR-HyunsuNeural",
    label: "김현수 (30대 스마트하고 또렷한 남성 면접관)"
  },
  sunhi: {
    voice: "ko-KR-SunHiNeural",
    label: "박선희 (30대 단정하고 명확한 여성 면접관)"
  },
  jimin: {
    voice: "ko-KR-JiMinNeural",
    label: "정지민 (40대 부드럽고 차분한 여성 면접관)"
  },
  seohyeon: {
    voice: "ko-KR-SeoHyeonNeural",
    label: "강서현 (20대 정중하고 세련된 여성 면접관)"
  },
  strict_bongjin: {
    voice: "ko-KR-BongJinNeural",
    pitch: "-6Hz",
    rate: "-8%",
    label: "최준혁 (엄격한 50대 압박 면접관)"
  },
  gentle_injoon: {
    voice: "ko-KR-InJoonNeural",
    pitch: "+4Hz",
    rate: "-4%",
    label: "한도윤 (따뜻하고 편안한 인성 면접관)"
  },
  energetic_hyunsu: {
    voice: "ko-KR-HyunsuNeural",
    pitch: "+2Hz",
    rate: "+8%",
    label: "이지훈 (열정적인 실무 기술 면접관)"
  },
  professional_sunhi: {
    voice: "ko-KR-SunHiNeural",
    pitch: "+0Hz",
    rate: "-2%",
    label: "오윤아 (냉철하고 꼼꼼한 인사총괄 면접관)"
  }
};

const ttsAudioCache = new Map<string, Buffer>();

async function generateInterviewAudio(text: string, voiceKey: string = "injoon"): Promise<Buffer> {
  const profile = VOICE_PROFILES[voiceKey] || VOICE_PROFILES.injoon;
  const cacheKey = `${voiceKey}:${text}`;
  
  if (ttsAudioCache.has(cacheKey)) {
    return ttsAudioCache.get(cacheKey)!;
  }

  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(profile.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const options: any = {};
    if (profile.pitch) options.pitch = profile.pitch;
    if (profile.rate) options.rate = profile.rate;

    const { audioStream } = tts.toStream(text, Object.keys(options).length > 0 ? options : undefined);
    
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timer = setTimeout(() => {
        try { tts.close(); } catch {}
        reject(new Error("TTS generation timeout"));
      }, 9500);

      audioStream.on("data", (c: Buffer) => chunks.push(c));
      audioStream.on("end", () => {
        clearTimeout(timer);
        try { tts.close(); } catch {}
        resolve(Buffer.concat(chunks));
      });
      audioStream.on("error", (err: any) => {
        clearTimeout(timer);
        try { tts.close(); } catch {}
        reject(err);
      });
    });

    if (ttsAudioCache.size > 200) {
      const first = ttsAudioCache.keys().next().value;
      if (first) ttsAudioCache.delete(first);
    }
    ttsAudioCache.set(cacheKey, audioBuffer);
    return audioBuffer;
  } catch (err) {
    try { tts.close(); } catch {}
    throw err;
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
    return res.status(200).end();
  }

  // GET: /api/interview-tts?text=...&voice=...
  if (req.method === "GET") {
    try {
      let rawText = String(req.query?.text || "").trim();
      try { rawText = decodeURIComponent(rawText); } catch {}
      if (!rawText) {
        return res.status(400).send("text query parameter required");
      }
      const voice = String(req.query?.voice || "injoon");
      const audio = await generateInterviewAudio(rawText, voice);
      
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(audio);
    } catch (err: any) {
      console.error("Interview TTS GET error on Vercel:", err?.message || err);
      return res.status(500).json({ error: "TTS generation failed", message: err?.message });
    }
  }

  // POST: /api/interview-tts { text: "...", voice: "..." }
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const { text, voice = "injoon" } = body;
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: "text is required" });
      }

      const audio = await generateInterviewAudio(String(text).trim(), voice);
      const profile = VOICE_PROFILES[voice] || VOICE_PROFILES.injoon;

      return res.status(200).json({
        audioBase64: audio.toString("base64"),
        format: "audio/mp3",
        voiceUsed: profile.label
      });
    } catch (err: any) {
      console.error("Interview TTS POST error on Vercel:", err?.message || err);
      return res.status(500).json({ error: "TTS generation failed", message: err?.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
