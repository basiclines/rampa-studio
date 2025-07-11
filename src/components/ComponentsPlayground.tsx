import React, { useState } from 'react';
import { Button } from '@/uiproviders/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uiproviders/shadcn/select';
import { Badge } from '@/uiproviders/shadcn/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/uiproviders/shadcn/card';
import { Separator } from '@/uiproviders/shadcn/separator';

const ComponentsPlayground: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<string>('default');
  const [selectedSize, setSelectedSize] = useState<string>('default');
  const [clickCount, setClickCount] = useState(0);

  const buttonVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
  const buttonSizes = ['default', 'sm', 'lg', 'icon'];

  const handleButtonClick = () => {
    setClickCount(prev => prev + 1);
  };

  const resetCount = () => {
    setClickCount(0);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Components Playground</h3>
        <p className="text-sm text-gray-600 mb-6">
          Explore shadcn components with real-time interactions. Try different variants and sizes!
        </p>
      </div>

      {/* Button Playground */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Button Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Variant</label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonVariants.map((variant) => (
                    <SelectItem key={variant} value={variant}>
                      {variant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Interactive Demo */}
          <div className="flex flex-col items-center space-y-4 py-4">
            <Button
              variant={selectedVariant as any}
              size={selectedSize as any}
              onClick={handleButtonClick}
            >
              {selectedSize === 'icon' ? '🎨' : 'Click Me!'}
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Clicks:</span>
              <Badge variant="secondary">{clickCount}</Badge>
              {clickCount > 0 && (
                <Button size="sm" variant="outline" onClick={resetCount}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Preview Code */}
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-sm">
              {`<Button variant="${selectedVariant}" size="${selectedSize}">
  ${selectedSize === 'icon' ? '🎨' : 'Click Me!'}
</Button>`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Select Playground */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Choose your favorite color</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a color..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">🔴 Red</SelectItem>
                <SelectItem value="blue">🔵 Blue</SelectItem>
                <SelectItem value="green">🟢 Green</SelectItem>
                <SelectItem value="purple">🟣 Purple</SelectItem>
                <SelectItem value="orange">🟠 Orange</SelectItem>
                <SelectItem value="yellow">🟡 Yellow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">Framework preference</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose framework..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">⚛️ React</SelectItem>
                <SelectItem value="vue">💚 Vue.js</SelectItem>
                <SelectItem value="angular">🅰️ Angular</SelectItem>
                <SelectItem value="svelte">🧡 Svelte</SelectItem>
                <SelectItem value="solid">🔷 Solid.js</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Preview Code */}
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-sm">
              {`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Usage Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">💡</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Pro Tip</p>
              <p className="text-sm text-blue-700">
                All components are imported from <code className="bg-blue-100 px-1 rounded">@/uiproviders/shadcn</code> 
                and can be styled with CSS variables from your color ramps!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentsPlayground;