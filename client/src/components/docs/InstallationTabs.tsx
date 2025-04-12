import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from "./CodeBlock";

export default function InstallationTabs() {
  return (
    <div className="mb-6">
      <Tabs defaultValue="npm">
        <TabsList className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="yarn">yarn</TabsTrigger>
          <TabsTrigger value="npx">npx</TabsTrigger>
        </TabsList>
        
        <TabsContent value="npm">
          <CodeBlock
            language="bash"
            code="$ npm install -g repo-scraper-cli"
          />
        </TabsContent>
        
        <TabsContent value="yarn">
          <CodeBlock
            language="bash"
            code="$ yarn global add repo-scraper-cli"
          />
        </TabsContent>
        
        <TabsContent value="npx">
          <CodeBlock
            language="bash"
            code="$ npx repo-scraper-cli [command] [options]"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
