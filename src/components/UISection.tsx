import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';

const UISection: React.FC = () => {
  const [cssCode, setCssCode] = useState(`/* CSS for your custom components */
.custom-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.custom-button:hover {
  background-color: #2563eb;
}

.custom-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.custom-card h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}`);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCssCode(value);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex gap-6 h-full">
        {/* Code Editor Section - Takes up 60% of width */}
        <div className="w-3/5">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="w-5 h-5" />
                CSS Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-[calc(100vh-200px)] border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="css"
                  value={cssCode}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    suggest: {
                      showKeywords: true,
                      showSnippets: true,
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Preview Section - Takes up 40% of width */}
        <div className="w-2/5">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5" />
                Component Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center bg-gray-50 rounded-md">
              <div className="text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Live Preview</p>
                <p className="text-sm mt-2">
                  This area will show the preview<br />
                  of your custom components
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  Preview functionality coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UISection;