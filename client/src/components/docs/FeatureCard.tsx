import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export default function FeatureCard({ title, description, icon, className = '' }: FeatureCardProps) {
  return (
    <div className={`border border-border/50 rounded-xl p-6 ${className}`}>
      <div className="flex items-start">
        <div className="mr-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className={`fas fa-${icon} text-lg`}></i>
          </div>
        </div>
        <div>
          <h3 className="font-serif font-medium text-lg mb-2">{title}</h3>
          <p className="text-sm text-foreground/70">{description}</p>
        </div>
      </div>
    </div>
  );
}