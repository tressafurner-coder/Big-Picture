import { useState } from "react";
import { Link } from "react-router";
import { ChatButtonV2 } from "./components/chatbot-v2/ChatButtonV2";
import { ChatOverlayV2 } from "./components/chatbot-v2/ChatOverlayV2";
import { NotificationV2 } from "./components/chatbot-v2/NotificationV2";
import { CHATBOT_LAST_UPDATE_DISPLAY } from "./lastUpdate";

export default function ChatbotPrototypeV2() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            AI Chatbot for BigPicture (Version 2)
          </h1>
          <p className="text-gray-600">
            Independent copy for the second version and separate iteration.
          </p>
          <p
            className="mt-3 text-sm text-gray-500"
            title="Release stamp — regenerated with npm run dev/build from git (see generated/prototypeHubDates.ts)"
          >
            Last update: {CHATBOT_LAST_UPDATE_DISPLAY}
          </p>
        </div>
      </div>

      <ChatButtonV2
        onClick={handleChatButtonClick}
        isThinking={isThinking}
        hasNotification={showNotification}
      />

      <ChatOverlayV2
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onThinkingChange={setIsThinking}
        onNewResponse={handleNewResponse}
      />

      <NotificationV2
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
