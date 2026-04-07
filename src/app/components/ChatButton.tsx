import { motion } from "motion/react";
import chatIconUrl from "../../assets/chat-bot-icon-square.png";

interface ChatButtonProps {
  onClick: () => void;
  isThinking: boolean;
  hasNotification: boolean;
}

export function ChatButton({ onClick, isThinking, hasNotification }: ChatButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-6 right-6 w-16 h-16 flex items-center justify-center z-[60]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulsujący efekt podczas myślenia - świecący pierścień wokół ikony */}
      {isThinking && (
        <motion.div
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-lg"
          style={{
            backgroundColor: "#1868DB",
            boxShadow: "0 0 12px rgba(24, 104, 219, 0.35)",
          }}
          animate={{
            opacity: [0.28, 0.52, 0.28],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.75,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Ikona chatbota */}
      <img src={chatIconUrl} alt="AI Chat" className="h-8 w-8 relative z-10 rounded-lg object-contain" />

      {/* Badge notyfikacji - UPROSZCZONA WERSJA */}
      {hasNotification && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute rounded-full border-2 border-white shadow-lg"
          style={{ 
            zIndex: 100, 
            backgroundColor: '#F5A623',
            top: '16px',
            right: '16px',
            width: '10px',
            height: '10px'
          }}
        />
      )}
    </motion.button>
  );
}