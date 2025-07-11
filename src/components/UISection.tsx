import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Eye } from 'lucide-react';

const UISection: React.FC = () => {
  return (
    <div className="flex-1 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Code Editor Section */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="w-5 h-5" />
              Code Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-gray-50 rounded-md min-h-[500px]">
            <div className="text-center text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Custom Code Editor</p>
              <p className="text-sm mt-2">
                This area will contain a code editor<br />
                for writing custom components
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Component Preview Section */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5" />
              Component Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-gray-50 rounded-md min-h-[500px]">
            <div className="text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Live Preview</p>
              <p className="text-sm mt-2">
                This area will show the preview<br />
                of your custom components
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UISection;