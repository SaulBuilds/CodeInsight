import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function Sidebar({ isVisible, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  // Define item type with optional external property
  type NavItem = {
    title: string;
    href: string;
    external?: boolean;
  };

  // Define sections for documentation
  const sections = [
    {
      title: 'Getting Started',
      expanded: true,
      items: [
        { title: 'Introduction', href: '/docs' },
        { title: 'Installation', href: '/docs/installation' },
        { title: 'Quick Start', href: '/docs/quick-start' }
      ] as NavItem[]
    },
    {
      title: 'CLI Commands',
      items: [
        { title: 'Repository Analysis', href: '/docs/code-extraction' },
        { title: 'Documentation Generation', href: '/docs/documentation-generation' },
        { title: 'Dependency Analysis', href: '/docs/dependency-analysis' },
        { title: 'Complexity Metrics', href: '/docs/complexity-metrics' },
        { title: 'Semantic Search', href: '/docs/semantic-search' },
        { title: 'Code Story', href: '/docs/code-story' },
        { title: 'GitHub Integration', href: '/docs/GitHub' }
      ] as NavItem[]
    },
    {
      title: 'OpenAI Integration',
      items: [
        { title: 'API Configuration', href: '/docs/openai-api' },
        { title: 'Document Generation', href: '/docs/documentation-generation' },
        { title: 'User Stories', href: '/docs/user-stories' }
      ] as NavItem[]
    },
    {
      title: 'Advanced Usage',
      items: [
        { title: 'Configuration', href: '/docs/configuration' },
        { title: 'Extending', href: '/docs/extending' },
        { title: 'Plugins', href: '/docs/plugins' }
      ] as NavItem[]
    },
    {
      title: 'Resources',
      items: [
        { title: 'Download Documentation', href: '/docs/download' },
        { 
          title: 'GitHub Repository', 
          href: 'https://github.com/saulbuilds/vibeinsights',
          external: true 
        },
        { title: 'Report an Issue', href: '/docs/report-issue' },
        { title: 'CLI Reference', href: '/cli-reference' }
      ] as NavItem[]
    }
  ];

  return (
    <div 
      className={`md:w-64 lg:w-80 md:block border-r border-border/50 bg-background/70 backdrop-blur-sm 
        ${isVisible ? 'fixed inset-0 z-40 bg-background' : 'hidden'} 
        md:static md:z-auto transition-all duration-200`}
    >
      <div className="p-4 h-full overflow-y-auto">
        <div className="md:hidden flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            aria-label="Close sidebar"
            className="absolute top-4 right-4"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
        
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-foreground mb-2">Documentation</h2>
        </div>
        
        <nav className="space-y-2">
          <Accordion type="multiple" defaultValue={['Getting Started']}>
            {sections.map((section, index) => (
              <AccordionItem key={index} value={section.title} className="border-border/40">
                <AccordionTrigger className="font-medium text-md hover:text-primary transition-all py-2">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-2 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      item.external ? (
                        <a 
                          key={itemIndex}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block py-1.5 px-2 rounded-md text-sm transition-colors hover:bg-muted hover:text-primary`}
                        >
                          {item.title} <i className="fas fa-external-link-alt text-xs ml-1"></i>
                        </a>
                      ) : (
                        <Link 
                          key={itemIndex} 
                          href={item.href}
                          className={`block py-1.5 px-2 rounded-md text-sm transition-colors 
                            ${location === item.href 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'hover:bg-muted hover:text-primary'
                            }`}
                          onClick={() => onClose()}
                        >
                          {item.title}
                        </Link>
                      )
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>
      </div>
    </div>
  );
}