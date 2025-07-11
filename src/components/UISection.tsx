import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useSyncCSSVariables } from '@/usecases/SyncCSSVariables';
import { useGetCSSVariables, useGetCSSCode } from '@/usecases/GetCSSVariables';
import { useUpdateMonacoCompletions } from '@/usecases/UpdateVariablesEditorCompletions';
import * as monaco from 'monaco-editor';

const UISection: React.FC = () => {
  const [cssCode, setCssCode] = useState(`/* CSS for your custom components */
/* Use CSS variables from your color ramps with autocomplete support */
.custom-button {
  background-color: #3b82f6; /* Try typing 'var(' to see your color ramp variables */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.custom-button:hover {
  background-color: #2563eb; /* Replace with var(--your-ramp-name-20) */
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

  // Sync CSS variables with color ramps
  useSyncCSSVariables();
  
  // Get CSS variables and generated CSS code
  const cssVariables = useGetCSSVariables();
  const generatedCSSCode = useGetCSSCode();
  
  // Variables Editor integration
  const variablesEditorRef = useRef<typeof monaco | null>(null);
  const completionProviderRef = useRef<monaco.IDisposable | null>(null);
  const updateVariablesEditorCompletions = useUpdateMonacoCompletions();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCssCode(value);
    }
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    variablesEditorRef.current = monacoInstance;
    
    // Update Variables Editor with CSS variables for autocomplete
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }
    completionProviderRef.current = updateVariablesEditorCompletions(cssVariables, monacoInstance);
  };

  // Update Variables Editor completions when CSS variables change
  useEffect(() => {
    if (variablesEditorRef.current && cssVariables.length > 0) {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
      completionProviderRef.current = updateVariablesEditorCompletions(cssVariables, variablesEditorRef.current);
    }
  }, [cssVariables, updateVariablesEditorCompletions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="flex-1 p-8">
      <div className="flex gap-6 h-full">
        {/* Code Editor Section - Takes up 60% of width */}
        <div className="w-3/5">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="w-5 h-5" />
              Variables Editor
            </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-[calc(100vh-200px)] border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="css"
                  value={cssCode}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
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