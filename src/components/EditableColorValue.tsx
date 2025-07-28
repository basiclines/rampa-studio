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
}

const EditableColorValue: React.FC<EditableColorValueProps> = ({
  color,
  colorFormat,
  rampId,
  colorType,
  className = ''
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
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastInputLength, setLastInputLength] = useState<{[key: string]: number}>({});

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
      
      // Initialize input length tracking when starting to edit
      if (colorFormat === 'hex') {
        setLastInputLength(prev => ({ ...prev, hex: (parsed.hex || '').length }));
      } else if (colorFormat === 'hsl' && parsed.hsl) {
        setLastInputLength(prev => ({
          ...prev,
          'hsl-hue': parsed.hsl!.hue.toString().length,
          'hsl-saturation': parsed.hsl!.saturation.toString().length,
          'hsl-lightness': parsed.hsl!.lightness.toString().length
        }));
      } else if (colorFormat === 'oklch' && parsed.oklch) {
        const lightnessStr = parsed.oklch.lightness.toString();
        const chromaStr = parsed.oklch.chroma.toString();
        const hueStr = parsed.oklch.hue.toString();
        
        // Initialize string values for editing
        setEditValues(prev => ({
          ...prev,
          oklchStrings: {
            lightness: lightnessStr,
            chroma: chromaStr,
            hue: hueStr
          }
        }));
        
        setLastInputLength(prev => ({
          ...prev,
          'oklch-lightness': lightnessStr.length,
          'oklch-chroma': chromaStr.length,
          'oklch-hue': hueStr.length
        }));
      }
    } else if (!isEditing) {
      // Reset input length tracking when exiting edit mode
      setLastInputLength({});
    }
  }, [color, colorFormat, isEditing, editValues]);

  // Cleanup timeout on unmount or when editing ends
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Clear timeout when exiting edit mode
  useEffect(() => {
    if (!isEditing && debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
  }, [isEditing, debounceTimeout]);

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

  // Debounced validation function
  const handleDebouncedValidation = useCallback(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
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
         }, 300); // Increased from 100ms to prevent interference with ongoing typing
    
    setDebounceTimeout(timeout);
  }, [debounceTimeout, colorFormat, editValues, rampId, colorType, setHEXColorValue, setHSLColorValue, setOKLCHColorValue]);

  // Apply immediate validation (used for blur, arrow keys, and paste)
  const handleImmediateValidation = useCallback(() => {
    // Clear any pending debounced validation
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }

    // Apply the changes immediately
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
  }, [debounceTimeout, colorFormat, editValues, rampId, colorType, setHEXColorValue, setHSLColorValue, setOKLCHColorValue]);

  // Handle finishing edit mode
  const handleFinishEditing = useCallback(() => {
    if (!isEditing) return;

    handleImmediateValidation();
    setIsEditing(false);
    setEditValues({});
  }, [isEditing, handleImmediateValidation]);

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
    
    if (isOklch && editValues.oklch) {
      const current = editValues.oklch;
      let newValue: number;
      
      if (fieldType === 'lightness') {
        const increment = isUp ? 0.01 : -0.01;
        newValue = Math.min(1, Math.max(0, current.lightness + increment));
        const roundedValue = parseFloat(newValue.toFixed(3));
        setEditValues({
          oklch: { ...current, lightness: roundedValue },
          oklchStrings: { ...editValues.oklchStrings, lightness: roundedValue.toString() }
        });
      } else if (fieldType === 'chroma') {
        const increment = isUp ? 0.01 : -0.01;
        newValue = Math.min(0.5, Math.max(0, current.chroma + increment));
        const roundedValue = parseFloat(newValue.toFixed(3));
        setEditValues({
          oklch: { ...current, chroma: roundedValue },
          oklchStrings: { ...editValues.oklchStrings, chroma: roundedValue.toString() }
        });
      } else if (fieldType === 'hue') {
        const increment = isUp ? 1 : -1;
        newValue = (current.hue + increment + 360) % 360;
        const roundedValue = Math.round(newValue);
        setEditValues({
          oklch: { ...current, hue: roundedValue },
          oklchStrings: { ...editValues.oklchStrings, hue: roundedValue.toString() }
        });
      }
    } else if (!isOklch && editValues.hsl) {
      const current = editValues.hsl;
      const increment = isUp ? 1 : -1;
      let newValue: number;
      
      if (fieldType === 'hue') {
        newValue = (current.hue + increment + 360) % 360;
        setEditValues({
          hsl: { ...current, hue: newValue }
        });
      } else if (fieldType === 'saturation') {
        newValue = Math.min(100, Math.max(0, current.saturation + increment));
        setEditValues({
          hsl: { ...current, saturation: newValue }
        });
      } else if (fieldType === 'lightness') {
        newValue = Math.min(100, Math.max(0, current.lightness + increment));
        setEditValues({
          hsl: { ...current, lightness: newValue }
        });
      }
    }
    
    // Trigger debounced validation after arrow key increment to avoid state interference
    handleDebouncedValidation();
    return true;
  }, [editValues, handleDebouncedValidation]);

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
    <div className="flex items-center">
      <span className="r-text-primary">#</span>
              <input
          ref={hexInputRef}
          type="text"
          value={isEditing ? (editValues.hex || '') : color.replace('#', '').toUpperCase()}
          onChange={(e) => {
            const filtered = filterHexInput(e.target.value);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['hex'] || 0;
            const isDeletion = currentLength < previousLength;
            
            setEditValues({ hex: filtered });
            setLastInputLength(prev => ({ ...prev, hex: currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterHexInput(pastedText);
            setEditValues({ hex: filtered });
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-16 cursor-text"
          maxLength={6}
          readOnly={!isEditing}
        />
    </div>
  );

  // Render HSL inputs
  const renderHslInputs = () => {
    const currentValues = isEditing ? editValues.hsl : parseColorForEditing(color, colorFormat).hsl;
    
    return (
      <div className="flex items-center gap-1">
        <span className="r-text-primary">hsl(</span>
        <input
          ref={hslRefs.hue}
          type="text"
          value={currentValues?.hue?.toString() || ''}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['hsl-hue'] || 0;
            const isDeletion = currentLength < previousLength;
            
            const value = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, hue: value }
            });
            setLastInputLength(prev => ({ ...prev, 'hsl-hue': currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const value = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, hue: value }
            });
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'hue', false)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-8 cursor-text"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className="r-text-primary">, </span>
        <input
          ref={hslRefs.saturation}
          type="text"
          value={currentValues?.saturation?.toString() || ''}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['hsl-saturation'] || 0;
            const isDeletion = currentLength < previousLength;
            
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, saturation: value }
            });
            setLastInputLength(prev => ({ ...prev, 'hsl-saturation': currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, saturation: value }
            });
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'saturation', false)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-8 cursor-text"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className="r-text-primary">, </span>
        <input
          ref={hslRefs.lightness}
          type="text"
          value={currentValues?.lightness?.toString() || ''}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['hsl-lightness'] || 0;
            const isDeletion = currentLength < previousLength;
            
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, lightness: value }
            });
            setLastInputLength(prev => ({ ...prev, 'hsl-lightness': currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const filtered = filterNumericInput(pastedText, false);
            const value = Math.min(100, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              hsl: { ...editValues.hsl!, lightness: value }
            });
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'lightness', false)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-8 cursor-text"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className="r-text-primary">)</span>
      </div>
    );
  };

  // Render OKLCH inputs
  const renderOklchInputs = () => {
    const currentValues = isEditing ? editValues.oklch : parseColorForEditing(color, colorFormat).oklch;
    const currentStrings = isEditing ? editValues.oklchStrings : undefined;
    
    return (
      <div className="flex items-center gap-1">
        <span className="r-text-primary">oklch(</span>
        <input
          ref={oklchRefs.lightness}
          type="text"
          value={isEditing ? (currentStrings?.lightness || '') : (currentValues?.lightness?.toString() || '')}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, true);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['oklch-lightness'] || 0;
            const isDeletion = currentLength < previousLength;
            
            const parsedValue = Math.min(1, Math.max(0, parseFloat(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, lightness: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, lightness: filtered }
            });
            setLastInputLength(prev => ({ ...prev, 'oklch-lightness': currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
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
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'lightness', true)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-12 cursor-text"
          readOnly={!isEditing}
        />
        <span className="r-text-primary">, </span>
        <input
          ref={oklchRefs.chroma}
          type="text"
          value={isEditing ? (currentStrings?.chroma || '') : (currentValues?.chroma?.toString() || '')}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, true);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['oklch-chroma'] || 0;
            const isDeletion = currentLength < previousLength;
            
            const parsedValue = Math.min(0.5, Math.max(0, parseFloat(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, chroma: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, chroma: filtered }
            });
            setLastInputLength(prev => ({ ...prev, 'oklch-chroma': currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
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
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'chroma', true)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-12 cursor-text"
          readOnly={!isEditing}
        />
        <span className="r-text-primary">, </span>
        <input
          ref={oklchRefs.hue}
          type="text"
          value={isEditing ? (currentStrings?.hue || '') : (currentValues?.hue?.toString() || '')}
          onChange={(e) => {
            const filtered = filterNumericInput(e.target.value, false);
            const currentLength = filtered.length;
            const previousLength = lastInputLength['oklch-hue'] || 0;
            const isDeletion = currentLength < previousLength;
            
            const parsedValue = Math.min(360, Math.max(0, parseInt(filtered) || 0));
            setEditValues({
              oklch: { ...editValues.oklch!, hue: parsedValue },
              oklchStrings: { ...editValues.oklchStrings, hue: filtered }
            });
            setLastInputLength(prev => ({ ...prev, 'oklch-hue': currentLength }));
            
            // Skip debounced validation if user is deleting (incomplete values)
            if (!isDeletion) {
              handleDebouncedValidation();
            }
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
            // Use immediate validation for paste
            setTimeout(() => handleImmediateValidation(), 0);
          }}
          onFocus={(e) => handleStartEditing(e)}
          onBlur={handleFinishEditing}
          onKeyDown={(e) => handleKeyDown(e, 'hue', true)}
          className="bg-transparent border-none outline-none r-text-primary text-xs min-w-0 w-8 cursor-text"
          maxLength={3}
          readOnly={!isEditing}
        />
        <span className="r-text-primary">)</span>
      </div>
    );
  };

  return (
    <div
      className={`text-xs r-text-primary text-center uppercase px-1 ${className} ${
        isHovered || isEditing ? 'active ' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {colorFormat === 'hex' && renderHexInput()}
      {colorFormat === 'hsl' && renderHslInputs()}
      {colorFormat === 'oklch' && renderOklchInputs()}
    </div>
  );
};

export default EditableColorValue; 