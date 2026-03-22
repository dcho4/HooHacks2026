import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Bot, User, Sparkles, Loader } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function buildSystemPrompt(babyProfile, parentName, feedLogs, sleepLogs, growthEntries, getBabyAgeDays) {
  const ageDays = getBabyAgeDays();
  const ageWeeks = ageDays !== null ? Math.floor(ageDays / 7) : null;
  const ageMonths = ageDays !== null ? Math.floor(ageDays / 30) : null;

  let ageStr = 'unknown age';
  if (ageDays !== null) {
    if (ageDays < 0) ageStr = `not yet born (${Math.abs(ageDays)} days until due date)`;
    else if (ageDays < 14) ageStr = `${ageDays} days old (newborn)`;
    else if (ageWeeks < 12) ageStr = `${ageWeeks} weeks old`;
    else ageStr = `${ageMonths} months old`;
  }

  const recentFeeds = feedLogs.slice(0, 5).map(f =>
    `${f.type}${f.amount ? ` (${f.amount})` : ''} at ${new Date(f.timestamp).toLocaleString()}`
  ).join('; ');

  const recentSleeps = sleepLogs.slice(0, 5).map(s =>
    `${s.start}–${s.end || 'ongoing'}${s.note ? ` (${s.note})` : ''}`
  ).join('; ');

  const latestGrowth = growthEntries[0];
  const growthStr = latestGrowth
    ? `Weight: ${latestGrowth.weight || 'N/A'}, Height: ${latestGrowth.height || 'N/A'}, Head: ${latestGrowth.headCircumference || 'N/A'} (recorded ${new Date(latestGrowth.date).toLocaleDateString()})`
    : 'No growth data recorded yet';

  const familyHistoryStr = babyProfile.familyHistory?.length > 0
    ? babyProfile.familyHistory.join(', ')
    : 'None reported';

  return `You are BabyBot, a warm, knowledgeable, and supportive AI parenting assistant for the app BabyBoo.

BABY PROFILE:
- Name: ${babyProfile.firstName || 'Unknown'} ${babyProfile.lastName || ''}
- Age: ${ageStr}
- Sex: ${babyProfile.sex || 'Unknown'}
- State: ${babyProfile.state || 'Unknown'}
- Medical Conditions: ${babyProfile.hasMedicalConditions ? babyProfile.medicalConditions.join(', ') : 'None known'}
- Family Medical History: ${familyHistoryStr}

PARENT NAME: ${parentName || 'Parent'}

LATEST GROWTH MEASUREMENTS: ${growthStr}

RECENT ACTIVITY:
- Recent feeds: ${recentFeeds || 'No feeds logged yet'}
- Recent sleep: ${recentSleeps || 'No sleep logged yet'}

GUIDELINES:
- Give practical, evidence-based parenting advice tailored to this baby's specific age, sex, weight, and medical profile.
- If the baby has medical conditions (like reflux, premature birth, allergies, etc.), ALWAYS factor those into your advice.
- Consider family medical history when giving health guidance (e.g., if family has diabetes history, discuss feeding and sugar awareness).
- Be warm, encouraging, and never judgmental. Use the baby's name when natural.
- Keep responses concise (2-4 sentences) unless the parent asks for detail.
- For medical concerns, always encourage consulting their pediatrician.
- Give age-appropriate advice — newborn advice differs from 6-month advice.
- Consider the baby's growth measurements when discussing feeding or development.`;
}

async function callGeminiAPI(systemPrompt, messages) {
  const contents = messages
    .filter(m => m.from !== 'system' && m.id !== 0)
    .map(m => ({
      role: m.from === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

  if (contents.length === 0 || contents[0].role !== 'user') return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error('The AI is temporarily rate-limited. Please wait a minute and try again.');
    }
    if (response.status === 403) {
      throw new Error('API key was revoked. Please generate a new key at aistudio.google.com/apikey and update your .env file.');
    }
    if (response.status === 400) {
      throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env and restart the app.');
    }
    throw new Error(`API error (${response.status})`);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Unexpected API response format');
  }
  return data.candidates[0].content.parts[0].text;
}

export default function Chatbot() {
  const { babyProfile, parentName, feedLogs, sleepLogs, growthEntries, getBabyAgeDays } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: 'bot',
      text: `Hi ${parentName || 'there'}! I'm BabyBot — your personal AI parenting assistant. I know all about ${babyProfile.firstName || 'your little one'}${babyProfile.medicalConditions?.length > 0 ? ', including their medical needs' : ''}. Ask me anything about sleep, feeding, development, activities, or just vent!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const userMsg = { id: Date.now(), from: 'user', text: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');

    if (!GEMINI_API_KEY) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, from: 'bot',
        text: "BabyBot needs a Gemini API key to work. Add VITE_GEMINI_API_KEY to your .env file and restart the app. Get a free key at aistudio.google.com/apikey",
      }]);
      return;
    }

    setLoading(true);
    try {
      const systemPrompt = buildSystemPrompt(babyProfile, parentName, feedLogs, sleepLogs, growthEntries, getBabyAgeDays);
      const reply = await callGeminiAPI(systemPrompt, updatedMessages);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: reply || "I'm sorry, I couldn't generate a response. Please try again.",
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: err.message || 'Sorry, something went wrong. Please try again in a moment.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickTopics = [
    `Sleep tips for ${babyProfile.firstName || 'baby'}`,
    'Feeding help',
    'Development milestones',
    "I'm worried",
    'Activity ideas',
  ];
  if (babyProfile.medicalConditions?.length > 0) {
    quickTopics.push(`Managing ${babyProfile.medicalConditions[0]}`);
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="bot-avatar"><Bot size={24} /></div>
        <div>
          <h2>BabyBot</h2>
          <span className="bot-status">
            <Sparkles size={12} /> AI-powered, personalized for {babyProfile.firstName || 'your baby'}
          </span>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.from}`}>
            <div className="bubble-avatar">
              {msg.from === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="bubble-text">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble bot">
            <div className="bubble-avatar"><Bot size={16} /></div>
            <div className="bubble-text typing-indicator">
              <Loader size={16} className="spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-bar">
        <div className="quick-topics">
          {quickTopics.map((topic) => (
            <button key={topic} className="topic-chip" onClick={() => setInput(topic)}>{topic}</button>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Ask BabyBot anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
