import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Send, Edit2, Share2, Trash2, Coins, MessageSquarePlus, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import aiAvatarIcon from "../../imports/Appfire_AI_Logo.png";
import iconPlusSvg from "../../imports/icon-plus.svg?raw";
import iconChatHistorySvg from "../../imports/icon-chat-history.svg?raw";
import iconOpenInNewTabSvg from "../../imports/icon-open-in-new-tab.svg?raw";
import iconMinimizeSvg from "../../imports/icon-minimize.svg?raw";
import iconMoreOptionsSvg from "../../imports/icon-more-options.svg?raw";
import { ConfirmDialog } from "./ConfirmDialog";
import { Tooltip } from "./Tooltip";

const headerToolbarIconClass =
  "inline-flex size-8 shrink-0 [&>svg]:block [&>svg]:size-full [&_path]:fill-current";

/** Shared token budget across all conversations (UI + mock usage). */
const TOKEN_LIMIT = 1500;

function DataPolicyDisclaimer({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs text-gray-500"}>
      Your data is secure and not processed or stored. Errors may occur. Learn more:{" "}
      <a href="#" className="underline hover:opacity-80" style={{ color: "#1868DB" }}>
        Data Policy
      </a>
      {" & "}
      <a href="#" className="underline hover:opacity-80" style={{ color: "#1868DB" }}>
        Security
      </a>
      .
    </p>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  totalTokens: number;
  createdAt: Date;
}

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onThinkingChange: (isThinking: boolean) => void;
  onNewResponse: () => void;
}

