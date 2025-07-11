# Variables Editor Feature Documentation

## Overview

This feature automatically generates CSS variables from your color ramps and provides autocomplete suggestions in the Variables Editor. When you create, edit, or modify color ramps, CSS variables are generated behind the scenes and made available for use in your CSS code.

## How It Works

### Variable Naming Convention
- **Format**: `--rampname-step`
- **Example**: `--blue-primary-10`, `--red-secondary-20`
- **Step calculation**: `swatch.index * 10`

### Example Output
If you have a color ramp named "Blue Primary" with 3 swatches:
```css
:root {
  /* blue-primary color ramp */
  --blue-primary-0: #dbeafe;
  --blue-primary-10: #3b82f6;
  --blue-primary-20: #1e40af;
}
```

## Usage in CSS Editor

### Autocomplete Support
1. Open the UI tab
2. In the CSS editor, start typing `var(`
3. Variables Editor will show autocomplete suggestions with your color ramp variables
4. Each suggestion includes:
   - Variable name (e.g., `--blue-primary-10`)
   - Ramp name and step number
   - Actual color value

### Example CSS Usage
```css
.custom-button {
  background-color: var(--blue-primary-10);
  border: 1px solid var(--blue-primary-20);
}

.custom-button:hover {
  background-color: var(--blue-primary-20);
}
```

## Architecture

### Components
- **`CSSVariablesState.ts`**: Zustand store for CSS variables
- **`GenerateCSSVariables.ts`**: Pure functions and usecase for generating CSS variables
- **`SyncCSSVariables.ts`**: Automatically syncs variables when color ramps change
- **`UpdateVariablesEditorCompletions.ts`**: Provides Variables Editor autocomplete integration

### Automatic Synchronization
CSS variables are automatically updated when:
- Color ramps are created
- Color ramps are edited
- Color ramps are deleted  
- Swatch colors are modified

### Features
- **Name Sanitization**: Ramp names are automatically sanitized for CSS (spaces to dashes, special characters removed)
- **Sorted Output**: Variables are sorted by step number within each ramp
- **Real-time Updates**: Changes to color ramps immediately update the CSS variables
- **Variables Editor Integration**: Full autocomplete support with documentation tooltips

## Testing

Run the CSS variables tests:
```bash
bun test tests/css-variables.test.ts
```

The tests verify:
- CSS variable generation from color ramps
- Name sanitization
- CSS code generation
- Empty state handling
- Multiple color ramps support

## Implementation Details

### State Management
The CSS variables state is managed separately from color ramps state to follow the clean architecture pattern.

### Variables Editor Integration
- Custom completion provider for CSS variables
- Automatic disposal and recreation when variables change
- Contextual suggestions based on cursor position

### Performance
- Variables are generated only when color ramps change
- Variables Editor completions are updated efficiently
- No unnecessary re-renders or computations