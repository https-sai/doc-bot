// components/chat-panel.tsx
"use client";
import { useRef, useState, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel({
  agentId,
  initialMessages,
}: {
  agentId: string;
  initialMessages: Message[];
}) {
  const [msgs, setMsgs] = useState(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMsgs((m) => [...m, userMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ agentId, message: text }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    setMsgs((m) => [...m, aiMsg]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiMsg.content += decoder.decode(value, { stream: true });
      setMsgs((m) =>
        m.map((x) => (x.id === aiMsg.id ? { ...x, content: aiMsg.content } : x))
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded p-3 h-96 overflow-auto space-y-3">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div
              className={
                "inline-block rounded px-3 py-2 " +
                (m.role === "user" ? "bg-black text-white" : "bg-gray-100")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the docs…"
          className="border px-3 py-2 rounded w-full"
        />
        <button className="px-4 py-2 rounded bg-black text-white">Send</button>
      </form>
    </div>
  );
}
