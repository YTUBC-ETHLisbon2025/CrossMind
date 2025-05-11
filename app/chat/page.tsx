"use client";
import { useEffect, useRef, useState } from "react";
import { BiMailSend } from "react-icons/bi";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState<string>("");
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResponse, setPendingResponse] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!pendingResponse) return;

    const text = pendingResponse;
    let index = 0;

    setMessages((prev) => {
      const updated = [...prev];

      // Eğer son mesaj assistant değilse, boş assistant mesajı ekle
      const last = updated[updated.length - 1];
      if (!last || last.role !== "assistant") {
        updated.push({ role: "assistant", content: "" });
      }

      return updated;
    });

    const interval = setInterval(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        if (last?.role === "assistant" && text[index] !== undefined) {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + text[index],
          };
          return updated;
        }

        return prev;
      });

      index++;

      if (index >= text.length) {
        clearInterval(interval);
        setPendingResponse("");
      }
    }, 25);

    return () => clearInterval(interval);
  }, [pendingResponse]);

  const sendMessage = async (customInput?: string) => {
    const finalInput = customInput || input;
    if (!finalInput.trim()) return;

    setShowIntro(false);
    setInput("");

    const newUserMessage = { role: "user" as const, content: finalInput };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "__loading__" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });

      const data = await res.json();

      const fullResponse = data.reply ?? "No reply from assistant.";

      setIsLoading(false);
      // loading mesajını sil, ardından yazı efekti için pending'e ata
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "" },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 0));
      setPendingResponse(fullResponse);
    } catch (error) {
      console.error("API error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Failed to fetch response." },
      ]);
      //   await new Promise((resolve) => setTimeout(resolve, 0));
      //   setPendingResponse(" Failed to fetch response.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white flex flex-col">
      <header className="py-4 px-6 border-b border-gray-800 bg-black/60 backdrop-blur sticky top-0 z-50">
        <button onClick={() => router.back()}>
          <h1 className="text-xl font-bold">YieldPilot Chat</h1>
        </button>
      </header>

      <div
        className={`overflow-y-auto px-4 pt-6 pb-0 space-y-4 transition-all duration-500 ${
          messages.length === 0 && showIntro
            ? "h-[calc(100vh-160px)] flex items-start justify-center flex-1 py-0 my-0"
            : "h-[500px] "
        }`}
      >
        <div className="mx-auto w-[50%]">
          {messages.length === 0 && showIntro && (
            <div className="text-center text-gray-400 mt-32 animate-fade-in">
              <h1 className="text-4xl font-bold mb-2 text-white">
                Welcome to YieldPilot
              </h1>
              <p className="mb-6 text-sm text-gray-500 mt-4">
                Your DeFi AI Agent is ready. Ask anything.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[75%] w-fit px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm shadow-md break-words ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-teal-400 to-cyan-400 text-black ml-auto text-end"
                  : "bg-gray-800 text-white mr-auto text-start"
              }`}
            >
              {msg.content === "__loading__" ? (
                <div className="flex items-center gap-0.5 text-[13px] pl-1">
                  <span className="inline-block animate-bounce [animation-delay:-0.3s]">
                    .
                  </span>
                  <span className="inline-block animate-bounce [animation-delay:-0.15s]">
                    .
                  </span>
                  <span className="inline-block animate-bounce">.</span>
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}
        </div>
        <div ref={endOfMessagesRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className={`transition-all duration-300 px-4 pt-4 pb-6 flex flex-col gap-6 ${
          messages.length === 0 && showIntro
            ? "flex flex-col justify-start items-center flex-1 !-mt-64 !gap-8"
            : "sticky bottom-2 bg-transparent backdrop-blur "
        }`}
      >
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {[
            "What’s the best yield today?",
            "How do I move funds to Gnosis?",
            "Show my Aave positions",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full transition disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="max-w-2xl w-full mx-auto flex gap-2 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your DeFi portfolio..."
            className="flex-1 rounded-xl px-4 py-3 text-sm bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-black font-medium px-1 py-1 rounded-full text-sm transition disabled:opacity-50"
          >
            <BiMailSend className="w-5 h-5 " />
          </button>
        </div>
      </form>
    </main>
  );
}
