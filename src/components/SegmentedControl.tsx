import React from 'react';

interface SegmentedControlProps {
  value: 'simple' | 'gradient';
  onChange: (v: 'simple' | 'gradient') => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange }) => (
  <div className="inline-flex text-xs">
    <button
      style={{ color: value === 'simple' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)', marginRight: '8px' }}
      onClick={() => onChange('simple')}
      type="button"
    >Simple</button>
    <button
      style={{ color: value === 'gradient' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)' }}
      onClick={() => onChange('gradient')}
      type="button"
    >Gradient</button>
  </div>
);

export default SegmentedControl; 