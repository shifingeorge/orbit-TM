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
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/30 md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full h-full overflow-y-auto bg-background p-6 rounded-none border-0 md:h-auto md:max-w-[520px] md:max-h-[85vh] md:border md:border-border md:rounded-md md:shadow-sm",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
