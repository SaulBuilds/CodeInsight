import CodeBlock from "./CodeBlock";

interface ApiOptionProps {
  title: string;
  code: string;
  description?: string;
}

export default function ApiOption({ title, code, description }: ApiOptionProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
      <h4 className="font-medium text-text dark:text-white">{title}</h4>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
      )}
      <div className="mt-2">
        <CodeBlock language="bash" code={code} />
      </div>
    </div>
  );
}
