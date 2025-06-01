import React from 'react';

interface SegmentedControlProps {
  value: 'simple' | 'gradient';
  onChange: (v: 'simple' | 'gradient') => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange }) => {
  const isActive = value === 'gradient';
  return (
    <button
      type="button"
      onClick={() => onChange(isActive ? 'simple' : 'gradient')}
      style={{
        color: isActive ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
        background: isActive ? 'rgba(0,0,0,0.05)' : 'transparent',
        borderRadius: '3px',
        padding: '2px 6px',
        fontSize: '12px',
        textTransform: 'uppercase',
        fontWeight: 500,
        transition: 'background 0.15s, color 0.15s',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
      }}
      aria-pressed={isActive}
    >
      Gradient
    </button>
  );
};

export default SegmentedControl; 