import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({ icon, title, description, className = "" }: FeatureCardProps) {
  return (
    <Card className={`bg-card/80 backdrop-blur-sm rounded-xl shadow-md border border-border/50 overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center">
            <i className={`fas fa-${icon} text-primary text-2xl`}></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
            <p className="text-foreground/70">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
