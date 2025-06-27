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

## Proposed Architecture

### 1. OKLCH Engine Layer (`@/engine/OklchEngine.ts`)

```typescript
interface OklchColor {
  l: number;    // 0-1 (lightness)
  c: number;    // 0-0.4+ (chroma)
  h: number;    // 0-360 (hue)
  alpha?: number; // 0-1 (opacity)
}

interface OklchGamutInfo {
  space: 'srgb' | 'p3' | 'rec2020' | 'out-of-gamut';
  inGamut: boolean;
  clampedColor?: OklchColor;
}

// Core functions
- convertToOklch(color: string): OklchColor
- convertFromOklch(oklch: OklchColor): string
- getGamutInfo(oklch: OklchColor): OklchGamutInfo
- clampToGamut(oklch: OklchColor, targetGamut: 'srgb' | 'p3' | 'rec2020'): OklchColor
- getMaxChromaForLH(l: number, h: number): number
```

### 2. OKLCH Entity (`@/entities/OklchColorEntity.ts`)

```typescript
export interface OklchColorEntity {
  l: number;
  c: number; 
  h: number;
  alpha: number;
  colorSpace: 'srgb' | 'p3' | 'rec2020';
}

export interface OklchColorPickerState {
  currentColor: OklchColorEntity;
  pickerMode: 'lc' | 'lh' | 'ch'; // Which 2D plane to show
  showGamutWarnings: boolean;
  targetColorSpace: 'srgb' | 'p3' | 'rec2020';
}
```

### 3. OKLCH Components

#### Core Picker Component (`@/components/OklchColorPicker.tsx`)
```typescript
interface OklchColorPickerProps {
  color: OklchColorEntity;
  onChange: (color: OklchColorEntity) => void;
  onChangeComplete?: (color: OklchColorEntity) => void;
  mode?: 'lc' | 'lh' | 'ch';
  showGamutWarnings?: boolean;
  targetColorSpace?: 'srgb' | 'p3' | 'rec2020';
  width?: number;
  height?: number;
}
```

#### Sub-components:
- **OklchField.tsx**: 2D color field (LC, LH, or CH plane)
- **OklchSlider.tsx**: 1D slider for third dimension
- **OklchInputs.tsx**: Numeric input fields with validation
- **GamutIndicator.tsx**: Visual feedback for color space limits
- **ColorSpaceSelector.tsx**: Toggle between sRGB/P3/Rec2020

### 4. OKLCH Usecases

```typescript
// @/usecases/SetOklchColor.ts
export function useSetOklchColor() {
  return (rampId: string, oklchColor: OklchColorEntity) => {
    // Convert to hex/hsl for compatibility with existing system
    const hexColor = convertFromOklch(oklchColor);
    // Update color ramp with new base color
  };
}

// @/usecases/ConvertColorToOklch.ts
export function useConvertColorToOklch() {
  return (color: string): OklchColorEntity => {
    return convertToOklch(color);
  };
}
```

### 5. Enhanced Color Swatches

#### OklchBaseColorSwatch.tsx
- Replaces BaseColorSwatch with OKLCH picker
- Maintains same interface for backward compatibility
- Shows color space indicators

#### OklchTintColorSwatch.tsx  
- Replaces TintColorSwatch with OKLCH capabilities
- Enhanced gamut handling for blend operations

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. **OKLCH Engine Development**
   - Create `OklchEngine.ts` with core conversion functions
   - Integrate `culori` library (used by OKLCH picker) for color space operations
   - Implement gamut detection and clamping functions
   - Add comprehensive unit tests

2. **Entity & Type Definitions**
   - Create `OklchColorEntity.ts`
   - Define interfaces for picker state management
   - Update existing entities to support OKLCH where needed

### Phase 2: Core Components (Week 3-4)
1. **2D Color Field Component**
   - Canvas-based implementation for LC/LH/CH planes
   - Mouse/touch interaction handling
   - Real-time gamut feedback
   - Performance optimization with Web Workers (like OKLCH picker)

