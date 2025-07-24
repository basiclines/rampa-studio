import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Loader2 } from 'lucide-react';

// Lazy load the Variables Editor component
const VariablesEditor = React.lazy(() => import('./VariablesEditor'));

// Loading fallback component
const VariablesEditorLoader: React.FC = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Code className="w-5 h-5" />
        Variables Editor
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
        <p className="text-lg font-medium">Loading Variables Editor...</p>
        <p className="text-sm mt-2">
          Setting up Monaco Editor and CSS autocomplete
        </p>
      </div>
    </CardContent>
  </Card>
);

// Main lazy-loaded component
const LazyVariablesEditor: React.FC = () => {
  return (
    <Suspense fallback={<VariablesEditorLoader />}>
      <VariablesEditor />
    </Suspense>
  );
};

export default LazyVariablesEditor;