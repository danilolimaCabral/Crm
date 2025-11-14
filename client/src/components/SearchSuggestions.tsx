import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

// Sugestões comuns de produtos
const COMMON_PRODUCTS = [
  "fone bluetooth",
  "smartwatch",
  "câmera",
  "mouse gamer",
  "teclado mecânico",
  "caixa de som",
  "carregador wireless",
  "power bank",
  "fone de ouvido",
  "tablet",
  "notebook",
  "monitor",
  "webcam",
  "microfone",
  "headset",
  "joystick",
  "controle remoto",
  "lâmpada led",
  "ventilador",
  "aquecedor",
  "purificador de ar",
  "aspirador de pó",
  "ferro de passar",
  "liquidificador",
  "batedeira",
  "panela elétrica",
  "relógio inteligente",
  "pulseira fitness",
  "balança inteligente",
  "termômetro digital",
];

// Busca fuzzy simples
function fuzzyMatch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Match exato
  if (textLower.includes(queryLower)) return true;
  
  // Match por palavras
  const queryWords = queryLower.split(/\s+/);
  return queryWords.every(word => textLower.includes(word));
}

export default function SearchSuggestions({
  value,
  onChange,
  onSelect,
  placeholder = "Ex: fone bluetooth, smartwatch...",
  suggestions: customSuggestions,
}: SearchSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = customSuggestions || COMMON_PRODUCTS;

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter(item => fuzzyMatch(value, item));
      setFilteredSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(suggestions.slice(0, 5));
      setShowSuggestions(true);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 h-12"
        />
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border">
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
