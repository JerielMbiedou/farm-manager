import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";

export type DesignationSuggestion = {
  designation: string;
  prixMoyen?: number;
  frequence?: number;
  categorie?: string | null;
  unite?: string | null;
};

interface DesignationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: DesignationSuggestion) => void;
  suggestions: Array<DesignationSuggestion | string>;
  placeholder?: string;
}

const normalize = (s: string) =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function DesignationCombobox({ value, onChange, onSelectSuggestion, suggestions, placeholder }: DesignationComboboxProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Normaliser les suggestions au format objet
  const normalized: DesignationSuggestion[] = useMemo(
    () => (suggestions ?? []).map((s) => (typeof s === "string" ? { designation: s } : s)).filter((s) => s.designation),
    [suggestions]
  );

  const filtered = useMemo(() => {
    const needle = normalize(value || "");
    if (needle.length === 0) return normalized.slice(0, 10);
    return normalized.filter((s) => {
      const hay = normalize(s.designation);
      return hay.includes(needle) && hay !== needle;
    }).slice(0, 20);
  }, [value, normalized]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((s, i) => (
            <button
              key={`${s.designation}-${i}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex justify-between items-center gap-2"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s.designation);
                onSelectSuggestion?.(s);
                setOpen(false);
              }}
            >
              <span className="truncate">{s.designation}</span>
              {s.prixMoyen && s.prixMoyen > 0 ? (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.round(s.prixMoyen).toLocaleString("fr-FR")} FCFA{s.frequence ? ` · ${s.frequence}×` : ""}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