2. **1D Slider Components**
   - Lightness slider with perceptual accuracy
   - Chroma slider with gamut-aware max values
   - Hue slider with full 360° range
   - Alpha slider integration

3. **Input Components**
   - Numeric inputs with proper validation
   - Live preview during typing
   - Support for different notation formats

### Phase 3: Integration (Week 5)
1. **Swatch Component Updates**
   - Create OKLCH versions of existing swatches
   - Maintain backward compatibility
   - Add feature flags for gradual rollout

2. **Usecase Integration**
   - Update color manipulation usecases
   - Ensure compatibility with existing color ramp generation

### Phase 4: Enhancement & Polish (Week 6)
1. **Advanced Features**
   - Gamut visualization
   - Color space conversion UI
   - Keyboard navigation
   - Accessibility improvements

2. **Performance Optimization**
   - Canvas rendering optimization
   - Debounced updates
   - Memory management

## Technical Implementation Details

### Dependencies
```json
{
  "culori": "^3.3.0",           // Color space operations
  "canvas": "^2.11.2",          // For server-side rendering support (optional)
  "@types/culori": "^3.0.0"     // TypeScript definitions
}
```

### Key Files to Create
```
src/
├── engine/
│   ├── OklchEngine.ts              # Core OKLCH functions
│   └── OklchGamutEngine.ts         # Gamut detection & clamping
├── entities/
│   ├── OklchColorEntity.ts         # OKLCH color type definitions
│   └── OklchPickerEntity.ts        # Picker state definitions
├── components/
│   ├── OklchColorPicker.tsx        # Main picker component
│   ├── OklchField.tsx              # 2D color field
│   ├── OklchSlider.tsx             # 1D sliders
│   ├── OklchInputs.tsx             # Numeric inputs
│   ├── GamutIndicator.tsx          # Gamut feedback
│   ├── OklchBaseColorSwatch.tsx    # Enhanced base swatch
│   └── OklchTintColorSwatch.tsx    # Enhanced tint swatch
├── usecases/
│   ├── SetOklchColor.ts            # OKLCH color updates
│   ├── ConvertColorToOklch.ts      # Color space conversion
│   └── ValidateOklchGamut.ts       # Gamut validation
└── hooks/
    ├── useOklchPicker.ts           # Picker state management
    └── useGamutDetection.ts        # Real-time gamut checking
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

### 3. Color Space Complexity
**Issue**: Managing multiple color spaces adds complexity
**Solution**:
- Clear separation of concerns in engine layer
- Comprehensive testing across color spaces
- User education through UI feedback

### 4. Integration Complexity
**Issue**: Existing color ramp system uses different color model
**Solution**:
- Gradual migration approach
- Dual support during transition
- Feature flags for controlled rollout
- Extensive testing of edge cases

### 5. Learning Curve
**Issue**: OKLCH is unfamiliar to many users
**Solution**:
- Progressive disclosure of advanced features
- Helpful tooltips and guidance
- Option to toggle between traditional and OKLCH modes
- Educational content integration

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

## Success Metrics

1. **Functional**
   - 100% feature parity with existing pickers
   - <100ms response time for color updates
   - Accurate color space detection (>99%)

2. **User Experience**
   - No increase in user errors during color selection
   - Maintained or improved color selection efficiency
   - Positive user feedback on color accuracy

3. **Technical**
   - <5MB bundle size increase
   - Compatible with all target browsers
   - No memory leaks during extended usage

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

This OKLCH color picker implementation will provide:
- **Superior color accuracy** through perceptual uniformity
- **Future-proof architecture** supporting wide color gamuts  
- **Seamless integration** with existing clean architecture
- **Progressive enhancement** without breaking existing functionality

The implementation follows the established patterns in the codebase while leveraging proven techniques from the Evil Martians OKLCH picker for optimal performance and accuracy.