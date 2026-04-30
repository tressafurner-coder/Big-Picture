import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogV2Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialogV2({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogV2Props) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10050] bg-black/50 pointer-events-auto"
            onClick={onCancel}
            aria-hidden
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed top-1/2 left-1/2 z-[10051] max-w-sm w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: "transparent",
                      color: "#292A2E",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EBECF0"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    onMouseDown={(e) => e.currentTarget.style.backgroundColor = "#DFE1E6"}
                    onMouseUp={(e) => e.currentTarget.style.backgroundColor = "#EBECF0"}
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: "#DE350B" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#BF2600"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#DE350B"}
                    onMouseDown={(e) => e.currentTarget.style.backgroundColor = "#A02000"}
                    onMouseUp={(e) => e.currentTarget.style.backgroundColor = "#BF2600"}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
