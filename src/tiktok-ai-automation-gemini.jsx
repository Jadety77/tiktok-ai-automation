import { useState } from "react";

// ─── GEMINI API CALL ───────────────────────────────────────────────
async function callGemini(apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.replace(/```json|```/g, "").trim();
}

// ─── PROMPTS ───────────────────────────────────────────────────────
const TOPICS_PROMPT = `You are a social media trend analyst. Today's date is ${new Date().toDateString()}.

Identify 3 currently trending topics on Twitter/X that would make great TikTok video content.

Return ONLY a valid JSON array, no markdown, no backticks, no extra text:
[
  {
    "id": 1,
    "topic": "Topic Name Here",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "category": "Entertainment",
    "trendScore": 95,
    "why_trending": "One sentence explaining why this is trending right now"
  },
  { "id": 2, "topic": "...", "hashtags": ["#a","#b","#c"], "category": "Tech", "trendScore": 88, "why_trending": "..." },
  { "id": 3, "topic": "...", "hashtags": ["#x","#y","#z"], "category": "Pop Culture", "trendScore": 82, "why_trending": "..." }
]

Category must be one of: Entertainment, Tech, Lifestyle, News, Sports, Pop Culture`;

const DESCRIPTION_PROMPT = (topic) => `You are a viral TikTok content strategist and scriptwriter.

Topic: "${topic.topic}"
Why trending: ${topic.why_trending}
Hashtags: ${topic.hashtags.join(" ")}

Create a complete TikTok content package. Return ONLY valid JSON, no markdown, no backticks:
{
  "hook": "Attention-grabbing opening line for first 3 seconds, max 15 words",
  "videoTitle": "Catchy TikTok video title",
  "description": "Full TikTok caption 150-200 words. Explain topic clearly, why it matters, what viewers learn. Include call to action.",
  "script": "Full 60-second video script with [PAUSE] [SHOW TEXT] [B-ROLL] stage directions. Natural conversational TikTok tone.",
  "talkingPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "thumbnailIdea": "Detailed thumbnail concept description",
  "bestPostTime": "Best time to post for maximum reach",
  "estimatedViews": "Estimated view range",
  "contentTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

// ─── COLORS ────────────────────────────────────────────────────────
const CAT_COLORS = {
  Entertainment: "#FF6B6B",
  Tech: "#4ECDC4",
  Lifestyle: "#A78BFA",
  News: "#F59E0B",
  Sports: "#34D399",
  "Pop Culture": "#F472B6",
};
const getColor = (cat) => CAT_COLORS[cat] || "#6B7280";

// ─── API KEY GATE ──────────────────────────────────────────────────
function ApiKeyGate({ onSave }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    if (!val.trim()) return setErr("Please enter your API key.");
    setTesting(true);
    setErr("");
    try {
      await callGemini(val.trim(), "Say hello in one word.");
      onSave(val.trim());
    } catch (e) {
      setErr("Invalid key or API error: " + e.message);
    }
    setTesting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Enter Your Gemini API Key</div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            This app uses Google's Gemini AI — it's <strong style={{ color: "#34D399" }}>100% free</strong>, no credit card needed.
          </p>
        </div>

        <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ color: "#34D399", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>How to get your free key (2 minutes):</div>
          <ol style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0, paddingLeft: 18, lineHeight: 2 }}>
            <li>Go to <strong style={{ color: "#fff" }}>aistudio.google.com</strong></li>
            <li>Sign in with your Google account</li>
            <li>Click <strong style={{ color: "#fff" }}>"Get API Key"</strong> → <strong style={{ color: "#fff" }}>"Create API key"</strong></li>
            <li>Copy and paste it below</li>
          </ol>
        </div>

        <input
          type="password"
          placeholder="Paste your Gemini API key here..."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "rgba(255,255,255,0.06)",
            border: err ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            color: "#fff",
            fontSize: 14,
            outline: "none",
            marginBottom: err ? 8 : 16,
            boxSizing: "border-box",
            fontFamily: "monospace",
          }}
        />
        {err && <div style={{ color: "#FCA5A5", fontSize: 12, marginBottom: 12 }}>⚠️ {err}</div>}

        <button
          onClick={handleSave}
          disabled={testing}
          style={{
            width: "100%",
            padding: "14px 0",
            background: testing ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #4285F4, #34A853)",
            border: "none",
            borderRadius: 10,
            color: testing ? "#666" : "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: testing ? "default" : "pointer",
          }}
        >
          {testing ? "⏳ Testing key..." : "✅ Save & Continue"}
        </button>

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
          Your key is stored only in your browser's memory and never sent anywhere except Google's API.
        </p>
      </div>
    </div>
  );
}

// ─── TOPIC CARD ────────────────────────────────────────────────────
function TopicCard({ topic, index, onGenerate, isLoading, isGenerated }) {
  const color = getColor(topic.category);
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color, borderRadius: "16px 0 0 16px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ background: color, color: "#fff", borderRadius: 8, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          {topic.category}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 10px" }}>
          <span>🔥</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{topic.trendScore}</span>
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>
        #{index + 1} {topic.topic}
      </div>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{topic.why_trending}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {topic.hashtags.map((tag) => (
          <span key={tag} style={{ background: "rgba(255,255,255,0.08)", color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{tag}</span>
        ))}
      </div>
      <button
        onClick={() => onGenerate(topic)}
        disabled={isLoading || isGenerated}
        style={{
          width: "100%", padding: "12px 0",
          background: isGenerated ? "rgba(52,211,153,0.15)" : isLoading ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${color}, ${color}cc)`,
          border: isGenerated ? "1px solid #34D399" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          color: isGenerated ? "#34D399" : isLoading ? "#888" : "#fff",
          fontWeight: 700, fontSize: 14,
          cursor: isLoading || isGenerated ? "default" : "pointer",
        }}
      >
        {isGenerated ? "✅ Content Generated" : isLoading ? "⏳ Generating..." : "⚡ Generate Content"}
      </button>
    </div>
  );
}

