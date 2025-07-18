import React from 'react';
import { Button } from '@/uiproviders/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uiproviders/shadcn/select';
import { Badge } from '@/uiproviders/shadcn/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/uiproviders/shadcn/card';
import { Input } from '@/uiproviders/shadcn/input';
import { Label } from '@/uiproviders/shadcn/label';
import { Checkbox } from '@/uiproviders/shadcn/checkbox';
import { RadioGroup, RadioGroupItem } from '@/uiproviders/shadcn/radio-group';
import { Switch } from '@/uiproviders/shadcn/switch';
import { Textarea } from '@/uiproviders/shadcn/textarea';
import { Slider } from '@/uiproviders/shadcn/slider';
import { Progress } from '@/uiproviders/shadcn/progress';
import { Separator } from '@/uiproviders/shadcn/separator';

// Default Shadcn theme CSS that should be added to the editor
export const SHADCN_DEFAULT_THEME = `
/* Shadcn Default Theme */

.bg-background { background-color: rgb(255 255 255); }
.text-foreground { color: rgb(17 17 17); }

.bg-card { background-color: rgb(250 250 250); }
.text-card-foreground { color: rgb(17 17 17); }

.bg-popover { background-color: rgb(255 255 255); }
.text-popover-foreground { color: rgb(17 17 17); }

.bg-primary { background-color: rgb(0 106 255); }
.text-primary-foreground { color: rgb(255 255 255); }

.bg-secondary { background-color: rgb(240 240 240); }
.text-secondary-foreground { color: rgb(17 17 17); }

.bg-muted { background-color: rgb(245 245 245); }
.text-muted-foreground { color: rgb(100 100 100); }

.bg-accent { background-color: rgb(230 230 255); }
.text-accent-foreground { color: rgb(17 17 17); }

.text-destructive { color: rgb(220 38 38); }
.bg-destructive { background-color: rgb(220 38 38); }
.text-destructive-foreground { color: rgb(255 255 255); }

.border-border { border-color: rgb(230 230 230); }
.border-input { border-color: rgb(230 230 230); }
.ring-ring { box-shadow: 0 0 0 2px rgb(220 38 38); }
.rounded-lg { border-radius: 0.5rem; }
`;

const ShadcnComponentKit: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      {/* Form Components */}
      <div className="space-y-4">
        <Input placeholder="Input field" />
        <Textarea placeholder="Textarea" rows={3} />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Checkboxes and Radio */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms</Label>
        </div>
        <RadioGroup defaultValue="option1" className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="r1" />
            <Label htmlFor="r1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="r2" />
            <Label htmlFor="r2">Option 2</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Switch */}
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <Label>Volume</Label>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Label>Progress</Label>
        <Progress value={65} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content goes here.</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Small Components */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">⚙️</Button>
        <Badge variant="secondary">Badge</Badge>
      </div>
    </div>
  );
};

export default ShadcnComponentKit; 