"use client";

import { useRef } from "react";
import { buttonClass } from "@/components/ui";

/**
 * A destructive form button that asks for confirmation before submitting to a
 * server action. Reused for all delete actions (single source of truth).
 */
export function ConfirmSubmit({
  action,
  fields,
  label,
  confirmMessage,
  variant = "danger",
  size = "sm",
}: {
  action: (fd: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  label: string;
  confirmMessage: string;
  variant?: "danger" | "outline" | "ghost";
  size?: "sm" | "md";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={action} className="inline">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="button"
        className={buttonClass(variant, size)}
        onClick={() => {
          if (window.confirm(confirmMessage)) formRef.current?.requestSubmit();
        }}
      >
        {label}
      </button>
    </form>
  );
}
