import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import ComponentsPlayground from './ComponentsPlayground';
import { useComponentProviderState, ComponentProvider } from '@/state/ComponentProviderState';

const UISection: React.FC = () => {
  const { selectedProvider, setSelectedProvider } = useComponentProviderState();

  const providerOptions = [
    { value: 'shadcn', label: 'Shadcn', disabled: false },
    { value: 'bootstrap', label: 'Bootstrap', disabled: true },
    { value: 'radix', label: 'Radix', disabled: true },
    { value: 'tailwindui', label: 'TailwindUI', disabled: true },
  ];

  return (
    <div className="flex-1 p-8">
      <div className="flex gap-6 h-full">
        {/* Component Preview Section */}
        <div className="w-full">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5" />
                  Component Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Provider:</span>
                  <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as ComponentProvider)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          disabled={option.disabled}
                          className={option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-[calc(100vh-200px)] overflow-auto">
                <ComponentsPlayground provider={selectedProvider} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UISection;