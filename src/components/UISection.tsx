import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import LazyVariablesEditor from './LazyVariablesEditor';
import ComponentsPlayground from './ComponentsPlayground';

const UISection: React.FC = () => {
  return (
    <div className="flex-1 p-8">
      <div className="flex gap-6 h-full">
        {/* Variables Editor Section - Takes up 60% of width */}
        <div className="w-3/5">
          <LazyVariablesEditor />
        </div>

        {/* Component Preview Section - Takes up 40% of width */}
        <div className="w-2/5">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5" />
                Component Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-[calc(100vh-200px)] overflow-auto">
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