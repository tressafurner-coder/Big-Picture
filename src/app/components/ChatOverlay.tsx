import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import {
  Send,
  Edit2,
  Trash2,
  Coins,
  MessageSquarePlus,
  X,
  ArrowLeft,
  Sparkles,
  Search,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
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
import { cn } from "./ui/utils";

const headerToolbarIconClass =
  "inline-flex size-8 shrink-0 [&>svg]:block [&>svg]:size-full [&_path]:fill-current";

const headerToolbarStrokeIconClass =
  "inline-flex size-8 shrink-0 items-center justify-center [&>svg]:block [&>svg]:size-[18px] [&>svg]:origin-center [&_path]:fill-none [&_path]:stroke-current";

/** Shared token budget across all conversations (UI + mock usage). */
const TOKEN_LIMIT = 2000;

/** Prototype: exhausted budget after this many user messages in the active conversation. */
const USER_MESSAGES_TOKEN_LIMIT = 2;

function tokenUsageFromUserMessageCount(userMessagesSent: number): {
  totalTokensUsed: number;
  tokenLimitExceeded: boolean;
} {
  if (userMessagesSent >= USER_MESSAGES_TOKEN_LIMIT) {
    return { totalTokensUsed: TOKEN_LIMIT, tokenLimitExceeded: true };
  }
  if (userMessagesSent >= 1) {
    return { totalTokensUsed: Math.floor(TOKEN_LIMIT / 2), tokenLimitExceeded: false };
  }
  return { totalTokensUsed: 0, tokenLimitExceeded: false };
}

/** Prototype demo: send this message to show organization-wide token pool exhausted. */
function isCompanyTokenLimitDemoMessage(text: string): boolean {
  const normalized = text
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ");
  return normalized === "company token limit";
}

const ASSISTANT_GREETING = "Hi! I'm Appfire AI. How can I help you?";

const TITLE_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "have",
  "your",
  "about",
  "what",
  "when",
  "where",
  "how",
  "why",
  "you",
  "are",
  "czy",
  "jak",
  "co",
  "się",
  "oraz",
  "dla",
  "który",
  "która",
  "chat",
  "chatbot",
]);

const STARTER_PROMPTS = [
  "How to implement SAFe® in BigPicture",
  "Learn how BigPicture is easy as 1-2-3",
  "Summarize the main product releases from the recent cycle, highlighting key features and improvements.",
] as const;

const THINKING_STATUS_TEMPLATES = [
  "Processing your request...",
  "Analyzing your question...",
  "Gathering relevant information...",
  "Preparing a response...",
  "Working on the best answer...",
  "Reviewing the available context...",
  "Putting the answer together...",
  "Checking what's most relevant...",
  "Almost there...",
  "Finalizing the response...",
] as const;

const THINKING_TYPE_SPEED_MS = 130;
const THINKING_STATUS_PAUSE_MS = 2800;

/** Fade + slight upward drift when prompts hide as the user types — avoids a hard cut. */
const starterPromptListVariants = {
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] },
  },
  hide: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};

const STYLE_GUIDE_DEMO_MARKDOWN = `# 1) Heading level 1 (H1)
## 2) Heading level 2 (H2)
### 3) Heading level 3 (H3)

This is the first paragraph block. It demonstrates standard body text spacing.

This is the second paragraph block. Keep a visible gap between text blocks so content is easier to scan.

**Links:** Use descriptive labels, for example [Atlassian Design System](https://atlassian.design/).

**Lists (unordered + ordered):**
- First unordered item
- Second unordered item
- Third unordered item

1. First ordered item
2. Second ordered item
3. Third ordered item

---

> **Blockquote:** Use this style for quoted text, notes, or contextual callouts from external sources.

**Table example:**
| Element | Markdown syntax |
| --- | --- |
| Heading H1 | \`# Heading\` |
| Heading H2 | \`## Heading\` |
| Code block | \`\`\`ts ... \`\`\` |

**Highlight:** Use ==highlight== to emphasize key phrases in long responses.

**Inline code:** Example \`const status = "ok"\`.

\`\`\`tsx
// Code block example
function Greeting() {
  return <h1>Hello from a code block</h1>;
}
\`\`\``;

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
  contentType?: "plain" | "markdown";
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  totalTokens: number;
  createdAt: Date;
}

