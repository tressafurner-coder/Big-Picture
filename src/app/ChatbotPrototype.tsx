import { useMemo, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Link } from "react-router";
import { ChatButton } from "./components/ChatButton";
import { ChatOverlay } from "./components/ChatOverlay";
import { Notification } from "./components/Notification";

export default function ChatbotPrototype() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const localLastUpdateDisplay = useMemo(() => {
    const d = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = d.getDate();
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${mon} ${year}, ${hh}:${mm}`;
  }, []);

  const handleNewResponse = () => {
    setIsChatOpen((currentChatOpen) => {
      if (!currentChatOpen) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
      return currentChatOpen;
    });
  };

  const handleChatButtonClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsChatOpen(true);
      setShowNotification(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-gray-50">
      <Link
        to="/"
        className="absolute left-4 top-4 z-10 text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
      >
        ← All prototypes
      </Link>

      <div className="flex min-h-dvh w-full items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Chatbot for BigPicture
          </h1>
          <p className="text-gray-600">
            Click the icon in the top right corner to start a conversation
          </p>
          <p
            className="mt-3 text-sm text-gray-500"
            title="Release stamp — regenerated with npm run dev/build from git (see generated/prototypeHubDates.ts)"
          >
            Last update: {localLastUpdateDisplay}
          </p>
        </div>
      </div>

      <p className="absolute bottom-6 left-4 flex max-w-xl items-start gap-2 text-left text-sm text-gray-500">
        <CircleAlert
          className="mt-0.5 size-4 shrink-0 text-red-600"
          strokeWidth={2.25}
          aria-hidden
        />
        <span>
          Type the phrase &ldquo;company token limit&rdquo; in the chat or send two messages to preview
          the chatbot token-limit messages.
        </span>
      </p>

      <ChatButton
        onClick={handleChatButtonClick}
        isThinking={isThinking}
        hasNotification={showNotification}
      />

      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onThinkingChange={setIsThinking}
        onNewResponse={handleNewResponse}
      />

      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
