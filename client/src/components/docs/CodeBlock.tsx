import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const { toast } = useToast();
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied to your clipboard.",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <span className="text-gray-400 text-sm">{language}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-white h-6 w-6"
          title="Copy to clipboard"
        >
          <i className="far fa-copy"></i>
        </Button>
      </div>
      <div className="p-4 font-mono text-sm text-white overflow-x-auto">
        <pre>{code}</pre>
      </div>
    </div>
  );
}
