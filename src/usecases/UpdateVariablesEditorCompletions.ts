import { CSSVariable } from '@/state/CSSVariablesState';
import * as monaco from 'monaco-editor';

/**
 * Pure function to convert CSS variables to Variables Editor completion items
 */
export function createVariablesEditorCompletionItems(variables: CSSVariable[]): Omit<monaco.languages.CompletionItem, 'range'>[] {
  return variables.map((variable) => ({
    label: variable.name,
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: `var(${variable.name})`,
    documentation: `${variable.rampName} color ramp - step ${variable.stepNumber}\nValue: ${variable.value}`,
    detail: `CSS Variable: ${variable.value}`,
    sortText: `${variable.rampName}-${variable.stepNumber.toString().padStart(3, '0')}`,
  }));
}

/**
 * Usecase to update Variables Editor with CSS variable completions
 */
export function useUpdateMonacoCompletions() {
  return (variables: CSSVariable[], monacoInstance?: typeof monaco) => {
    if (!monacoInstance) {
      // If Variables Editor is not available, we'll handle this in the component
      return;
    }

    // Register CSS completion provider
    const completionProvider = monacoInstance.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = createVariablesEditorCompletionItems(variables).map(item => ({
          ...item,
          range: range,
        }));

        return {
          suggestions: suggestions,
        };
      },
    });

    // Store the provider reference so it can be disposed later if needed
    return completionProvider;
  };
}