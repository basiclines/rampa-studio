import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ColorFormat } from '@/entities/ColorRampEntity';
import { 
  parseColorForEditing, 
  filterHexInput, 
  filterNumericInput,
  HSLValues,
  OKLCHValues
} from '@/engine/ColorValidationEngine';
import { useSetHEXColorValue } from '@/usecases/SetHEXColorValue';
import { useSetHSLColorValue } from '@/usecases/SetHSLColorValue';
import { useSetOKLCHColorValue } from '@/usecases/SetOKLCHColorValue';

interface EditableColorValueProps {
  color: string;
  colorFormat: ColorFormat;
  rampId: string;
  colorType: 'base' | 'tint';
  className?: string;
  onBlur?: () => void;
  onShowPicker?: () => void;
}

const EditableColorValue: React.FC<EditableColorValueProps> = ({
  color,
  colorFormat,
  rampId,
  colorType,
  className = '',
  onBlur,
  onShowPicker
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<{
    hex?: string;
    hsl?: HSLValues;
    oklch?: OKLCHValues;
    oklchStrings?: {
      lightness?: string;
      chroma?: string;
      hue?: string;
    };
  }>({});

  // Refs for input elements
  const hexInputRef = useRef<HTMLInputElement>(null);
  const hslRefs = {
    hue: useRef<HTMLInputElement>(null),
    saturation: useRef<HTMLInputElement>(null),
    lightness: useRef<HTMLInputElement>(null)
  };
  const oklchRefs = {
    lightness: useRef<HTMLInputElement>(null),
    chroma: useRef<HTMLInputElement>(null),
    hue: useRef<HTMLInputElement>(null)
  };

  // Usecases
  const setHEXColorValue = useSetHEXColorValue();
  const setHSLColorValue = useSetHSLColorValue();
  const setOKLCHColorValue = useSetOKLCHColorValue();

  // Parse color values for editing (only when first entering edit mode)
  useEffect(() => {
    if (isEditing && Object.keys(editValues).length === 0) {
      // Only parse and set initial values when starting to edit (editValues is empty)
      const parsed = parseColorForEditing(color, colorFormat);
      setEditValues(parsed);
      
      // Initialize string values for OKLCH editing
      if (colorFormat === 'oklch' && parsed.oklch) {
        const lightnessStr = parsed.oklch.lightness.toString();
        const chromaStr = parsed.oklch.chroma.toString();
        const hueStr = parsed.oklch.hue.toString();
        
        setEditValues(prev => ({
          ...prev,
          oklchStrings: {
            lightness: lightnessStr,
            chroma: chromaStr,
            hue: hueStr
          }
        }));
      }
    }
  }, [color, colorFormat, isEditing, editValues]);

  // Handle starting edit mode
  const handleStartEditing = useCallback((e?: React.FocusEvent) => {
    if (!isEditing) {
      setIsEditing(true);
      // Select the text content when focused
      setTimeout(() => {
        if (e?.target && 'select' in e.target) {
          (e.target as HTMLInputElement).select();
        }
      }, 10);
    }
  }, [isEditing]);

  // Apply validation (used for blur and paste)
  const handleValidation = useCallback(() => {
    // Apply the changes based on format
    if (colorFormat === 'hex' && editValues.hex) {
      setHEXColorValue({
        id: rampId,
        hexValue: editValues.hex,
        colorType
      });
    } else if (colorFormat === 'hsl' && editValues.hsl) {
      setHSLColorValue({
        id: rampId,
        hue: editValues.hsl.hue.toString(),
        saturation: editValues.hsl.saturation.toString(),
        lightness: editValues.hsl.lightness.toString(),
        colorType
      });
    } else if (colorFormat === 'oklch' && editValues.oklch) {
      setOKLCHColorValue({
        id: rampId,
        lightness: editValues.oklch.lightness.toString(),
        chroma: editValues.oklch.chroma.toString(),
        hue: editValues.oklch.hue.toString(),
        colorType
      });
    }
  }, [colorFormat, editValues, rampId, colorType, setHEXColorValue, setHSLColorValue, setOKLCHColorValue]);

  // Handle finishing edit mode
  const handleFinishEditing = useCallback(() => {
    if (!isEditing) return;

    handleValidation();
    setIsEditing(false);
    setEditValues({});
    
    // Hide color picker when finishing edit
    if (onBlur) {
      onBlur();
    }
  }, [isEditing, handleValidation, onBlur]);

  // Handle arrow key increments
  const handleArrowIncrement = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldType: 'hue' | 'saturation' | 'lightness' | 'chroma',
    isOklch: boolean = false
  ) => {
    const isUp = e.key === 'ArrowUp';
    const isDown = e.key === 'ArrowDown';
    
    if (!isUp && !isDown) return false;
    
    e.preventDefault();
    
    // Check if Shift key is pressed for larger increments (10x bigger steps)
    const biggerSteps = e.shiftKey;
    
    if (isOklch && editValues.oklch) {
      const current = editValues.oklch;
      let newValue: number;
      
      if (fieldType === 'lightness') {
        const baseIncrement = biggerSteps ? 0.1 : 0.01;
        const increment = isUp ? baseIncrement : -baseIncrement;
        newValue = Math.min(1, Math.max(0, current.lightness + increment));
        const roundedValue = parseFloat(newValue.toFixed(biggerSteps ? 1 : 3));
        setEditValues({
          oklch: { ...current, lightness: roundedValue },
          oklchStrings: { ...editValues.oklchStrings, lightness: roundedValue.toString() }
        });
      } else if (fieldType === 'chroma') {
        const baseIncrement = biggerSteps ? 0.1 : 0.01;
        const increment = isUp ? baseIncrement : -baseIncrement;
        newValue = Math.min(0.5, Math.max(0, current.chroma + increment));
        const roundedValue = parseFloat(newValue.toFixed(biggerSteps ? 1 : 3));
        setEditValues({
          oklch: { ...current, chroma: roundedValue },
          oklchStrings: { ...editValues.oklchStrings, chroma: roundedValue.toString() }
        });
      } else if (fieldType === 'hue') {
        const baseIncrement = biggerSteps ? 10 : 1;
        const increment = isUp ? baseIncrement : -baseIncrement;
        newValue = (current.hue + increment + 360) % 360;
        const roundedValue = Math.round(newValue);
        setEditValues({
          oklch: { ...current, hue: roundedValue },
          oklchStrings: { ...editValues.oklchStrings, hue: roundedValue.toString() }
        });
      }
    } else if (!isOklch && editValues.hsl) {
      const current = editValues.hsl;
      const baseIncrement = biggerSteps ? 10 : 1;
      const increment = isUp ? baseIncrement : -baseIncrement;
      let newValue: number;
      
      if (fieldType === 'hue') {
        newValue = (current.hue + increment + 360) % 360;
        const roundedValue = Math.round(newValue);
        setEditValues({
          hsl: { ...current, hue: roundedValue }
        });
      } else if (fieldType === 'saturation') {
        newValue = Math.min(100, Math.max(0, current.saturation + increment));
        const roundedValue = Math.round(newValue);
        setEditValues({
          hsl: { ...current, saturation: roundedValue }
        });
      } else if (fieldType === 'lightness') {
        newValue = Math.min(100, Math.max(0, current.lightness + increment));
        const roundedValue = Math.round(newValue);
        setEditValues({
          hsl: { ...current, lightness: roundedValue }
        });
      }
    }
    
    // Validate and apply changes immediately for arrow keys
    handleValidation();
    
    return true;
  }, [editValues, handleValidation]);

  // Handle key events
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldType?: 'hue' | 'saturation' | 'lightness' | 'chroma',
    isOklch: boolean = false
  ) => {
    if (e.key === 'Enter') {
      handleFinishEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValues({});
    } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && fieldType && (colorFormat === 'hsl' || colorFormat === 'oklch')) {
      handleArrowIncrement(e, fieldType, isOklch);
    }
  }, [handleFinishEditing, handleArrowIncrement, colorFormat]);

  // Render HEX input
  const renderHexInput = () => (
    <div className={`r-input inline-flex items-center ${isEditing ? 'focus' : ''}`} style={{ marginLeft: "-8px", gap: "0" }}>
      <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`} style={{ fontSize: "10px", fontWeight: "500", marginTop: "1px" }}>#</span>
      <input
        ref={hexInputRef}
        type="text"
        value={isEditing ? (editValues.hex || '') : color.replace('#', '').toUpperCase()}
        onChange={(e) => {
          const filtered = filterHexInput(e.target.value);
          setEditValues({ hex: filtered });
        }}
        onPaste={(e) => {
          e.preventDefault();
          const pastedText = e.clipboardData.getData('text');
          const filtered = filterHexInput(pastedText);
          setEditValues({ hex: filtered });
          // Use validation for paste
          setTimeout(() => handleValidation(), 0);
        }}
        onFocus={(e) => handleStartEditing(e)}
        onBlur={handleFinishEditing}
        onKeyDown={(e) => handleKeyDown(e)}
        className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-12 cursor-text"
        maxLength={6}
        readOnly={!isEditing}
      />
    </div>
  );

  // Render HSL inputs
  const renderHslInputs = () => {
    const currentValues = isEditing ? editValues.hsl : parseColorForEditing(color, colorFormat).hsl;
    
    return (
      <div className={`r-input inline-flex items-center ${isEditing ? 'focus' : ''}`} style={{ marginLeft: "-28px", gap: "2px" }}>
        <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`} style={{ fontSize: "10px", fontWeight: "500", marginTop: "1px" }}>hsl</span>
        <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`}>(</span>
        <input
          ref={hslRefs.hue}
          type="text"
          value={currentValues?.hue?.toString() || ''}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const value = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, hue: value }
            });
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const value = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, hue: value }
            });
            // Use validation for paste
            setTimeout(() => handleValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'hue', false)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-6 cursor-text text-right"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className="r-text-secondary">, </span>
        <input
          ref={hslRefs.saturation}
          type="text"
          value={currentValues?.saturation?.toString() || ''}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, saturation: value }
            });
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, saturation: value }
            });
            // Use validation for paste
            setTimeout(() => handleValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'saturation', false)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-6 cursor-text text-right"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className="r-text-secondary">, </span>
        <input
          ref={hslRefs.lightness}
          type="text"
          value={currentValues?.lightness?.toString() || ''}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, lightness: value }
            });
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, lightness: value }
            });
            // Use validation for paste
            setTimeout(() => handleValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'lightness', false)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-6 cursor-text text-right"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`}>)</span>
      </div>
    );
  };

  // Render OKLCH inputs
  const renderOklchInputs = () => {
    const currentValues = isEditing ? editValues.oklch : parseColorForEditing(color, colorFormat).oklch;
    const currentStrings = isEditing ? editValues.oklchStrings : undefined;
    
    return (
      <div className={`r-input inline-flex items-center ${isEditing ? 'focus' : ''}`} style={{ marginLeft: "-44px", gap: "2px" }}>
        <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`} style={{ fontSize: "10px", fontWeight: "500", marginTop: "1px" }}>oklch</span>
        <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`}>(</span>
        <input
          ref={oklchRefs.lightness}
          type="text"
          value={isEditing ? (currentStrings?.lightness || '') : (currentValues?.lightness?.toString() || '')}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, true);
            const parsedValue = Math.min(1, Math.max(0, parseFloat(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, lightness: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, lightness: filtered }
            });
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, true);
            const parsedValue = Math.min(1, Math.max(0, parseFloat(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, lightness: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, lightness: filtered }
            });
            // Use validation for paste
            setTimeout(() => handleValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'lightness', true)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-7 cursor-text text-right"
          readOnly={!isEditing}
        />
        <span className="r-text-secondary">, </span>
        <input
          ref={oklchRefs.chroma}
          type="text"
          value={isEditing ? (currentStrings?.chroma || '') : (currentValues?.chroma?.toString() || '')}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, true);
            const parsedValue = Math.min(0.5, Math.max(0, parseFloat(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, chroma: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, chroma: filtered }
            });
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, true);
            const parsedValue = Math.min(0.5, Math.max(0, parseFloat(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, chroma: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, chroma: filtered }
            });
            // Use validation for paste
            setTimeout(() => handleValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'chroma', true)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-7 cursor-text text-right"
          readOnly={!isEditing}
        />
        <span className="r-text-secondary">, </span>
        <input
          ref={oklchRefs.hue}
          type="text"
          value={isEditing ? (currentStrings?.hue || '') : (currentValues?.hue?.toString() || '')}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const parsedValue = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, hue: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, hue: filtered }
            });
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const parsedValue = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, hue: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, hue: filtered }
            });
            // Use validation for paste
            setTimeout(() => handleValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'hue', true)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-7 cursor-text text-right"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className={`r-text-secondary ${isHovered || isEditing ? '' : 'invisible'}`}>)</span>
      </div>
    );
  };

  return (
    <div
      className={`inline-block text-xs r-text-primary text-center uppercase`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        
        
        // If not editing, show color picker and focus input
        if (!isEditing) {
          // Show color picker
          if (onShowPicker) {
            onShowPicker();
          }
          
          // Focus the appropriate first input based on color format
          if (colorFormat === 'hex') {
            hexInputRef.current?.focus();
          } else if (colorFormat === 'hsl') {
            hslRefs.hue.current?.focus();
          } else if (colorFormat === 'oklch') {
            oklchRefs.lightness.current?.focus();
          }
        }
      }}
    >
      {colorFormat === 'hex' && renderHexInput()}
      {colorFormat === 'hsl' && renderHslInputs()}
      {colorFormat === 'oklch' && renderOklchInputs()}
    </div>
  );
};

export default EditableColorValue; 