// ─── CONTENT PANEL ─────────────────────────────────────────────────
function ContentPanel({ content, topic }) {
  const [tab, setTab] = useState("description");
  const [copied, setCopied] = useState(null);
  const color = getColor(topic.category);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const download = () => {
    const text = `# ${content.videoTitle}
📅 ${new Date().toLocaleDateString()} | 📂 ${topic.category}
⏰ ${content.bestPostTime} | 📈 ${content.estimatedViews}

## 🎯 HOOK
${content.hook}

## 📝 CAPTION
${content.description}

## 🎬 SCRIPT
${content.script}

## 💡 TALKING POINTS
${content.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## 🖼️ THUMBNAIL
${content.thumbnailIdea}

## 📌 HASHTAGS
${topic.hashtags.join(" ")}

## ✅ TIPS
${content.contentTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.topic.replace(/\s+/g, "_")}_TikTok.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: "description", label: "📝 Caption" },
    { key: "script", label: "🎬 Script" },
    { key: "talking", label: "💡 Points" },
    { key: "tips", label: "✅ Tips" },
  ];

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color, fontWeight: 800, fontSize: 15 }}>{content.videoTitle}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{content.bestPostTime} · {content.estimatedViews}</div>
          </div>
          <button onClick={download} style={{ background: color, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ⬇ Download
          </button>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${color}` }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>HOOK (0–3 SEC)</div>
          <div style={{ color: "#fff", fontSize: 14, fontStyle: "italic" }}>"{content.hook}"</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "12px 8px",
            background: tab === t.key ? "rgba(255,255,255,0.06)" : "transparent",
            border: "none",
            borderBottom: tab === t.key ? `2px solid ${color}` : "2px solid transparent",
            color: tab === t.key ? "#fff" : "rgba(255,255,255,0.4)",
            fontWeight: tab === t.key ? 700 : 400,
            fontSize: 12, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        {tab === "description" && (
          <div>
            <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>{content.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {topic.hashtags.map((tag) => (
                <span key={tag} style={{ background: `${color}22`, color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <button onClick={() => copy(content.description + "\n\n" + topic.hashtags.join(" "), "desc")}
              style={{ marginTop: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
              {copied === "desc" ? "✅ Copied!" : "📋 Copy Caption"}
            </button>
          </div>
        )}
        {tab === "script" && (
          <div>
            <pre style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 13, whiteSpace: "pre-wrap", fontFamily: "monospace", background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              {content.script}
            </pre>
            <button onClick={() => copy(content.script, "script")}
              style={{ marginTop: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
              {copied === "script" ? "✅ Copied!" : "📋 Copy Script"}
            </button>
          </div>
        )}
        {tab === "talking" && (
          <div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 12 }}>🖼️ {content.thumbnailIdea}</div>
            {content.talkingPoints.map((point, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ background: color, color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{point}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "tips" && (
          <div>
            {content.contentTips.map((tip, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", marginBottom: 10, display: "flex", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{["🎯", "🎬", "📱"][i] || "✨"}</span>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{tip}</p>
              </div>
            ))}
            <div style={{ marginTop: 16, background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>📁 Save to Google Drive</div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Click <strong style={{ color: "#fff" }}>Download</strong> above → upload the .txt file to Google Drive folder:{" "}
                <code style={{ color }}>TikTok Content / {new Date().toLocaleDateString()}</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [phase, setPhase] = useState("idle");
  const [topics, setTopics] = useState([]);
  const [contents, setContents] = useState({});
  const [loadingTopic, setLoadingTopic] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [error, setError] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog((p) => [{ time: new Date().toLocaleTimeString(), msg }, ...p.slice(0, 9)]);

  if (!apiKey) return <ApiKeyGate onSave={setApiKey} />;

  const fetchTopics = async () => {
    setPhase("fetching_topics");
    setError(null);
    setTopics([]);
    setContents({});
    setSelectedTopic(null);
    addLog("🔍 Fetching trending Twitter topics via Gemini...");
    try {
      const raw = await callGemini(apiKey, TOPICS_PROMPT);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length < 3) throw new Error("Unexpected response format");
      setTopics(parsed.slice(0, 3));
      setPhase("topics_ready");
      setLastRun(new Date());
      addLog(`✅ Found ${parsed.length} trending topics!`);
    } catch (e) {
      setError("Failed to fetch topics: " + e.message);
      setPhase("idle");
      addLog("❌ " + e.message);
    }
  };

  const generateContent = async (topic) => {
    setLoadingTopic(topic.id);
    addLog(`⚡ Generating content for "${topic.topic}"...`);
    try {
      const raw = await callGemini(apiKey, DESCRIPTION_PROMPT(topic));
      const parsed = JSON.parse(raw);
      setContents((p) => ({ ...p, [topic.id]: parsed }));
      setSelectedTopic(topic);
      addLog(`✅ Content ready for "${topic.topic}"!`);
    } catch (e) {
      setError("Content generation failed: " + e.message);
      addLog("❌ " + e.message);
    }
    setLoadingTopic(null);
  };

  const generateAll = async () => {
    setPhase("generating");
    for (const topic of topics) {
      if (!contents[topic.id]) await generateContent(topic);
    }
    setPhase("done");
    addLog("🎉 All content generated!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #0D0D1A 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 32px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "linear-gradient(135deg, #FF006E, #8338EC)", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, background: "linear-gradient(90deg, #FF006E, #8338EC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                TikTok AI Automation
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Powered by Google Gemini · Free</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {lastRun && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Last run: {lastRun.toLocaleTimeString()}</span>}
            <button
              onClick={() => { setApiKey(""); setPhase("idle"); setTopics([]); setContents({}); }}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
            >🔑 Change Key</button>
            <button
              onClick={fetchTopics}
              disabled={phase === "fetching_topics" || phase === "generating"}
              style={{
                background: phase === "fetching_topics" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #4285F4, #34A853)",
                border: "none", borderRadius: 10, padding: "10px 20px",
                color: phase === "fetching_topics" ? "#666" : "#fff",
                fontWeight: 700, fontSize: 14, cursor: phase === "fetching_topics" ? "default" : "pointer",
              }}
            >
              {phase === "fetching_topics" ? "⏳ Fetching..." : "🔄 Fetch Today's Trends"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Steps */}
        <div style={{ display: "flex", marginBottom: 32, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {[
            { n: 1, label: "Fetch Twitter Trends", icon: "🐦", done: topics.length > 0 },
            { n: 2, label: "AI Generates Content", icon: "🤖", done: Object.keys(contents).length > 0 },
            { n: 3, label: "Save to Google Drive", icon: "📁", done: false },
            { n: 4, label: "Upload to TikTok", icon: "📱", done: false },
          ].map((s, i, arr) => (
            <div key={s.n} style={{ flex: 1, padding: "14px 12px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", background: s.done ? "rgba(52,211,153,0.05)" : "transparent", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.done ? "#34D399" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: s.done ? "#fff" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                {s.done ? "✓" : s.n}
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 1 }}>Step {s.n}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.done ? "#34D399" : "rgba(255,255,255,0.6)" }}>{s.icon} {s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#FCA5A5", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Idle */}
        {phase === "idle" && topics.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🚀</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 10, background: "linear-gradient(90deg, #4285F4, #34A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ready to Go — Gemini Connected ✅
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.7 }}>
              Click <strong style={{ color: "#fff" }}>Fetch Today's Trends</strong> to find 3 trending Twitter topics and generate full TikTok content packages — scripts, captions, hashtags and more.
            </p>
          </div>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>🔥 Today's Trending Topics</div>
              {Object.keys(contents).length < 3 && (
                <button onClick={generateAll} disabled={phase === "generating"}
                  style={{ background: "linear-gradient(135deg, #FF006E, #8338EC)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: phase === "generating" ? 0.6 : 1 }}>
                  {phase === "generating" ? "⏳ Generating all..." : "⚡ Generate All Content"}
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
              {topics.map((topic, i) => (
                <div key={topic.id} onClick={() => contents[topic.id] && setSelectedTopic(topic)}
                  style={{ cursor: contents[topic.id] ? "pointer" : "default", outline: selectedTopic?.id === topic.id ? `2px solid ${getColor(topic.category)}` : "2px solid transparent", borderRadius: 18 }}>
                  <TopicCard topic={topic} index={i} onGenerate={generateContent} isLoading={loadingTopic === topic.id} isGenerated={!!contents[topic.id]} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Content Panel */}
        {selectedTopic && contents[selectedTopic.id] && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              📋 Content Package: <span style={{ color: getColor(selectedTopic.category) }}>{selectedTopic.topic}</span>
            </div>
            <ContentPanel content={contents[selectedTopic.id]} topic={selectedTopic} />
          </div>
        )}

        {/* Next Steps */}
        {Object.keys(contents).length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "#fff" }}>📱 Upload to TikTok — Next Steps</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { n: "1", title: "Download Files", desc: "Click Download on each topic card", color: "#FF6B6B" },
                { n: "2", title: "Save to Google Drive", desc: `Upload to: TikTok Content / ${new Date().toLocaleDateString()}`, color: "#4ECDC4" },
                { n: "3", title: "Record Video", desc: "Use the script to film your 60-sec TikTok", color: "#A78BFA" },
                { n: "4", title: "Post on TikTok", desc: "Paste the generated caption + hashtags", color: "#F59E0B" },
              ].map((s) => (
                <div key={s.n} style={{ background: `${s.color}11`, border: `1px solid ${s.color}33`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: s.color, fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{s.n}.</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div style={{ marginTop: 24, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Activity Log</div>
            {log.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, opacity: 1 - i * 0.08 }}>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>{e.time}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{e.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }`}</style>
    </div>
  );
}
