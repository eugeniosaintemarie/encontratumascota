"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  className,
  onFocus,
  onBlur,
  id,
  ...props
}: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />

      <div className="flex w-full items-center gap-2">
        <Input
          readOnly
          value={
            value
              ? (() => {
                  const d = new Date(value);
                  if (isNaN(d.getTime())) return "";
                  const pad = (n: number) => n.toString().padStart(2, "0");
                  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                })()
              : ""
          }
          placeholder={placeholder}
          onClick={() =>
            inputRef.current?.showPicker?.() || inputRef.current?.focus()
          }
          className="bg-background text-foreground border-input placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

export default DatePicker;
