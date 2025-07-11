import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Eye } from 'lucide-react';
import { useGetCSSVariables, useGetCSSCode } from '@/usecases/GetCSSVariables';
import LazyVariablesEditor from './LazyVariablesEditor';
import ComponentsPlayground from './ComponentsPlayground';

const UISection: React.FC = () => {
  // Get CSS variables and generated CSS code for display
  const cssVariables = useGetCSSVariables();
  const generatedCSSCode = useGetCSSCode();

  return (
    <div className="flex-1 p-8">
      <div className="flex gap-6 h-full">
                {/* Variables Editor Section - Takes up 60% of width */}
        <div className="w-3/5">
          <LazyVariablesEditor />
        </div>

        {/* Component Preview Section - Takes up 40% of width */}
        <div className="w-2/5 flex flex-col gap-6">
          {/* CSS Variables Display */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="w-5 h-5" />
                Generated CSS Variables ({cssVariables.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(50vh-100px)] overflow-auto">
                {generatedCSSCode ? (
                  <pre className="text-xs p-4 bg-gray-900 text-green-400 font-mono rounded-md overflow-auto">
                    {generatedCSSCode}
                  </pre>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No color ramps created yet</p>
                    <p className="text-xs mt-1">
                      Create color ramps to see CSS variables here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Component Preview */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5" />
                Component Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-[calc(50vh-100px)] overflow-auto">
                <ComponentsPlayground />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UISection;