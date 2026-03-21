import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const BABY_TIPS = {
  sleep: [
    "For newborns, sleep cycles are about 40-50 minutes. It's normal for them to wake frequently.",
    "Try a consistent bedtime routine: dim lights, warm bath, soft lullaby. Babies thrive on predictability.",
    "Safe sleep: always on their back, on a firm flat surface, with no loose bedding.",
    "White noise can help — it mimics the sounds they heard in the womb.",
  ],
  feeding: [
    "Newborns typically feed 8-12 times in 24 hours. Follow your baby's hunger cues rather than a strict schedule.",
    "Watch for feeding cues: rooting, sucking on hands, lip smacking. Crying is a late hunger sign.",
    "If breastfeeding, aim for a deep latch. If it's painful, try repositioning before the next feed.",
    "Burp your baby halfway through and after each feed to reduce gas discomfort.",
  ],
  development: [
    "Tummy time is important from day one! Start with short sessions of 1-2 minutes after diaper changes.",
    "Talk and sing to your baby constantly — every word helps build neural connections.",
    "High-contrast images (black and white) are great for newborn visual development.",
    "Your baby's brain grows to 80% of adult size by age 3 — every interaction matters!",
  ],
  worry: [
    "It's completely normal to feel anxious as a new parent. You're not alone in this.",
    "If something feels off, trust your gut and talk to your pediatrician. There's no such thing as a silly question.",
    "Remember: babies are resilient. A few tough days don't define your parenting.",
    "Take care of yourself too — you can't pour from an empty cup.",
  ],
  general: [
    "Every baby is different. Comparison is the thief of parenting joy.",
    "Document the little moments — they pass faster than you think.",
    "It's okay to ask for help. Building your support village takes courage, not weakness.",
    "You don't need to enjoy every moment. It's okay for some days to just survive.",
  ],
};

function getBotResponse(message) {
  const lower = message.toLowerCase();
  if (lower.match(/sleep|tired|nap|night|wake|bedtime/)) {
    const tips = BABY_TIPS.sleep;
    return tips[Math.floor(Math.random() * tips.length)];
  }
  if (lower.match(/feed|eat|milk|breast|bottle|formula|hungry|nursing/)) {
    const tips = BABY_TIPS.feeding;
    return tips[Math.floor(Math.random() * tips.length)];
  }
  if (lower.match(/develop|milestone|grow|learn|tummy|play|talk|crawl|walk/)) {
    const tips = BABY_TIPS.development;
    return tips[Math.floor(Math.random() * tips.length)];
  }
  if (lower.match(/worry|scared|anxious|nervous|wrong|help|panic|stress/)) {
    const tips = BABY_TIPS.worry;
    return tips[Math.floor(Math.random() * tips.length)];
  }
  const tips = BABY_TIPS.general;
  return tips[Math.floor(Math.random() * tips.length)];
}

export default function Chatbot() {
  const { babyProfile, parentName } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: 'bot',
      text: `Hi ${parentName || 'there'}! I'm BabyBot 💜 I'm here to help with questions about ${babyProfile.firstName || 'your little one'}. Ask me anything about sleep, feeding, development, or just vent — I'm here for you.`,
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        from: 'bot',
        text: getBotResponse(userMsg.text),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="bot-avatar">
          <Bot size={24} />
        </div>
        <div>
          <h2>BabyBot</h2>
          <span className="bot-status"><Sparkles size={12} /> Always here for you</span>
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
      </div>

      <div className="chat-input-bar">
        <div className="quick-topics">
          {['Sleep tips', 'Feeding help', 'Development', "I'm worried"].map((topic) => (
            <button
              key={topic}
              className="topic-chip"
              onClick={() => {
                setInput(topic);
              }}
            >
              {topic}
            </button>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Ask BabyBot anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
