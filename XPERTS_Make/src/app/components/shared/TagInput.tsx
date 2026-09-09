import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../ui/input";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Optional cap on number of tags. */
  max?: number;
}

/**
 * Chip-based multi-value input. Adds the current text as a tag on Enter or
 * comma; removes the last tag on Backspace when the field is empty. Used for
 * required-skills (project) and competencies (expert profile).
 */
export function TagInput({ value, onChange, placeholder, max }: TagInputProps) {
  const [text, setText] = useState("");

  const addTag = () => {
    const tag = text.trim().replace(/,$/, "");
    if (!tag) return;
    if (max && value.length >= max) return;
    if (!value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag]);
    }
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== tag))}
                className="rounded-full p-0.5 hover:bg-brand-100"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className="h-12 rounded-lg bg-input-background"
      />
    </div>
  );
}
