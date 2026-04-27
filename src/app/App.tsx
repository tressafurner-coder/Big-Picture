import { useState } from "react";
import { ChatButton } from "./components/ChatButton";
import { ChatOverlay } from "./components/ChatOverlay";
import { Notification } from "./components/Notification";
import { LAST_UPDATE_DISPLAY } from "./lastUpdate";

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleNewResponse = () => {
    console.log('handleNewResponse called');
    // Sprawdzamy aktualny stan w momencie wywołania
    setIsChatOpen((currentChatOpen) => {
      console.log('Current isChatOpen:', currentChatOpen);
      if (!currentChatOpen) {
        console.log('Setting showNotification to TRUE');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      } else {
        console.log('Chat is open, NOT showing notification');
      }
      return currentChatOpen; // Nie zmieniamy stanu
    });
  };

  const handleChatButtonClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsChatOpen(true);
      setShowNotification(false); // Wyczyść notyfikację gdy otwieramy chat
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-gray-50">
      <div className="flex min-h-dvh w-full items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chatbot for BigPicture</h1>
          <p className="text-gray-600">
            Click the icon in the top right corner to start a conversation
          </p>
          <p className="mt-3 text-sm text-gray-500" title="Release stamp — edit src/app/lastUpdate.ts when shipping changes">
            Last update: {LAST_UPDATE_DISPLAY}
          </p>
        </div>
      </div>

      <ChatButton
        onClick={handleChatButtonClick}
        isThinking={isThinking}
        hasNotification={showNotification}
      />

      {/* Overlay z czatem */}
      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onThinkingChange={setIsThinking}
        onNewResponse={handleNewResponse}
      />

      {/* Notyfikacja */}
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