function summarizeConversationTitle(messages: Message[], fallback: string): string {
  const source = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const significant = source
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !TITLE_STOP_WORDS.has(word))
    .slice(0, 5);

  if (significant.length === 0) return fallback;

  const title = significant
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return title.length > 56 ? `${title.slice(0, 53)}...` : title;
}

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onThinkingChange: (isThinking: boolean) => void;
  onNewResponse: () => void;
}

export function ChatOverlay({ isOpen, onClose, onThinkingChange, onNewResponse }: ChatOverlayProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatusIdx, setThinkingStatusIdx] = useState(0);
  const [thinkingTypedLength, setThinkingTypedLength] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [newChatBannerVisible, setNewChatBannerVisible] = useState(false);
  const [newChatBadgeConvId, setNewChatBadgeConvId] = useState<string | null>(null);
  /** Prototype: organization shared pool exhausted (user personal usage stays 0). */
  const [companyTokenLimitDemoActive, setCompanyTokenLimitDemoActive] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  /** Assistant message ids where the inline feedback bar was dismissed or submitted. */
  const [feedbackHiddenIds, setFeedbackHiddenIds] = useState<Set<string>>(() => new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  /** Scroll target: top of the latest assistant bubble (read long replies from the beginning). */
  const latestAssistantScrollAnchorRef = useRef<HTMLDivElement | null>(null);
  /** Avoid re-scrolling on every streaming chunk for the same assistant message id. */
  const lastScrolledAssistantMsgIdRef = useRef<string | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const newChatTimersRef = useRef<number[]>([]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const userMessagesInActiveChat = activeConversation
    ? activeConversation.messages.filter((m) => m.role === "user").length
    : 0;
  const personalTokenUsage = tokenUsageFromUserMessageCount(userMessagesInActiveChat);
  const companyTokenLimitExceeded = companyTokenLimitDemoActive;
  const personalTokenLimitExceeded = personalTokenUsage.tokenLimitExceeded;
  const tokenLimitExceeded = companyTokenLimitExceeded || personalTokenLimitExceeded;
  const totalTokensUsed = companyTokenLimitExceeded ? 0 : personalTokenUsage.totalTokensUsed;

  const showConversationTitleBar =
    !!activeConversation && activeConversation.messages.some((m) => m.role === "user");

  const showStarterPrompts =
    !tokenLimitExceeded && !isThinking && !activeConversation && inputValue.trim().length === 0;

  const filteredConversations = useMemo(() => {
    const q = historySearchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      if (conv.title.toLowerCase().includes(q)) return true;
      const dateStr = new Date(conv.createdAt).toLocaleDateString().toLowerCase();
      return dateStr.includes(q);
    });
  }, [conversations, historySearchQuery]);
  const hasConversations = conversations.length > 0;

  useEffect(() => {
    lastScrolledAssistantMsgIdRef.current = null;
  }, [activeConversationId]);

  useEffect(() => {
    const msgs = activeConversation?.messages;
    if (!msgs?.length) return;

    const last = msgs[msgs.length - 1];

    if (last.role === "assistant") {
      if (lastScrolledAssistantMsgIdRef.current === last.id) return;
      lastScrolledAssistantMsgIdRef.current = last.id;
      window.requestAnimationFrame(() => {
        latestAssistantScrollAnchorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      });
      return;
    }

    lastScrolledAssistantMsgIdRef.current = null;
    window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (!showHistory) setHistorySearchQuery("");
  }, [showHistory]);

  useEffect(() => {
    if (!isThinking) {
      setThinkingStatusIdx(0);
      setThinkingTypedLength(0);
      return;
    }
    const full = THINKING_STATUS_TEMPLATES[thinkingStatusIdx];
    const delay =
      thinkingTypedLength < full.length
        ? THINKING_TYPE_SPEED_MS
        : THINKING_STATUS_PAUSE_MS;
    const timer = window.setTimeout(() => {
      if (thinkingTypedLength < full.length) {
        setThinkingTypedLength((len) => len + 1);
      } else {
        setThinkingStatusIdx(
          (prev) => (prev + 1) % THINKING_STATUS_TEMPLATES.length,
        );
        setThinkingTypedLength(0);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [isThinking, thinkingStatusIdx, thinkingTypedLength]);

  // Keep focus on the chat input whenever the conversation view is visible (skip while thinking — input is disabled)
  useEffect(() => {
    if (!isOpen || showHistory || confirmDelete || tokenLimitExceeded || isThinking) return;
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

  const renderInlineMarkdown = (text: string) => {
    const tokens = text.split(/(\[[^\]]+\]\([^)]+\)|`[^`]+`|==[^=]+==)/g).filter(Boolean);

    return tokens.map((token, index) => {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={`${token}-${index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline hover:opacity-80"
            style={{ color: "#1868DB" }}
          >
            {linkMatch[1]}
          </a>
        );
      }

      if (token.startsWith("`") && token.endsWith("`")) {
        return (
          <code
            key={`${token}-${index}`}
            className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[12px] text-gray-800"
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      if (token.startsWith("==") && token.endsWith("==")) {
        return (
          <mark
            key={`${token}-${index}`}
            className="rounded px-1 py-0.5"
            style={{ backgroundColor: "#FFF0B3", color: "#172B4D" }}
          >
            {token.slice(2, -2)}
          </mark>
        );
      }

      return <span key={`${token}-${index}`}>{token}</span>;
    });
  };

  const renderMarkdownContent = (content: string) => {
    const lines = content.split("\n");
    const blocks: ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i += 1;
        continue;
      }

      if (trimmed.startsWith("```")) {
        const lang = trimmed.slice(3).trim();
        i += 1;
        const codeLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i += 1;
        }
        if (i < lines.length) i += 1;

        blocks.push(
          <div key={`code-${blocks.length}`} className="my-3 overflow-hidden rounded-lg border border-gray-300 bg-gray-900">
            {lang && <div className="border-b border-gray-700 px-3 py-1.5 text-[11px] uppercase tracking-wide text-gray-300">{lang}</div>}
            <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-gray-100">
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        continue;
      }

      if (/^-{3,}$/.test(trimmed)) {
        blocks.push(<hr key={`hr-${blocks.length}`} className="my-4 border-gray-300" />);
        i += 1;
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        const headingClass =
          level === 1
            ? "mt-2 text-lg font-semibold text-gray-900"
            : level === 2
              ? "mt-2 text-base font-semibold text-gray-900"
              : "mt-2 text-sm font-semibold text-gray-800";

        blocks.push(
          <div key={`heading-${blocks.length}`} className={headingClass}>
            {renderInlineMarkdown(headingText)}
          </div>
        );
        i += 1;
        continue;
      }

      if (trimmed.startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i += 1;
        }
        blocks.push(
          <blockquote
            key={`quote-${blocks.length}`}
            className="my-3 rounded-r-md border-l-4 border-blue-500 bg-blue-50 px-3 py-2 text-sm leading-relaxed text-gray-800"
          >
            {quoteLines.map((quoteLine, quoteIdx) => (
              <p key={`quote-line-${quoteIdx}`}>{renderInlineMarkdown(quoteLine)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i += 1;
        }

        const rows = tableLines
          .map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean))
          .filter((row) => row.length > 0);

        const hasHeaderSeparator =
          rows.length > 1 &&
          rows[1].every((cell) => /^:?-{3,}:?$/.test(cell));

        const header = rows[0] ?? [];
        const body = hasHeaderSeparator ? rows.slice(2) : rows.slice(1);

        blocks.push(
          <div key={`table-${blocks.length}`} className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse rounded-md border border-gray-300 text-left text-xs">
              <thead className="bg-gray-200">
                <tr>
                  {header.map((cell, cellIdx) => (
                    <th key={`head-${cellIdx}`} className="border border-gray-300 px-2.5 py-2 font-semibold text-gray-800">
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIdx) => (
                  <tr key={`row-${rowIdx}`} className="bg-white">
                    {row.map((cell, cellIdx) => (
                      <td key={`cell-${rowIdx}-${cellIdx}`} className="border border-gray-300 px-2.5 py-2 align-top text-gray-700">
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i += 1;
        }
        blocks.push(
          <ol key={`ol-${blocks.length}`} className="my-2 list-decimal space-y-1 pl-5 text-sm text-gray-800">
            {items.map((item, itemIdx) => (
              <li key={`ol-item-${itemIdx}`}>{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i += 1;
        }
        blocks.push(
          <ul key={`ul-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5 text-sm text-gray-800">
            {items.map((item, itemIdx) => (
              <li key={`ul-item-${itemIdx}`}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      const paragraphLines: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const candidate = lines[i].trim();
        if (
          candidate.startsWith("```") ||
          /^#{1,3}\s+/.test(candidate) ||
          /^>\s?/.test(candidate) ||
          /^[-*]\s+/.test(candidate) ||
          /^\d+\.\s+/.test(candidate) ||
          /^-{3,}$/.test(candidate) ||
          (candidate.startsWith("|") && candidate.endsWith("|"))
        ) {
          break;
        }
        paragraphLines.push(candidate);
        i += 1;
      }

      if (paragraphLines.length > 0) {
        blocks.push(
          <p key={`p-${blocks.length}`} className="my-2 text-sm leading-relaxed text-gray-800">
            {renderInlineMarkdown(paragraphLines.join(" "))}
          </p>
        );
      } else {
        i += 1;
      }
    }

    return blocks;
  };


  const handleSendMessage = async (preset?: string) => {
    // Only treat a string preset as override — React may pass a click event if wired as onClick={handleSendMessage}.
    const text = (typeof preset === "string" ? preset : inputValue).trim();
    if (!text) return;

    if (isCompanyTokenLimitDemoMessage(text)) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        tokens: 0,
      };
      const conversationId = activeConversation?.id ?? `${Date.now()}-conv`;
      const isNewConversation = !activeConversation;

      setCompanyTokenLimitDemoActive(true);
      if (isNewConversation) {
        const nextIndex = conversations.length + 1;
        const fallbackTitle = `Conversation ${nextIndex}`;
        const newConv: Conversation = {
          id: conversationId,
          title: summarizeConversationTitle([userMessage], fallbackTitle),
          messages: [userMessage],
          totalTokens: 0,
          createdAt: new Date(),
        };
        setConversations((prev) => [...prev, newConv]);
        setActiveConversationId(conversationId);
      } else {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== conversationId) return conv;
            const nextMessages = [...conv.messages, userMessage];
            return {
              ...conv,
              messages: nextMessages,
              totalTokens: 0,
              title: summarizeConversationTitle(nextMessages, conv.title),
            };
          }),
        );
      }
      setShowHistory(false);
      setInputValue("");
      setIsThinking(false);
      onThinkingChange(false);
      return;
    }

    if (tokenLimitExceeded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      tokens: Math.ceil(text.split(" ").length * 1.3),
    };

    const conversationId = activeConversation?.id ?? `${Date.now()}-conv`;
    const isNewConversation = !activeConversation;

    if (isNewConversation) {
      const nextIndex = conversations.length + 1;
      const fallbackTitle = `Conversation ${nextIndex}`;
      const newConv: Conversation = {
        id: conversationId,
        title: summarizeConversationTitle([userMessage], fallbackTitle),
        messages: [userMessage],
        totalTokens: userMessage.tokens || 0,
        createdAt: new Date(),
      };
      setConversations((prev) => [...prev, newConv]);
      setActiveConversationId(conversationId);
    } else {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== conversationId) return conv;
          const nextMessages = [...conv.messages, userMessage];
          return {
            ...conv,
            messages: nextMessages,
            totalTokens: conv.totalTokens + (userMessage.tokens || 0),
            title: summarizeConversationTitle(nextMessages, conv.title),
          };
        })
      );
    }

    setInputValue("");
    setIsThinking(true);
    onThinkingChange(true);

    // Symulacja odpowiedzi AI
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: STYLE_GUIDE_DEMO_MARKDOWN,
        contentType: "markdown",
        tokens: 120,
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== conversationId) return conv;
          const nextMessages = [...conv.messages, assistantMessage];
          return {
            ...conv,
            messages: nextMessages,
            totalTokens: conv.totalTokens + (assistantMessage.tokens || 0),
            title: summarizeConversationTitle(nextMessages, conv.title),
          };
        })
      );

      setIsThinking(false);
      onThinkingChange(false);
      console.log('ChatOverlay: Calling onNewResponse()');
      onNewResponse();
    }, 12000);
  };

  const handleNewConversation = () => {
    if (tokenLimitExceeded) return;

    newChatTimersRef.current.forEach((id) => window.clearTimeout(id));
    newChatTimersRef.current = [];

    setCompanyTokenLimitDemoActive(false);
    setActiveConversationId("");
    setShowHistory(false);
    setInputValue("");
    setEditingConvId(null);
    setEditingTitle("");
    setNewChatBannerVisible(true);
    setNewChatBadgeConvId(null);

    newChatTimersRef.current.push(
      window.setTimeout(() => setNewChatBannerVisible(false), 6500)
    );
  };

  const dismissNewChatBanner = () => {
    setNewChatBannerVisible(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
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

  const handleOpenInNewPage = () => {
    // Otwiera chatbota w nowym oknie/zakładce
    const newWindow = window.open(window.location.href, '_blank', 'width=450,height=600');
    if (newWindow) {
      newWindow.focus();
    }
  };

  const handleHistoryToggle = () => {
    if (showHistory && conversations.length === 0) {
      setShowHistory(false);
      setActiveConversationId("");
      return;
    }
    setShowHistory(!showHistory);
  };

  const newChatTooltip = companyTokenLimitExceeded
    ? "Organization token limit reached — a new company credit pool is available at the beginning of each month."
    : personalTokenLimitExceeded
      ? "Token limit reached — a new credit pool is available at the beginning of each month."
      : "New chat";

  const tokenLimitBannerMessage = companyTokenLimitExceeded
    ? `Your organization has used all available tokens (you have used 0 / ${TOKEN_LIMIT}). The shared token pool will reset at the beginning of the month.`
    : `You have used all available tokens (${totalTokensUsed} / ${TOKEN_LIMIT}). Your token balance will reset at the beginning of each month.`;

  const tokenLimitTooltip = companyTokenLimitExceeded
    ? `Organization limit reached (0 / ${TOKEN_LIMIT} used by you). Your company's shared tokens are exhausted.`
    : personalTokenLimitExceeded
      ? `Token limit reached (${totalTokensUsed} / ${TOKEN_LIMIT}). A new credit pool is available at the beginning of each month.`
      : `Tokens (this conversation): ${totalTokensUsed} / ${TOKEN_LIMIT}`;

  const tokenLimitPlaceholder = companyTokenLimitExceeded
    ? "Organization token limit reached"
    : "Token limit reached";

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
              <Tooltip content={tokenLimitTooltip}>
                <button
                  type="button"
                  className="no-drag flex items-center justify-center rounded p-1.5 transition-colors"
                  style={tokenLimitExceeded ? { color: "#DC2626" } : { color: "#505258" }}
                  aria-label={
                    companyTokenLimitExceeded
                      ? "Organization token limit reached — shared pool exhausted"
                      : tokenLimitExceeded
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
                  onClick={handleHistoryToggle}
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
                    className={headerToolbarStrokeIconClass}
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
            {newChatBannerVisible && (
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
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug" style={{ color: "#292A2E" }}>
                      You&apos;ve started a new conversation with the chatbot — you&apos;ll find all your chats in{" "}
                      <strong>Chat history</strong>.
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
              {/* Ta sama wysokość co pasek rozmowy; ikona „+” w tym samym miejscu co w czacie */}
              <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-100 px-4">
                <span className="min-w-0 flex-1 truncate text-base font-semibold text-gray-700">
                  Chat history
                </span>
                <Tooltip
                  content={newChatTooltip}
                  className={tokenLimitExceeded ? "cursor-not-allowed" : undefined}
                >
                  <button
                    type="button"
                    onClick={handleNewConversation}
                    disabled={tokenLimitExceeded}
                    className="no-drag flex size-8 shrink-0 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Start a new conversation"
                    style={{ color: "#505258" }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#EBECF0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#DFE1E6";
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#EBECF0";
                      }
                    }}
                  >
                    <span
                      className={headerToolbarIconClass}
                      aria-hidden
                      dangerouslySetInnerHTML={{ __html: iconPlusSvg }}
                    />
                  </button>
                </Tooltip>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                {hasConversations && (
                  <div className="relative mb-3">
                    <Search
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search conversations…"
                      className="no-drag w-full cursor-text rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                      style={
                        { "--tw-ring-color": "#1868DB" } as React.CSSProperties
                      }
                      aria-label="Search conversations"
                    />
                  </div>
                )}
                {!hasConversations ? (
                  <div className="flex h-full min-h-[260px] w-full flex-col items-center justify-center rounded-xl bg-white px-4 py-8 text-center sm:min-h-[320px] sm:px-6 sm:py-10">
                    <p className="text-[20px] font-semibold leading-[1.2] text-gray-900">
                      No saved chats yet
                    </p>
                    <p className="mt-3 max-w-[320px] text-[14px] leading-[1.4] text-gray-800">
                      Write something in the chat — your first message saves the conversation here.
                    </p>
                    <Tooltip
                      content={newChatTooltip}
                      className={tokenLimitExceeded ? "cursor-not-allowed" : undefined}
                    >
                      <button
                        type="button"
                        onClick={handleNewConversation}
                        disabled={tokenLimitExceeded}
                        className="no-drag mt-8 inline-flex h-8 items-center justify-center rounded-lg px-5 text-[14px] font-semibold leading-none text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: "#1868DB" }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = "#0D47A1";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = "#1868DB";
                          }
                        }}
                      >
                        <span>Start a new chat</span>
                      </button>
                    </Tooltip>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No conversations match your search.
                  </p>
                ) : (
                  filteredConversations.map((conv) => (
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
                  ))
                )}
                </div>
              <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 pb-4 pt-3">
                <DataPolicyDisclaimer />
              </div>
            </div>
          ) : ( 
            <>
              <AnimatePresence initial={false}>
                {showConversationTitleBar && (
                  <motion.div
                    key="conversation-title-bar"
                    role="region"
                    aria-label="Active conversation"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 48 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="no-drag shrink-0 overflow-hidden border-b border-gray-200 bg-gray-100"
                  >
                    <div className="flex h-12 items-center gap-2 px-4">
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
                        {activeConversationId &&
                        editingConvId === activeConversationId ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveEdit();
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                handleCancelEdit();
                              }
                            }}
                            onBlur={() => {
                              if (editingTitle.trim()) handleSaveEdit();
                              else handleCancelEdit();
                            }}
                            className="no-drag h-8 min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 text-sm font-normal text-gray-900 focus:border-transparent focus:outline-none focus:ring-2"
                            style={
                              { "--tw-ring-color": "#1868DB" } as React.CSSProperties
                            }
                            autoFocus
                            aria-label="Conversation title"
                          />
                        ) : (
                          <Tooltip
                            content={
                              activeConversation?.title?.trim() || "New Chat"
                            }
                          >
                            <button
                              type="button"
                              className="no-drag flex h-8 min-w-0 flex-1 cursor-pointer items-center overflow-hidden rounded border border-transparent px-2 text-left text-sm font-medium transition-colors hover:border-gray-300"
                              style={{ color: "#292A2E" }}
                              aria-label={`Rename: ${activeConversation?.title || "New Chat"}`}
                              onClick={() =>
                                activeConversationId &&
                                handleEditConversation(activeConversationId)
                              }
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {activeConversation?.title || "New Chat"}
                              </span>
                            </button>
                          </Tooltip>
                        )}
                      </div>
                      <Tooltip
                        content={newChatTooltip}
                        className={tokenLimitExceeded ? "cursor-not-allowed" : undefined}
                      >
                        <button
                          type="button"
                          onClick={handleNewConversation}
                          disabled={tokenLimitExceeded}
                          className="no-drag flex size-8 shrink-0 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Start a new conversation"
                          style={{ color: "#505258" }}
                          onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = "#EBECF0";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }
                          }}
                          onMouseDown={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = "#DFE1E6";
                            }
                          }}
                          onMouseUp={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = "#EBECF0";
                            }
                          }}
                        >
                          <span
                            className={headerToolbarIconClass}
                            aria-hidden
                            dangerouslySetInnerHTML={{ __html: iconPlusSvg }}
                          />
                        </button>
                      </Tooltip>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wiadomości */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!activeConversation && (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <img src={aiAvatarIcon} alt="AI" className="h-6 w-6 rounded-lg" />
                      </div>
                      <div className="max-w-[75%] rounded-2xl bg-gray-100 px-4 py-2.5 text-gray-900">
                        <p className="text-sm leading-relaxed">{ASSISTANT_GREETING}</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeConversation?.messages.map((message, msgIndex) => {
                  const isMarkdownAssistant =
                    message.role === "assistant" && message.contentType === "markdown";

                  const assistantOrdinal = activeConversation.messages
                    .slice(0, msgIndex + 1)
                    .filter((m) => m.role === "assistant").length;

                  const showHelpfulnessPrompt =
                    message.role === "assistant" &&
                    assistantOrdinal > 0 &&
                    assistantOrdinal % 3 === 0 &&
                    !feedbackHiddenIds.has(message.id);

                  const isLatestAssistantBubble =
                    message.role === "assistant" &&
                    msgIndex === activeConversation.messages.length - 1;

                  return (
                    <div
                      key={message.id}
                      ref={isLatestAssistantBubble ? latestAssistantScrollAnchorRef : undefined}
                      className={cn(
                        "flex flex-col gap-1",
                        isLatestAssistantBubble && "scroll-mt-3",
                      )}
                    >
                      <div
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                            <img src={aiAvatarIcon} alt="AI" className="h-6 w-6 rounded-lg" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isMarkdownAssistant
                              ? "max-w-[92%] bg-gray-100 text-gray-900"
                              : message.role === "user"
                                ? "max-w-[75%] text-white"
                                : "max-w-[75%] bg-gray-100 text-gray-900"
                          }`}
                          style={message.role === "user" ? { backgroundColor: "#1868DB" } : {}}
                        >
                          {isMarkdownAssistant ? (
                            <div className="space-y-1">{renderMarkdownContent(message.content)}</div>
                          ) : (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}
                        </div>
                      </div>

                      {showHelpfulnessPrompt && (
                        <div className="flex gap-3">
                          <div className="w-8 shrink-0" aria-hidden />
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 py-1.5 pr-0.5">
                            <p className="min-w-0 text-sm leading-snug text-gray-600">
                              Has this been helpful so far?
                            </p>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                className="no-drag flex size-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-200/80"
                                aria-label="Yes, helpful"
                                onClick={() =>
                                  setFeedbackHiddenIds((prev) => new Set(prev).add(message.id))
                                }
                              >
                                <ThumbsUp className="size-[18px]" strokeWidth={1.75} aria-hidden />
                              </button>
                              <button
                                type="button"
                                className="no-drag flex size-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-200/80"
                                aria-label="Not helpful"
                                onClick={() =>
                                  setFeedbackHiddenIds((prev) => new Set(prev).add(message.id))
                                }
                              >
                                <ThumbsDown className="size-[18px]" strokeWidth={1.75} aria-hidden />
                              </button>
                              <span
                                className="mx-1 h-4 w-px shrink-0 bg-gray-300"
                                aria-hidden
                              />
                              <button
                                type="button"
                                className="no-drag flex size-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-200/80"
                                aria-label="Dismiss"
                                onClick={() =>
                                  setFeedbackHiddenIds((prev) => new Set(prev).add(message.id))
                                }
                              >
                                <X className="size-[18px]" strokeWidth={1.75} aria-hidden />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <AnimatePresence initial={false}>
                  {showStarterPrompts && (
                    <motion.div
                      key="starter-prompts"
                      variants={starterPromptListVariants}
                      initial={false}
                      animate="show"
                      exit="hide"
                      className="pointer-events-none flex gap-3 justify-start overflow-hidden"
                    >
                      <div className="w-8 shrink-0" aria-hidden />
                      <div className="flex min-w-0 flex-1 flex-col gap-2 [&_button]:pointer-events-auto">
                        {STARTER_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => void handleSendMessage(prompt)}
                            className="no-drag flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left font-normal transition-colors hover:bg-gray-50"
                            aria-label={prompt}
                          >
                            <Sparkles
                              className="mt-0.5 size-5 shrink-0"
                              style={{ color: "#6554C0" }}
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="text-sm font-normal leading-snug text-gray-900">{prompt}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isThinking && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <img src={aiAvatarIcon} alt="AI" className="w-6 h-6 rounded-lg" />
                    </div>
                    <div className="max-w-[92%] rounded-2xl bg-gray-100 px-4 py-3 text-gray-900">
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
                      <div className="mt-2 min-h-[18px]">
                        <p className="text-xs font-medium leading-snug text-gray-700" aria-live="polite">
                          {THINKING_STATUS_TEMPLATES[thinkingStatusIdx].slice(
                            0,
                            thinkingTypedLength,
                          )}
                          <motion.span
                            className="ml-0.5 inline-block text-gray-500"
                            aria-hidden
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                          >
                            |
                          </motion.span>
                        </p>
                      </div>
                      <p className="mt-2 text-[11px] leading-snug text-gray-500">
                        Tip: you can minimize this window and come back when the answer is ready.
                      </p>
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
                    {tokenLimitBannerMessage}
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleSendMessage();
                    }}
                    placeholder={
                      tokenLimitExceeded ? tokenLimitPlaceholder : "Chat with Appfire AI"
                    }
                    className="no-drag flex-1 cursor-text select-text rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ 
                      '--tw-ring-color': '#1868DB',
                      border: '1px solid #DFE1E6',
                      backgroundColor: '#FAFBFC'
                    } as React.CSSProperties}
                    disabled={isThinking || tokenLimitExceeded}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!inputValue.trim() || isThinking || tokenLimitExceeded}
                    className="no-drag flex items-center justify-center text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const conv = conversations.find((c) => c.id === openMenuId);
                if (conv) {
                  setConfirmDelete({ id: conv.id, title: conv.title });
                }
                handleCloseMenu();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FFEBE6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
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