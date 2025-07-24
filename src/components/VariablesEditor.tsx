import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Editor from '@monaco-editor/react';
import { useSyncCSSVariables } from '@/usecases/SyncCSSVariables';
import { useGetCSSVariables } from '@/usecases/GetCSSVariables';
import { useUpdateMonacoCompletions } from '@/usecases/UpdateVariablesEditorCompletions';
import { useGetInitialCSS } from '@/usecases/GetCombinedCSS';
import { useSetUserCSS, useResetUserCSS } from '@/usecases/SetUserCSS';
import { useIsUserCSSModified } from '@/usecases/GetUserCSS';
import { useComponentProviderState } from '@/state/ComponentProviderState';
import { useGetProviderDefaultCSS } from '@/usecases/GetProviderDefaultCSS';
import * as monaco from 'monaco-editor';

const DEFAULT_CSS_TEMPLATE = ``;

const VariablesEditor: React.FC = () => {
  // Sync CSS variables with color ramps
  useSyncCSSVariables();
  
  // Get CSS variables and combined CSS code
  const cssVariables = useGetCSSVariables();
  const initialCSS = useGetInitialCSS();
  const isUserModified = useIsUserCSSModified();
  
  // Get provider state and default CSS
  const { selectedProvider } = useComponentProviderState();
  const providerDefaultCSS = useGetProviderDefaultCSS(selectedProvider);
  
  // User CSS state actions
  const setUserCSS = useSetUserCSS();
  const resetUserCSS = useResetUserCSS();
  
  // Variables Editor integration
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const variablesEditorRef = useRef<typeof monaco | null>(null);
  const completionProviderRef = useRef<monaco.IDisposable | null>(null);
  const updateVariablesEditorCompletions = useUpdateMonacoCompletions();

  // Get the CSS code to display in the editor
  const getCSSCode = () => {
    if (initialCSS && initialCSS.trim()) {
      return initialCSS;
    }
    // Combine provider default CSS with the default template
    return providerDefaultCSS + DEFAULT_CSS_TEMPLATE;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setUserCSS(value);
    }
  };

  const handleReset = () => {
    resetUserCSS();
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    variablesEditorRef.current = monacoInstance;
    
    // Update Variables Editor with CSS variables for autocomplete
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }
    completionProviderRef.current = updateVariablesEditorCompletions(cssVariables, monacoInstance);
  };

  // Update editor content when generated CSS changes (but only if user hasn't modified it)
  useEffect(() => {
    if (editorRef.current && !isUserModified) {
      const newContent = getCSSCode();
      const currentContent = editorRef.current.getValue();
      
      if (newContent !== currentContent) {
        editorRef.current.setValue(newContent);
      }
    }
  }, [initialCSS, isUserModified, providerDefaultCSS]);

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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Variables Editor
          </div>
          {isUserModified && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-[calc(100vh-200px)] border rounded-md overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="css"
            value={getCSSCode()}
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
  );
};

export default VariablesEditor;