export function ChatOverlay({ isOpen, onClose, onThinkingChange, onNewResponse }: ChatOverlayProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Conversation 1",
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "Hi! I'm Appfire AI. How can I help you?",
        },
      ],
      totalTokens: 12,
      createdAt: new Date(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [newChatBannerVisible, setNewChatBannerVisible] = useState(false);
  const [newChatBadgeConvId, setNewChatBadgeConvId] = useState<string | null>(null);
  const [newChatBannerMeta, setNewChatBannerMeta] = useState<{ totalChats: number; title: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const newChatTimersRef = useRef<number[]>([]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const totalTokensUsed = conversations.reduce((sum, conv) => sum + conv.totalTokens, 0);
  const tokenLimitExceeded = totalTokensUsed >= TOKEN_LIMIT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Keep focus on the chat input whenever the conversation view is visible
  useEffect(() => {
    if (!isOpen || showHistory || confirmDelete || tokenLimitExceeded) return;
    const id = window.requestAnimationFrame(() => {
      chatInputRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, showHistory, activeConversationId, isThinking, confirmDelete, tokenLimitExceeded]);

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        openMenuId &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !Object.values(menuButtonRefs.current).some((btn) => btn?.contains(e.target as Node))
      ) {
        handleCloseMenu();
        setMenuPosition(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  useEffect(() => {
    return () => {
      newChatTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleSendMessage = async () => {
    if (tokenLimitExceeded || !inputValue.trim() || !activeConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      tokens: Math.ceil(inputValue.trim().split(" ").length * 1.3),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              totalTokens: conv.totalTokens + (userMessage.tokens || 0),
            }
          : conv
      )
    );

    setInputValue("");
    setIsThinking(true);
    onThinkingChange(true);

    // Symulacja odpowiedzi AI
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "This is a prototype only. It cannot understand your question or provide real answers — those would come from a connected service in a finished product.",
        tokens: 18,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                totalTokens: conv.totalTokens + (assistantMessage.tokens || 0),
              }
            : conv
        )
      );

      setIsThinking(false);
      onThinkingChange(false);
      console.log('ChatOverlay: Calling onNewResponse()');
      onNewResponse();
    }, 2000);
  };

  const handleNewConversation = () => {
    const nextIndex = conversations.length + 1;
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `Conversation ${nextIndex}`,
      messages: [
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Hi! I'm Appfire AI. How can I help you?",
        },
      ],
      totalTokens: 12,
      createdAt: new Date(),
    };
    newChatTimersRef.current.forEach((id) => window.clearTimeout(id));
    newChatTimersRef.current = [];

    setConversations((prev) => [...prev, newConv]);
    setActiveConversationId(newConv.id);
    setShowHistory(false);
    setInputValue("");
    setNewChatBannerMeta({ totalChats: nextIndex, title: newConv.title });
    setNewChatBannerVisible(true);
    setNewChatBadgeConvId(newConv.id);

    newChatTimersRef.current.push(
      window.setTimeout(() => setNewChatBannerVisible(false), 6500)
    );
    newChatTimersRef.current.push(
      window.setTimeout(() => setNewChatBadgeConvId(null), 14000)
    );
  };

  const dismissNewChatBanner = () => {
    setNewChatBannerVisible(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((c) => c.id !== id);
      setActiveConversationId((cur) => (cur === id ? next[0]?.id ?? "" : cur));
      return next;
    });
  };

  const handleEditConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setEditingConvId(id);
      setEditingTitle(conv.title);
    }
  };

  const handleSaveEdit = () => {
    if (editingConvId && editingTitle) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === editingConvId
            ? {
                ...conv,
                title: editingTitle,
              }
            : conv
        )
      );
      setEditingConvId(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingConvId(null);
    setEditingTitle("");
  };

  const handleOpenMenu = (id: string | null) => {
    setOpenMenuId(id);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  const handleShareConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      const url = new URL(window.location.href);
      url.searchParams.set("conv", id);
      
      // Fallback method for copying to clipboard
      const textArea = document.createElement("textarea");
      textArea.value = url.toString();
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        alert("Conversation link copied to clipboard!");
      } catch (err) {
        textArea.remove();
        alert(`Copy this link: ${url.toString()}`);
      }
    }
  };

  const handleOpenInNewPage = () => {
    // Otwiera chatbota w nowym oknie/zakładce
    const newWindow = window.open(window.location.href, '_blank', 'width=450,height=600');
    if (newWindow) {
      newWindow.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <Rnd
        default={{
          x: window.innerWidth - 450 - 24,
          y: 76, // 24px (top-6) + 16px (padding w przycisku) + 32px (wysokość ikony) + 4px (odstęp)
          width: 450,
          height: 600,
        }}
        minWidth={350}
        minHeight={400}
        bounds="window"
        className="pointer-events-auto"
        dragHandleClassName="chat-drag-handle"
        enableUserSelectHack={false}
        cancel="input, button, textarea, .no-drag"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full h-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg flex flex-col"
        >
          <div className="chat-drag-handle flex cursor-move items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-3">
            <span className="sr-only">Drag the header to move this window</span>
            <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
              <h2 className="text-sm font-semibold shrink-0" style={{ color: '#292A2E' }}>
                AI Assistant
              </h2>
              <Tooltip
                content={
                  tokenLimitExceeded
                    ? `Token limit reached (${totalTokensUsed} / ${TOKEN_LIMIT}). You cannot send more messages until usage is reset.`
                    : `Tokens (all conversations): ${totalTokensUsed} / ${TOKEN_LIMIT}`
                }
              >
                <button
                  type="button"
                  className="no-drag flex items-center justify-center rounded p-1.5 transition-colors"
                  style={tokenLimitExceeded ? { color: "#DC2626" } : { color: "#505258" }}
                  aria-label={
                    tokenLimitExceeded
                      ? "Token limit reached — no messages can be sent"
                      : "Token usage for entire chat"
                  }
                  onMouseEnter={(e) => {
                    if (!tokenLimitExceeded) e.currentTarget.style.backgroundColor = "#F4F5F7";
                  }}
                  onMouseLeave={(e) => {
                    if (!tokenLimitExceeded) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Coins className="w-4 h-4 shrink-0" style={{ color: "currentColor" }} />
                </button>
              </Tooltip>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Tooltip content="Chat history">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-center rounded transition-colors"
                  style={{ 
                    backgroundColor: showHistory ? '#E3F2FD' : 'rgba(255,255,255,0)',
                    color: showHistory ? '#1868DB' : '#505258',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = showHistory ? '#BBDEFB' : '#EBECF0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = showHistory ? '#E3F2FD' : 'rgba(255,255,255,0)';
                    e.currentTarget.style.color = showHistory ? '#1868DB' : '#505258';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = showHistory ? '#90CAF9' : '#DFE1E6';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = showHistory ? '#BBDEFB' : '#EBECF0';
                  }}
                >
                  <span
                    className={headerToolbarIconClass}
                    aria-hidden
                    dangerouslySetInnerHTML={{ __html: iconChatHistorySvg }}
                  />
                </button>
              </Tooltip>
              <Tooltip content="Open in new tab">
                <button
                  onClick={handleOpenInNewPage}
                  className="flex items-center justify-center rounded transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0)',
                    color: '#505258',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0)'}
                  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#DFE1E6'}
                  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
                >
                  <span
                    className={headerToolbarIconClass}
                    aria-hidden
                    dangerouslySetInnerHTML={{ __html: iconOpenInNewTabSvg }}
                  />
                </button>
              </Tooltip>
              <Tooltip content="Minimize">
                <button
                  onClick={onClose}
                  className="flex items-center justify-center rounded transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0)',
                    color: '#505258',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0)'}
                  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#DFE1E6'}
                  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
                >
                  <span
                    className={headerToolbarIconClass}
                    aria-hidden
                    dangerouslySetInnerHTML={{ __html: iconMinimizeSvg }}
                  />
                </button>
              </Tooltip>
            </div>
          </div>

          <AnimatePresence>
            {newChatBannerVisible && newChatBannerMeta && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="no-drag overflow-hidden border-b"
                style={{ borderColor: "#90CAF9", backgroundColor: "#E8F4FD" }}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <MessageSquarePlus
                    className="size-5 shrink-0 mt-0.5"
                    style={{ color: "#1868DB" }}
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold" style={{ color: "#0747A6" }}>
                      New conversation started
                    </p>
                    <p className="text-xs leading-snug" style={{ color: "#292A2E" }}>
                      You’re now in a fresh chat ({newChatBannerMeta.title}). You have{" "}
                      <strong>{newChatBannerMeta.totalChats}</strong> conversations — open{" "}
                      <strong>Chat history</strong> to switch or delete.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissNewChatBanner}
                    className="no-drag shrink-0 rounded p-1 transition-colors"
                    style={{ color: "#505258" }}
                    aria-label="Dismiss notice"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <X className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showHistory ? (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50">
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-base font-semibold text-gray-700">Chat history</span>
                  <Tooltip content="New chat">
                    <button
                      type="button"
                      onClick={handleNewConversation}
                      className="no-drag flex shrink-0 items-center justify-center rounded transition-colors"
                      style={{
                        backgroundColor: "rgba(255,255,255,0)",
                        color: "#505258",
                        width: "32px",
                        height: "32px",
                      }}
                      aria-label="Start a new conversation"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#EBECF0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0)")
                      }
                      onMouseDown={(e) =>
                        (e.currentTarget.style.backgroundColor = "#DFE1E6")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.backgroundColor = "#EBECF0")
                      }
                    >
                      <span
                        className={headerToolbarIconClass}
                        aria-hidden
                        dangerouslySetInnerHTML={{ __html: iconPlusSvg }}
                      />
                    </button>
                  </Tooltip>
                </div>
                {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`relative flex items-center justify-between p-2 rounded-lg transition-colors ${
                        conv.id === activeConversationId
                          ? "text-gray-900"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      style={conv.id === activeConversationId ? { backgroundColor: '#E3F2FD' } : {}}
                    >
                      {editingConvId === conv.id ? (
                        <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2"
                            style={{ borderColor: '#90CAF9', '--tw-ring-color': '#1868DB' } as React.CSSProperties}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 text-xs text-white rounded transition-colors"
                            style={{ backgroundColor: '#1868DB' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0D47A1'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1868DB'}
                            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#0747A6'}
                            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#0D47A1'}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs rounded transition-colors"
                            style={{ 
                              backgroundColor: 'transparent',
                              color: '#292A2E'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#DFE1E6'}
                            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="flex-1 min-w-0 pr-2 cursor-pointer"
                            onClick={() => {
                              setActiveConversationId(conv.id);
                              setShowHistory(false);
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <Tooltip content={conv.title}>
                                <span className="text-sm truncate block">{conv.title}</span>
                              </Tooltip>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(conv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Menu z trzema kropkami */}
                          <div className="relative flex-shrink-0">
                            <button
                              ref={(el) => (menuButtonRefs.current[conv.id] = el)}
                              onClick={(e) => {
                                e.stopPropagation();
                                const buttonRect = e.currentTarget.getBoundingClientRect();
                                if (openMenuId === conv.id) {
                                  handleOpenMenu(null);
                                  setMenuPosition(null);
                                } else {
                                  handleOpenMenu(conv.id);
                                  setMenuPosition({
                                    top: buttonRect.bottom + 4,
                                    left: buttonRect.right - 160,
                                  });
                                }
                              }}
                              className="flex items-center justify-center rounded transition-colors"
                              style={{ 
                                backgroundColor: openMenuId === conv.id ? '#E3F2FD' : 'rgba(255,255,255,0)',
                                color: openMenuId === conv.id ? '#1868DB' : '#505258',
                                height: '32px',
                                width: '32px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = openMenuId === conv.id ? '#BBDEFB' : '#EBECF0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = openMenuId === conv.id ? '#E3F2FD' : 'rgba(255,255,255,0)';
                                e.currentTarget.style.color = openMenuId === conv.id ? '#1868DB' : '#505258';
                              }}
                              onMouseDown={(e) => {
                                e.currentTarget.style.backgroundColor = openMenuId === conv.id ? '#90CAF9' : '#DFE1E6';
                              }}
                              onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor = openMenuId === conv.id ? '#BBDEFB' : '#EBECF0';
                              }}
                            >
                              <span
                                className={headerToolbarIconClass}
                                aria-hidden
                                dangerouslySetInnerHTML={{ __html: iconMoreOptionsSvg }}
                              />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 pb-4 pt-3">
                <DataPolicyDisclaimer />
              </div>
            </div>
          ) : ( 
            <>
              {/* Active conversation title */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-2">
                <Tooltip content="Chat history">
                  <button
                    type="button"
                    onClick={() => setShowHistory(true)}
                    className="no-drag flex size-8 shrink-0 items-center justify-center rounded transition-colors"
                    style={{ color: "#505258" }}
                    aria-label="Back to chat history"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#EBECF0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onMouseDown={(e) =>
                      (e.currentTarget.style.backgroundColor = "#DFE1E6")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.backgroundColor = "#EBECF0")
                    }
                  >
                    <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                </Tooltip>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {newChatBadgeConvId === activeConversationId && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: "#1868DB" }}
                    >
                      New
                    </span>
                  )}
                  <Tooltip content={activeConversation?.title || "New Chat"}>
                    <span className="block truncate text-sm font-medium" style={{ color: "#292A2E" }}>
                      {activeConversation?.title || "New Chat"}
                    </span>
                  </Tooltip>
                </div>
                <Tooltip content="New chat">
                  <button
                    type="button"
                    onClick={handleNewConversation}
                    className="no-drag flex size-8 shrink-0 items-center justify-center rounded transition-colors"
                    aria-label="Start a new conversation"
                    style={{ color: "#505258" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#EBECF0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onMouseDown={(e) =>
                      (e.currentTarget.style.backgroundColor = "#DFE1E6")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.backgroundColor = "#EBECF0")
                    }
                  >
                    <span
                      className={headerToolbarIconClass}
                      aria-hidden
                      dangerouslySetInnerHTML={{ __html: iconPlusSvg }}
                    />
                  </button>
                </Tooltip>
              </div>

              {/* Wiadomości */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <img src={aiAvatarIcon} alt="AI" className="w-6 h-6 rounded-lg" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        message.role === "user"
                          ? "text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                      style={message.role === "user" ? { backgroundColor: '#1868DB' } : {}}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <img src={aiAvatarIcon} alt="AI" className="w-6 h-6 rounded-lg" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="w-1.5 h-1.5 bg-gray-300 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-gray-300 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-gray-300 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="relative border-t border-gray-200 p-4">
                {tokenLimitExceeded && (
                  <div
                    className="mb-3 rounded-lg border px-3 py-2 text-xs leading-snug"
                    style={{
                      borderColor: "#FECACA",
                      backgroundColor: "#FEF2F2",
                      color: "#991B1B",
                    }}
                    role="status"
                  >
                    You have used all available tokens ({totalTokensUsed} / {TOKEN_LIMIT}). Sending
                    messages is disabled until your token allowance is increased or reset.
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      tokenLimitExceeded
                        ? "Token limit reached"
                        : "Chat with Appfire AI"
                    }
                    className="flex-1 cursor-text rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ 
                      '--tw-ring-color': '#1868DB',
                      border: '1px solid #DFE1E6',
                      backgroundColor: '#FAFBFC'
                    } as React.CSSProperties}
                    disabled={isThinking || tokenLimitExceeded}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isThinking || tokenLimitExceeded}
                    className="flex items-center justify-center text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ 
                      backgroundColor: '#1868DB',
                      width: '40px',
                      height: '40px'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#0D47A1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#1868DB';
                      }
                    }}
                  >
                    <Send width="18" height="18" />
                  </button>
                </div>
                <DataPolicyDisclaimer className="mt-2 text-xs text-gray-500" />
              </div>
            </>
          )}
        </motion.div>
      </Rnd>

      {/* Confirm Dialog dla usuwania */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete conversation?"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (confirmDelete) {
            handleDeleteConversation(confirmDelete.id);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Dropdown menu - renderowane przez Portal */}
      {openMenuId && menuPosition && createPortal(
        <>
          {/* Backdrop do zamykania menu */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => {
              handleCloseMenu();
              setMenuPosition(null);
            }}
          />
          <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-40"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditConversation(openMenuId);
                handleCloseMenu();
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: '#292A2E'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Edit2 className="w-3.5 h-3.5" style={{ color: '#292A2E' }} />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareConversation(openMenuId);
                handleCloseMenu();
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: '#292A2E'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Share2 className="w-3.5 h-3.5" style={{ color: '#292A2E' }} />
              <span>Share</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const conv = conversations.find((c) => c.id === openMenuId);
                if (conv) {
                  setConfirmDelete({ id: conv.id, title: conv.title });
                }
                handleCloseMenu();
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ 
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#FFEBE6';
                }
              }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              disabled={conversations.length === 1}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </motion.div>
        </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}