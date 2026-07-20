import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  logout,
  listChats,
  createChat,
  getChat,
  searchChats,
  sendChatMessage,
  renameChat,
  deleteChat,
  type ChatSummary,
  type ChatDetail,
} from "../api.ts";
import ThemeSwitcher from "../components/ThemeSwitcher.tsx";

export default function Chat() {
  const navigate = useNavigate();
  const user = getUser();

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [searchResults, setSearchResults] = useState<ChatSummary[] | null>(null);
  const [query, setQuery] = useState("");

  const [active, setActive] = useState<ChatDetail | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Mobile: sidebar is a slide-in drawer, hidden by default.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  // Load the chat list on mount.
  useEffect(() => {
    listChats().then(setChats).catch(() => {});
  }, []);

  // Debounced search whenever the query changes.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(() => {
      searchChats(q).then(setSearchResults).catch(() => setSearchResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, sending]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleNewChat() {
    const chat = await createChat();
    setChats((prev) => [{ _id: chat._id, title: chat.title, updatedAt: new Date().toISOString() }, ...prev]);
    setActive(chat);
    setInput("");
    setSidebarOpen(false);
  }

  async function handleSelect(id: string) {
    setSidebarOpen(false);
    if (active?._id === id) return;
    try {
      const chat = await getChat(id);
      setActive(chat);
    } catch {
      /* ignore */
    }
  }

  // Move a chat to the top of the sidebar and refresh its title.
  function bumpChat(summary: ChatSummary) {
    setChats((prev) => [summary, ...prev.filter((c) => c._id !== summary._id)]);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    let chat = active;
    if (!chat) {
      chat = await createChat();
      setChats((prev) => [{ _id: chat!._id, title: chat!.title, updatedAt: new Date().toISOString() }, ...prev]);
    }

    // Optimistically show the user's message.
    setActive({ ...chat, messages: [...chat.messages, { role: "user", content: text }] });
    setInput("");
    setSending(true);

    try {
      const updated = await sendChatMessage(chat._id, text);
      setActive(updated);
      bumpChat({ _id: updated._id, title: updated.title, updatedAt: new Date().toISOString() });
    } catch (err) {
      setActive((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages,
                { role: "assistant", content: err instanceof Error ? `⚠️ ${err.message}` : "⚠️ Something went wrong" },
              ],
            }
          : prev
      );
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteChat(id).catch(() => {});
    setChats((prev) => prev.filter((c) => c._id !== id));
    setSearchResults((prev) => (prev ? prev.filter((c) => c._id !== id) : prev));
    if (active?._id === id) setActive(null);
  }

  function startRename(chat: ChatSummary, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditingTitle(chat.title);
  }

  async function commitRename() {
    const id = editingId;
    const title = editingTitle.trim();
    setEditingId(null);
    if (!id || !title) return;
    try {
      await renameChat(id, title);
      setChats((prev) => prev.map((c) => (c._id === id ? { ...c, title } : c)));
      setActive((prev) => (prev && prev._id === id ? { ...prev, title } : prev));
    } catch {
      /* ignore */
    }
  }

  const displayedChats = query.trim() && searchResults ? searchResults : chats;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Backdrop (mobile only, when drawer is open) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — slide-in drawer on mobile, docked on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            <span className="text-lg leading-none">+</span> New chat
          </button>
        </div>

        <div className="px-3 pb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {displayedChats.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-[var(--muted)]">
              {query.trim() ? "No matching chats" : "No chats yet"}
            </p>
          )}
          {displayedChats.map((c) => (
            <div
              key={c._id}
              onClick={() => handleSelect(c._id)}
              className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active?._id === c._id ? "bg-[var(--input-bg)] font-medium" : "hover:bg-[var(--input-bg)]"
              }`}
            >
              {editingId === c._id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => e.key === "Enter" && commitRename()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 rounded border border-[var(--accent)] bg-[var(--surface)] px-1.5 py-0.5 text-sm outline-none"
                />
              ) : (
                <span className="flex-1 truncate">{c.title}</span>
              )}
              <button
                onClick={(e) => startRename(c, e)}
                className="hidden text-xs text-[var(--muted)] hover:text-[var(--text)] group-hover:block"
                title="Rename"
              >
                ✎
              </button>
              <button
                onClick={(e) => handleDelete(c._id, e)}
                className="hidden text-xs text-[var(--muted)] hover:text-red-500 group-hover:block"
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] p-3">
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">{user?.name}</div>
            <div className="truncate text-xs text-[var(--muted)]">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs hover:bg-[var(--input-bg)]"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-[var(--text)] hover:bg-[var(--input-bg)] md:hidden"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <strong className="flex-1 truncate text-center md:text-left">{active?.title || "ChatBoat"}</strong>
          <ThemeSwitcher />
        </header>

        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-2xl font-bold">ChatBoat</h1>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              Start a new conversation, or pick one from the sidebar. Your chats are saved and searchable.
            </p>
            <button
              onClick={handleNewChat}
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] hover:bg-[var(--accent-hover)]"
            >
              New chat
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {active.messages.length === 0 && (
                  <p className="text-center text-sm text-[var(--muted)]">
                    Send a message to start the conversation 👇
                  </p>
                )}
                {active.messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "max-w-[80%] self-end whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-[var(--accent)] px-4 py-2.5 text-sm leading-relaxed text-[var(--on-accent)]"
                        : "max-w-[80%] self-start whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm bg-[var(--surface)] px-4 py-2.5 text-sm leading-relaxed text-[var(--text)] shadow-sm"
                    }
                  >
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)] shadow-sm">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce [animation-delay:0.15s]">•</span>
                      <span className="animate-bounce [animation-delay:0.3s]">•</span>
                    </span>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            <form onSubmit={handleSend} className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4">
              <div className="mx-auto flex max-w-3xl gap-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message ChatBoat..."
                  className="flex-1 rounded-full border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
