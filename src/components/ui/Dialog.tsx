"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ onClose, children, className }: DialogProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-[520px] max-h-[85vh] overflow-y-auto bg-background border border-border rounded-md shadow-sm p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
