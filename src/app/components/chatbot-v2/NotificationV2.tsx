import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Sparkles } from "lucide-react";

interface NotificationV2Props {
  show: boolean;
  onClose: () => void;
}

export function NotificationV2({ show, onClose }: NotificationV2Props) {
  return (
    <AnimatePresence>
      {show && null}
    </AnimatePresence>
  );
}
