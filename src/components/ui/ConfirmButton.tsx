"use client";

import { cn } from "@/lib/utils";

export function ConfirmButton({
  children,
  message,
  className,
  title,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="submit"
      title={title}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn("text-slate-400 hover:text-red-600", className)}
    >
      {children}
    </button>
  );
}
