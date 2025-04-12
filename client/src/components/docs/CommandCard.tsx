import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "./CodeBlock";

interface CommandCardProps {
  title: string;
  icon: string;
  command: string;
  description: string;
  options?: { name: string; description: string }[];
  output?: string;
  generatedContent?: string[];
}

export default function CommandCard({
  title,
  icon,
  command,
  description,
  options,
  output,
  generatedContent,
}: CommandCardProps) {
  return (
    <Card className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-text dark:text-white flex items-center">
          <i className={`fas fa-${icon} text-secondary dark:text-blue-400 mr-2`}></i>
          {title}
        </h3>
        
        <div className="mt-4">
          <CodeBlock language="bash" code={command} />
        </div>
        
        <p className="mt-4 text-gray-600 dark:text-gray-300">{description}</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {options && options.length > 0 && (
            <div>
              <h4 className="font-medium text-text dark:text-white mb-2">Options:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                {options.map((option, index) => (
                  <li key={index}>
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono">
                      {option.name}
                    </code>
                    : {option.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {output && (
            <div>
              <h4 className="font-medium text-text dark:text-white mb-2">Example Output:</h4>
              <div className="text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-800 max-h-24 overflow-y-auto">
                <pre>{output}</pre>
              </div>
            </div>
          )}
          
          {generatedContent && generatedContent.length > 0 && (
            <div>
              <h4 className="font-medium text-text dark:text-white mb-2">Generated Content:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                {generatedContent.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-1"></i> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
