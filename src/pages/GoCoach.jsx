import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function GoCoach() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.agents.createConversation({ agent_name: "go_coach" }).then(setConversation);
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isStreaming =
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.status === "streaming";

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/6ca653584_goLogo.png"
          alt="GO!"
          className="h-8 w-auto"
        />
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">GO! AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Your personal missionary companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        {messages.length === 0 && !conversation && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.length === 0 && conversation && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <img
              src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/e16740db9_icon.png"
              alt=""
              className="h-12 w-12 object-contain opacity-30"
            />
            <p className="text-sm text-muted-foreground">
              Start a conversation with your GO! AI Assistant. Share where you are in your journey and what step you're working on.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.role === "tool" || !msg.content) return null;
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <img
                    src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/e16740db9_icon.png"
                    alt=""
                    className="h-4 w-4 object-contain"
                  />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                {isUser ? (
                  <p className="leading-relaxed">{msg.content}</p>
                ) : (
                  <ReactMarkdown
                    className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    components={{
                      p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="my-0.5">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}

        {(sending || isStreaming) && (
          <div className="flex justify-start">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0">
              <img
                src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/e16740db9_icon.png"
                alt=""
                className="h-4 w-4 object-contain"
              />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex gap-1.5 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share where you are in your GO! journey..."
            rows={2}
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || !conversation}
            className="self-end flex items-center justify-center p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}