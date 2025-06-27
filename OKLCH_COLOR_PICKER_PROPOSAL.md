# OKLCH Color Picker Implementation Proposal

## Executive Summary

This proposal outlines the implementation of a custom OKLCH color picker to replace the current `react-color` SketchPicker components. The OKLCH (OK LCH) color space provides superior perceptual uniformity and can access wider color gamuts than traditional RGB/HSL approaches.

## Current State Analysis

### Existing Implementation
- **BaseColorSwatch.tsx**: Uses `SketchPicker` from react-color for basic color selection
- **TintColorSwatch.tsx**: Similar picker for tint colors with opacity and blend mode controls
- **Color Engine**: Currently uses `chroma-js` library for color manipulations
- **Architecture**: Clean separation with entities, usecases, and engine layers

### Limitations of Current Approach
- Limited to sRGB color space
- Unpredictable perceptual changes during color transformations
- No access to P3 or Rec2020 color spaces
- HSL model doesn't provide consistent perceptual lightness

## OKLCH Benefits

Based on analysis of the [OKLCH picker repository](https://github.com/evilmartians/oklch-picker) and [Evil Martians blog post](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl):

1. **Perceptual Uniformity**: Changes in L, C, H values correspond to consistent visual changes
2. **Wide Gamut Support**: Access to P3, Rec2020, and beyond
3. **Predictable Contrast**: Lightness changes maintain predictable contrast ratios
4. **No Hue Shift**: Unlike LCH, OKLCH avoids hue shifts when adjusting chroma
5. **Future-Proof**: Native CSS support and growing browser adoption

## MVP Architecture - OKLCH Integration

### 1. Extend Existing Types

#### Update ColorFormat in ColorRampControls.tsx
```typescript
type ColorFormat = 'hex' | 'hsl' | 'oklch'; // Add 'oklch'

// Update ColorFormatControl component
const ColorFormatControl = ({ value, onChange }: { value: ColorFormat, onChange: (v: ColorFormat) => void }) => (
  <div className="inline-flex w-full rounded-md border border-gray-200 bg-white overflow-hidden text-xs">
    <button className={`flex-1 px-2 py-1 ${value === 'hex' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('hex')}>HEX</button>
    <button className={`flex-1 px-2 py-1 ${value === 'hsl' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('hsl')}>HSL</button>
    <button className={`flex-1 px-2 py-1 ${value === 'oklch' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('oklch')}>OKLCH</button>
  </div>
);
```

#### Update ColorRampEntity
```typescript
export interface ColorRampConfig {
  // ... existing fields
  colorFormat?: 'hex' | 'hsl' | 'oklch'; // Add 'oklch' option
}
```

### 2. OKLCH Engine (MVP) (`@/engine/OklchEngine.ts`)

```typescript
interface OklchColor {
  l: number;    // 0-1 (lightness)
  c: number;    // 0-0.4+ (chroma)  
  h: number;    // 0-360 (hue)
  alpha?: number; // 0-1 (opacity)
}

// MVP Core functions
export function convertToOklch(color: string): OklchColor;
export function convertFromOklch(oklch: OklchColor): string;
export function formatOklchString(oklch: OklchColor): string; // "oklch(0.7 0.15 180)"
export function isValidOklch(oklch: OklchColor): boolean;
export function clampOklchToSrgb(oklch: OklchColor): OklchColor; // Basic sRGB clamping

// Dynamic gamut handling
export function getMaxChromaForLH(l: number, h: number): number; // Real-time max chroma
export function clampChromaSmooth(oklch: OklchColor): OklchColor; // Smooth clamping
export function isChromaAtMax(l: number, c: number, h: number): boolean; // UI feedback
```

### 3. Enhanced Existing Components

#### Modify BaseColorSwatch.tsx
```typescript
// Add OKLCH picker mode
const BaseColorSwatch: React.FC<BaseColorSwatchProps> = ({ color, colorFormat, onChange, id, empty = false }) => {
  // ... existing logic
  
  // New: Choose picker based on colorFormat  
  const renderPicker = () => {
    if (colorFormat === 'oklch') {
      return <OklchPicker color={color} onChange={onChange} />;
    }
    // Default to existing SketchPicker for hex/hsl
    return <SketchPicker color={color} onChange={handleColorChange} />;
  };
  
  const formatColor = (color: string, format: 'hex' | 'hsl' | 'oklch') => {
    if (format === 'oklch') {
      const oklch = convertToOklch(color);
      return formatOklchString(oklch);
    }
    // ... existing hex/hsl logic
  };
}
```

### 4. New OKLCH Picker Component (`@/components/OklchPicker.tsx`)

```typescript
interface OklchPickerProps {
  color: string;           // Current color (any format)
  onChange: (color: string) => void; // Returns hex for compatibility
  width?: number;
  height?: number;
}

// MVP: Simple LC field + H slider + numeric inputs
const OklchPicker: React.FC<OklchPickerProps> = ({ color, onChange }) => {
  const [oklch, setOklch] = useState(() => convertToOklch(color));
  
  const handleOklchChange = (newOklch: OklchColor) => {
    setOklch(newOklch);
    const hexColor = convertFromOklch(newOklch);
    onChange(hexColor);
  };
  
  return (
    <div className="oklch-picker">
      <OklchField oklch={oklch} onChange={handleOklchChange} />
      <OklchHueSlider hue={oklch.h} onChange={(h) => handleOklchChange({...oklch, h})} />
      <OklchInputs oklch={oklch} onChange={handleOklchChange} />
    </div>
  );
};
```

### 5. MVP Sub-components

- **OklchField.tsx**: Canvas-based LC plane with crosshair + gamut boundary
- **OklchHueSlider.tsx**: 360° hue gradient slider  
- **OklchInputs.tsx**: L, C, H numeric inputs with dynamic constraints

## Dynamic Gamut Handling Strategy

### The Challenge
In OKLCH, changing lightness or hue affects the maximum available chroma:
- **Light colors** (L > 0.9): Very limited chroma range
- **Dark colors** (L < 0.1): Also limited chroma  
- **Different hues**: Some colors (like bright yellows) have higher max chroma than others (like blues)
- **Sweet spot**: Mid-lightness (~0.6-0.7) typically allows highest chroma

### MVP Solution Approach

#### 1. Real-time Constraint Updates
```typescript
// When lightness or hue changes, update chroma constraints
const handleLightnessChange = (newL: number) => {
  const maxChroma = getMaxChromaForLH(newL, oklch.h);
  const clampedChroma = Math.min(oklch.c, maxChroma);
  
  setOklch({ ...oklch, l: newL, c: clampedChroma });
  setChromaSliderMax(maxChroma); // Update UI constraint
};
```

#### 2. Visual Feedback Systems
- **Chroma slider**: Dynamic max value based on current L,H
- **LC field**: Gray out invalid areas beyond gamut boundary
- **Input fields**: Show warning when at maximum chroma
- **Color preview**: Subtle indicator when color is gamut-clamped

#### 3. Smooth Clamping Behavior
```typescript
// Gradual reduction instead of hard cuts
export function clampChromaSmooth(oklch: OklchColor): OklchColor {
  const maxChroma = getMaxChromaForLH(oklch.l, oklch.h);
  
  if (oklch.c > maxChroma) {
    // Smooth transition to max available chroma
    return { ...oklch, c: maxChroma };
  }
  return oklch;
}
```

#### 4. User Education
- **Tooltip**: "Chroma limited by current lightness" when at boundary
- **Visual guide**: Show approximate gamut shape in LC field
- **Contextual help**: Brief explanation of OKLCH constraints

### Implementation Priority
1. **Core gamut calculation** (Week 1)
2. **Dynamic slider constraints** (Week 2) 
3. **Visual feedback** (Week 2-3)
4. **User education tooltips** (Week 3)

## MVP Implementation Plan (3 Weeks)

### Phase 1: Foundation & Integration (Week 1)
1. **OKLCH Engine Development**
   - Create `OklchEngine.ts` with core conversion functions
   - Integrate `culori` library for color space operations
   - Basic gamut detection (sRGB only for MVP)

2. **ColorFormat Extension**
   - Update `ColorFormat` type: `'hex' | 'hsl' | 'oklch'`
   - Extend `ColorFormatControl` to include OKLCH option
   - Update `ColorRampEntity` to support OKLCH format

### Phase 2: Core OKLCH Components (Week 2)
1. **Basic OKLCH Picker**
   - Simple 2D color field for Lightness/Chroma plane
   - Hue slider (360° range)
   - Basic mouse interaction
   - Numeric inputs for L, C, H values

2. **Swatch Integration**
   - Modify `BaseColorSwatch` to use OKLCH when format is 'oklch'
   - Modify `TintColorSwatch` to support OKLCH
   - Maintain existing interface for seamless integration

### Phase 3: Polish & Testing (Week 3)
1. **Integration Testing**
   - Ensure OKLCH works with existing color ramp generation
   - Test all three format modes work correctly
   - Fix edge cases and color conversion issues

2. **Basic UI Polish**
   - Visual consistency with existing design
   - Proper color display formatting
   - Basic error handling for out-of-gamut colors

## Technical Implementation Details

### Dependencies
```json
{
  "culori": "^3.3.0",           // Color space operations
  "canvas": "^2.11.2",          // For server-side rendering support (optional)
  "@types/culori": "^3.0.0"     // TypeScript definitions
}
```

### Key Files for MVP
```
src/
├── engine/
│   └── OklchEngine.ts              # Core OKLCH conversion functions
├── entities/
│   └── ColorRampEntity.ts          # MODIFY: Add 'oklch' to ColorFormat
├── components/
│   ├── BaseColorSwatch.tsx         # MODIFY: Add OKLCH picker support
│   ├── TintColorSwatch.tsx         # MODIFY: Add OKLCH picker support  
│   ├── ColorRampControls.tsx       # MODIFY: Add OKLCH to ColorFormatControl
│   ├── OklchPicker.tsx             # NEW: Main OKLCH picker component
│   ├── OklchField.tsx              # NEW: 2D LC color field
│   ├── OklchHueSlider.tsx          # NEW: Hue slider
│   └── OklchInputs.tsx             # NEW: L, C, H numeric inputs
└── usecases/
    └── SetColorFormat.ts           # MODIFY: Handle 'oklch' format
```

## Potential Blockers & Solutions

### 1. Browser Support
**Issue**: OKLCH CSS support is still limited
**Solution**: 
- Graceful degradation to sRGB
- Feature detection with fallbacks
- Progressive enhancement approach

### 2. Performance Concerns  
**Issue**: Real-time canvas rendering can be expensive
**Solution**:
- Web Workers for heavy calculations (following OKLCH picker pattern)
- Debounced updates during interaction
- Memoization of expensive operations
- Canvas rendering optimization techniques

### 3. Dynamic Gamut Constraints
**Issue**: OKLCH chroma range changes dramatically based on L,H values
**Solution**:
- Real-time max chroma calculation using culori's gamut functions
- Dynamic UI constraint updates (slider max values)
- Smooth clamping behavior instead of hard cuts
- Clear visual feedback when colors are gamut-limited

### 4. Color Space Complexity
**Issue**: Managing multiple color spaces adds complexity
**Solution**:
- Clear separation of concerns in engine layer
- Start with sRGB-only for MVP, expand later
- User education through UI feedback

### 5. Integration Complexity
**Issue**: Existing color ramp system uses different color model
**Solution**:
- Seamless conversion layer (OKLCH ↔ HEX for compatibility)
- No changes to existing ColorRampConfig structure
- Extensive testing of edge cases

### 6. Learning Curve
**Issue**: OKLCH is unfamiliar to many users
**Solution**:
- OKLCH as opt-in third choice alongside familiar HEX/HSL
- Helpful tooltips explaining gamut constraints
- Clear visual feedback for invalid color combinations

## Testing Strategy

### Unit Tests
- OKLCH conversion accuracy
- Gamut detection correctness
- Edge case handling (NaN, infinite values)
- Color space boundary conditions

### Integration Tests  
- Component interaction flows
- Usecase integration with existing system
- Performance benchmarks
- Cross-browser compatibility

### Visual Tests
- Color accuracy across different displays
- Gamut visualization correctness
- UI consistency across color spaces

## MVP Success Metrics

1. **Functional**
   - OKLCH format works alongside HEX and HSL in ColorRampControls
   - Color conversion accuracy between OKLCH ↔ HEX/HSL
   - Basic color picker interaction (field + slider + inputs)
   - Integration with existing color ramp generation

2. **User Experience**  
   - Seamless switching between HEX/HSL/OKLCH formats
   - No breaking changes to existing workflows
   - OKLCH values display correctly in color swatches

3. **Technical**
   - <2MB bundle size increase for MVP
   - No performance regression in existing functionality
   - Basic sRGB gamut handling without errors

## Future Enhancements

1. **Advanced Features**
   - Color harmony generation in OKLCH space
   - Accessible color palette validation
   - Integration with design tokens

2. **Performance**
   - WebGL acceleration for complex calculations
   - Incremental canvas updates
   - Better caching strategies

3. **Integration**
   - Export/import OKLCH color palettes
   - Integration with popular design tools
   - API for third-party extensions

## Conclusion

This MVP OKLCH integration will provide:
- **OKLCH as a third option** alongside existing HEX/HSL formats in ColorRampControls
- **Superior perceptual color accuracy** for professional color work
- **Zero breaking changes** to existing workflows and components  
- **Foundation for future enhancements** like wide gamut support and advanced features

The MVP approach ensures quick delivery while maintaining the clean architecture patterns already established in the codebase. Users can choose OKLCH when they need perceptual accuracy, while keeping HEX/HSL for familiar workflows.