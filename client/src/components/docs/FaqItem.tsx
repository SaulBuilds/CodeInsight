import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
}

export default function FaqItem({ question, answer, isOpen = false }: FaqItemProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  return (
    <Card className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button 
        className="flex justify-between items-center w-full px-6 py-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h3 className="text-lg font-medium text-text dark:text-white">{question}</h3>
        <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-500 dark:text-gray-400`}></i>
      </button>
      <div 
        className={cn(
          "px-6 pb-4 text-gray-600 dark:text-gray-300", 
          isExpanded ? "block" : "hidden"
        )}
      >
        <p className="whitespace-pre-line">{answer}</p>
      </div>
    </Card>
  );
}
