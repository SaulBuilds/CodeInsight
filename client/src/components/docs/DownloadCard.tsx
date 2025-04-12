import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DownloadCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export default function DownloadCard({
  icon,
  title,
  description,
  buttonText,
  href,
}: DownloadCardProps) {
  return (
    <Card className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
      <CardContent className="p-5">
        <div className="text-4xl text-secondary dark:text-blue-400 mb-3">
          <i className={`fas fa-${icon}`}></i>
        </div>
        <h3 className="text-lg font-semibold text-text dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button className="bg-secondary hover:bg-blue-700 text-white">
            <i className="fas fa-download mr-2"></i> {buttonText}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
