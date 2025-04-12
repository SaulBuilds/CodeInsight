import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <CardContent className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
            <i className={`fas fa-${icon} text-secondary dark:text-blue-400 text-xl`}></i>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-text dark:text-white">{title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
