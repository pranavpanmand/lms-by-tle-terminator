import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverUrl } from "../App";

export default function CourseAIChat({ courseId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOffline, setAiOffline] = useState(false);
  const scrollRef = useRef(null);

  
  useEffect(() => {
    axios
      .get(`${serverUrl}/api/chatai/history/${courseId}`, { withCredentials: true })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("History fetch failed:", err));
  }, [courseId]);

  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
  if (!text.trim() || loading) return;

  const userMsg = { role: "user", content: text };
  const assistantPlaceholder = {
    role: "assistant",
    content: "",
    loading: true,
  };

  setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
  setText("");
  setLoading(true);

  try {
    const res = await axios.post(
      `${serverUrl}/api/chatai/ask`,
      { question: userMsg.content, courseId },
      { withCredentials: true }
    );

    console.log("RAW AI RESPONSE:", res.data);

    const messages = res.data.messages || [];

    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");

    const answer =
      lastAssistant?.content || "⚠️ no response from ai";

    setMessages((prev) =>
      prev.map((m) =>
        m.loading ? { role: "assistant", content: answer } : m
      )
    );

    setAiOffline(false);
  } catch (err) {
    setMessages((prev) =>
      prev.map((m) =>
        m.loading
          ? { role: "assistant", content: "⚠️ connection error. try again." }
          : m
      )
    );

    if (!err.response || err.response.status === 503) {
      setAiOffline(true);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    
    <div className="flex flex-col h-[550px] w-full bg-white rounded-3xl shadow-xl border overflow-hidden mt-8">
      
      
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-700 to-black text-white flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            🤖 AI Tutor
            {loading && <span className="text-xs font-normal animate-pulse">(Thinking...)</span>}
          </h3>
          <p className="text-xs opacity-70">Powered by Ollama</p>
        </div>
        {aiOffline && (
          <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-full font-bold">
            OFFLINE
          </span>
        )}
      </div>

      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <p className="text-center text-gray-400 text-sm mt-10">Ask a question about your LSTM project or course notes!</p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
              m.role === "user" 
                ? "bg-black text-white rounded-tr-none" 
                : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-400 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      
      <div className="p-4 bg-white border-t">
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Type your message..."
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !text.trim()}
            className={`py-3 rounded-xl text-white font-bold transition-all ${
              loading || !text.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:bg-blue-600 active:scale-95"
            }`}
          >
            {loading ? "Processing..." : "Ask AI Tutor"}
          </button>
        </div>
      </div>
    </div>
  );
}