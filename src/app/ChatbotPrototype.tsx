import { useState } from "react";
import { Link } from "react-router";
import { ChatButton } from "./components/ChatButton";
import { ChatOverlay } from "./components/ChatOverlay";
import { Notification } from "./components/Notification";
import { CHATBOT_LAST_UPDATE_DISPLAY } from "./lastUpdate";

export default function ChatbotPrototype() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Chatbot for BigPicture
          </h1>
          <p className="text-gray-600">
            Click the icon in the top right corner to start a conversation
          </p>
          <p
            className="mt-3 text-sm text-gray-500"
            title="Release stamp — edit CHATBOT_LAST_UPDATE_DISPLAY in src/app/lastUpdate.ts when shipping chatbot changes"
          >
            Last update: {CHATBOT_LAST_UPDATE_DISPLAY}
          </p>
        </div>
      </div>

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
