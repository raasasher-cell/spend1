import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = "Confirm", variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex gap-3 p-3 rounded-lg bg-slate-50">
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${variant === "danger" ? "text-red-500" : "text-amber-500"}`} />
          <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
