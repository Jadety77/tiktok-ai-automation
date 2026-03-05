import { useState, useEffect, useCallback } from "react";

const TOPICS_PROMPT = `You are a social media trend analyst. Today's date is ${new Date().toDateString()}.

Your task: Identify 3 currently trending topics on Twitter/X that would make great TikTok video content.

Return ONLY a valid JSON array (no markdown, no backticks, no explanation) with exactly this structure:
[
  {
    "id": 1,
    "topic": "Topic Name Here",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "category": "Entertainment|Tech|Lifestyle|News|Sports|Pop Culture",
    "trendScore": 95,
    "why_trending": "One sentence explaining why this is trending right now"
  },
  { "id": 2, ... },
  { "id": 3, ... }
]`;

const DESCRIPTION_PROMPT = (topic) => `You are a viral TikTok content strategist and scriptwriter.

Topic: "${topic.topic}"
Why it's trending: ${topic.why_trending}
Hashtags: ${topic.hashtags.join(" ")}

Create a complete TikTok video content package. Return ONLY valid JSON (no markdown, no backticks):
{
  "hook": "Attention-grabbing opening line (first 3 seconds, max 15 words)",
  "videoTitle": "Catchy TikTok video title",
  "description": "Full video description for TikTok caption (150-200 words). Explain the topic clearly, why it matters, what viewers will learn. Include a call to action.",
  "script": "Full 60-second video script with [PAUSE], [SHOW TEXT], [B-ROLL] directions. Natural, conversational TikTok tone.",
  "talkingPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "thumbnailIdea": "Detailed description of thumbnail concept",
  "bestPostTime": "Best time to post for maximum reach",
  "estimatedViews": "Estimated view range based on trend strength",
  "contentTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

const categoryColors = {
  Entertainment: { bg: "#FF6B6B", light: "#FFE5E5" },
  Tech: { bg: "#4ECDC4", light: "#E5FFFE" },
  Lifestyle: { bg: "#A78BFA", light: "#EDE9FE" },
  News: { bg: "#F59E0B", light: "#FEF3C7" },
  Sports: { bg: "#34D399", light: "#ECFDF5" },
  "Pop Culture": { bg: "#F472B6", light: "#FCE7F3" },
};

const getCategoryStyle = (cat) =>
  categoryColors[cat] || { bg: "#6B7280", light: "#F3F4F6" };

function TopicCard({ topic, index, onGenerate, isLoading, isGenerated }) {
  const style = getCategoryStyle(topic.category);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 16,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: style.bg,
          borderRadius: "16px 0 0 16px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            background: style.bg,
            color: "#fff",
            borderRadius: 8,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {topic.category}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "4px 10px",
          }}
        >
          <span style={{ fontSize: 14 }}>🔥</span>
          <span
            style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}
          >
            {topic.trendScore}
          </span>
        </div>
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 8,
          lineHeight: 1.3,
          fontFamily: "'Bebas Neue', 'Impact', sans-serif",
          letterSpacing: 0.5,
        }}
      >
        #{index + 1} {topic.topic}
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {topic.why_trending}
      </p>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}
      >
        {topic.hashtags.map((tag) => (
          <span
            key={tag}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: style.bg,
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={() => onGenerate(topic)}
        disabled={isLoading || isGenerated}
        style={{
          width: "100%",
          padding: "12px 0",
          background: isGenerated
            ? "rgba(52,211,153,0.15)"
            : isLoading
            ? "rgba(255,255,255,0.05)"
            : `linear-gradient(135deg, ${style.bg}, ${style.bg}cc)`,
          border: isGenerated
            ? "1px solid #34D399"
            : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          color: isGenerated ? "#34D399" : isLoading ? "#888" : "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: isLoading || isGenerated ? "default" : "pointer",
          transition: "all 0.3s ease",
          letterSpacing: 0.5,
        }}
      >
        {isGenerated
          ? "✅ Content Generated"
          : isLoading
          ? "⏳ Generating..."
          : "⚡ Generate Content"}
      </button>
    </div>
  );
}

function ContentPanel({ content, topic }) {
  const [activeTab, setActiveTab] = useState("description");
  const [copied, setCopied] = useState(null);

  const style = getCategoryStyle(topic.category);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadContent = () => {
    const fullContent = `# ${content.videoTitle}
📅 Generated: ${new Date().toLocaleDateString()}
🏷️ Topic: ${topic.topic}
📂 Category: ${topic.category}
⏰ Best Post Time: ${content.bestPostTime}
📈 Est. Views: ${content.estimatedViews}

---

## 🎯 HOOK (First 3 Seconds)
${content.hook}

---

## 📝 TIKTOK CAPTION / DESCRIPTION
${content.description}

---

## 🎬 60-SECOND SCRIPT
${content.script}

---

## 💡 KEY TALKING POINTS
${content.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

---

## 🖼️ THUMBNAIL IDEA
${content.thumbnailIdea}

---

## 📌 HASHTAGS
${topic.hashtags.join(" ")}

---

## ✅ CONTENT TIPS
${content.contentTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}
`;
    const blob = new Blob([fullContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.topic.replace(/\s+/g, "_")}_TikTok_Content.txt`;
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
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${style.bg}33, ${style.bg}11)`,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{ color: style.bg, fontWeight: 800, fontSize: 15 }}
            >
              {content.videoTitle}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {content.bestPostTime} · {content.estimatedViews} est. views
            </div>
          </div>
          <button
            onClick={downloadContent}
            style={{
              background: style.bg,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ⬇ Download
          </button>
        </div>

        {/* Hook */}
        <div
          style={{
            marginTop: 12,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            borderLeft: `3px solid ${style.bg}`,
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            HOOK (0–3 SEC)
          </div>
          <div style={{ color: "#fff", fontSize: 14, fontStyle: "italic" }}>
            "{content.hook}"
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: "12px 8px",
              background: activeTab === tab.key ? "rgba(255,255,255,0.06)" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? `2px solid ${style.bg}` : "2px solid transparent",
              color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.4)",
              fontWeight: activeTab === tab.key ? 700 : 400,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20, position: "relative" }}>
        {activeTab === "description" && (
          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.8,
                fontSize: 14,
                whiteSpace: "pre-wrap",
              }}
            >
              {content.description}
            </p>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {topic.hashtags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: `${style.bg}22`,
                    color: style.bg,
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  content.description + "\n\n" + topic.hashtags.join(" "),
                  "desc"
                )
              }
              style={{
                marginTop: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {copied === "desc" ? "✅ Copied!" : "📋 Copy Caption"}
            </button>
          </div>
        )}

        {activeTab === "script" && (
          <div>
            <pre
              style={{
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.8,
                fontSize: 13,
                whiteSpace: "pre-wrap",
                fontFamily: "'Courier New', monospace",
                background: "rgba(0,0,0,0.2)",
                padding: 16,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {content.script}
            </pre>
            <button
              onClick={() => copyToClipboard(content.script, "script")}
              style={{
                marginTop: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {copied === "script" ? "✅ Copied!" : "📋 Copy Script"}
            </button>
          </div>
        )}

        {activeTab === "talking" && (
          <div>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              🖼️ Thumbnail: {content.thumbnailIdea}
            </div>
            {content.talkingPoints.map((point, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    background: style.bg,
                    color: "#fff",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {point}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tips" && (
          <div>
            {content.contentTips.map((tip, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 10,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 16 }}>
                  {["🎯", "🎬", "📱"][i] || "✨"}
                </span>
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {tip}
                </p>
              </div>
            ))}
            <div
              style={{
                marginTop: 16,
                background: `${style.bg}15`,
                border: `1px solid ${style.bg}44`,
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  color: style.bg,
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                📁 Save to Google Drive
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Click <strong style={{ color: "#fff" }}>Download</strong> above to save the content file, then upload it to your Google Drive folder for record-keeping. Create a folder called <code style={{ color: style.bg }}>TikTok Content/{new Date().toLocaleDateString()}</code> to stay organized.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | fetching_topics | topics_ready | generating | done
  const [topics, setTopics] = useState([]);
  const [contents, setContents] = useState({});
  const [loadingTopic, setLoadingTopic] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) =>
    setLog((prev) => [
      { time: new Date().toLocaleTimeString(), msg },
      ...prev.slice(0, 9),
    ]);

  const callClaude = async (prompt, systemPrompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "anthropic-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-dangerous-direct-browser-calls": "true",
},
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt || "You are a helpful assistant. Always return valid JSON only.",
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return text.replace(/```json|```/g, "").trim();
  };

  const fetchTrendingTopics = async () => {
    setPhase("fetching_topics");
    setError(null);
    setTopics([]);
    setContents({});
    setSelectedTopic(null);
    addLog("🔍 Searching for today's trending Twitter topics...");

    try {
      const raw = await callClaude(TOPICS_PROMPT);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length < 3)
        throw new Error("Invalid topics format");
      setTopics(parsed.slice(0, 3));
      setPhase("topics_ready");
      setLastRun(new Date());
      addLog(`✅ Found ${parsed.length} trending topics!`);
    } catch (e) {
      setError("Failed to fetch topics. " + e.message);
      setPhase("idle");
      addLog("❌ Error fetching topics: " + e.message);
    }
  };

  const generateContent = async (topic) => {
    setLoadingTopic(topic.id);
    addLog(`⚡ Generating content for "${topic.topic}"...`);
    try {
      const raw = await callClaude(DESCRIPTION_PROMPT(topic));
      const parsed = JSON.parse(raw);
      setContents((prev) => ({ ...prev, [topic.id]: parsed }));
      setSelectedTopic(topic);
      setLoadingTopic(null);
      addLog(`✅ Content ready for "${topic.topic}"!`);
    } catch (e) {
      setLoadingTopic(null);
      addLog(`❌ Failed for "${topic.topic}": ` + e.message);
      setError("Content generation failed. " + e.message);
    }
  };

  const generateAll = async () => {
    setPhase("generating");
    addLog("🚀 Generating content for all 3 topics...");
    for (const topic of topics) {
      if (!contents[topic.id]) {
        await generateContent(topic);
      }
    }
    setPhase("done");
    addLog("🎉 All content generated! Ready to upload to TikTok.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        color: "#fff",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "0 0 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(180deg, #0D0D1A 0%, rgba(13,13,26,0) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 32px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "linear-gradient(135deg, #FF006E, #8338EC)",
                borderRadius: 12,
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⚡
            </div>
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 20,
                  background: "linear-gradient(90deg, #FF006E, #8338EC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: -0.5,
                }}
              >
                TikTok AI Automation
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}
              >
                Twitter Trends → TikTok Content Pipeline
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {lastRun && (
              <span
                style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}
              >
                Last run: {lastRun.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchTrendingTopics}
              disabled={
                phase === "fetching_topics" || phase === "generating"
              }
              style={{
                background:
                  phase === "fetching_topics"
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #FF006E, #8338EC)",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                color: phase === "fetching_topics" ? "#666" : "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor:
                  phase === "fetching_topics" ? "default" : "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {phase === "fetching_topics" ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                  Fetching Trends...
                </>
              ) : (
                <>🔄 Fetch Today's Trends</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Workflow Steps */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 32,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {[
            { step: 1, label: "Fetch Twitter Trends", icon: "🐦", done: topics.length > 0 },
            { step: 2, label: "AI Generates Content", icon: "🤖", done: Object.keys(contents).length > 0 },
            { step: 3, label: "Save to Google Drive", icon: "📁", done: false },
            { step: 4, label: "Upload to TikTok", icon: "📱", done: false },
          ].map((s, i, arr) => (
            <div
              key={s.step}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRight:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none",
                background: s.done ? "rgba(52,211,153,0.05)" : "transparent",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: s.done
                    ? "#34D399"
                    : "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                  fontWeight: 800,
                  color: s.done ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              >
                {s.done ? "✓" : s.step}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 1 }}>
                  Step {s.step}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: s.done ? "#34D399" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {s.icon} {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#FCA5A5",
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Idle State */}
        {phase === "idle" && topics.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 20,
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 12,
                background: "linear-gradient(90deg, #FF006E, #8338EC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Content Automation
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                maxWidth: 480,
                margin: "0 auto 28px",
                lineHeight: 1.7,
              }}
            >
              Click <strong style={{ color: "#fff" }}>Fetch Today's Trends</strong> to automatically discover 3 trending Twitter topics and generate complete TikTok video content packages with scripts, captions, and strategies.
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {["🔍 Finds trending topics", "✍️ Writes scripts", "📝 Creates captions", "📁 Saves to Drive", "📱 Uploads to TikTok"].map((f) => (
                <span
                  key={f}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Topics Grid */}
        {topics.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#fff",
                }}
              >
                🔥 Today's Trending Topics
              </div>
              {Object.keys(contents).length < 3 && (
                <button
                  onClick={generateAll}
                  disabled={phase === "generating"}
                  style={{
                    background: "linear-gradient(135deg, #FF006E, #8338EC)",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: phase === "generating" ? "default" : "pointer",
                    opacity: phase === "generating" ? 0.6 : 1,
                  }}
                >
                  {phase === "generating" ? "⏳ Generating all..." : "⚡ Generate All Content"}
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 16,
                marginBottom: 28,
              }}
            >
              {topics.map((topic, i) => (
                <div
                  key={topic.id}
                  onClick={() =>
                    contents[topic.id] && setSelectedTopic(topic)
                  }
                  style={{
                    cursor: contents[topic.id] ? "pointer" : "default",
                    outline:
                      selectedTopic?.id === topic.id
                        ? `2px solid ${getCategoryStyle(topic.category).bg}`
                        : "2px solid transparent",
                    borderRadius: 18,
                    transition: "outline 0.2s",
                  }}
                >
                  <TopicCard
                    topic={topic}
                    index={i}
                    onGenerate={generateContent}
                    isLoading={loadingTopic === topic.id}
                    isGenerated={!!contents[topic.id]}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Content Panel */}
        {selectedTopic && contents[selectedTopic.id] && (
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: "#fff",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              📋 Content Package:{" "}
              <span
                style={{
                  color: getCategoryStyle(selectedTopic.category).bg,
                }}
              >
                {selectedTopic.topic}
              </span>
            </div>
            <ContentPanel
              content={contents[selectedTopic.id]}
              topic={selectedTopic}
            />
          </div>
        )}

        {/* TikTok Upload Guide */}
        {Object.keys(contents).length > 0 && (
          <div
            style={{
              marginTop: 28,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "#fff" }}
            >
              📱 Upload to TikTok — Next Steps
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { step: "1", title: "Download Content Files", desc: "Click Download on each topic to save scripts and captions", color: "#FF6B6B" },
                { step: "2", title: "Save to Google Drive", desc: 'Upload files to Drive folder: TikTok Content / ' + new Date().toLocaleDateString(), color: "#4ECDC4" },
                { step: "3", title: "Record Your Video", desc: "Use the script to record your 60-second TikTok video", color: "#A78BFA" },
                { step: "4", title: "Upload to TikTok", desc: "Use the generated caption and hashtags when posting", color: "#F59E0B" },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    background: `${s.color}11`,
                    border: `1px solid ${s.color}33`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      color: s.color,
                      fontWeight: 800,
                      fontSize: 22,
                      marginBottom: 4,
                    }}
                  >
                    {s.step}.
                  </div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}
                  >
                    {s.title}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              💡 <strong style={{ color: "rgba(255,255,255,0.7)" }}>Pro Tip:</strong> To fully automate TikTok uploads, connect the TikTok Creator API using Make.com or Zapier — watch the folder in Google Drive, and auto-post whenever a new video file is detected.
            </div>
          </div>
        )}

        {/* Activity Log */}
        {log.length > 0 && (
          <div
            style={{
              marginTop: 24,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              Activity Log
            </div>
            {log.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 6,
                  opacity: 1 - i * 0.08,
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 11,
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  {entry.time}
                </span>
                <span
                  style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                >
                  {entry.msg}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
