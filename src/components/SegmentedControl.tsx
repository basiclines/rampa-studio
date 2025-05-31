import React from 'react';

interface SegmentedControlProps {
  value: 'simple' | 'gradient';
  onChange: (v: 'simple' | 'gradient') => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange }) => (
  <div className="inline-flex text-xs">
    <button
      className={`${value === 'simple' ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'} px-2 py-1 transition-colors`}
      onClick={() => onChange('simple')}
      type="button"
    >Simple</button>
    <button
      className={`${value === 'gradient' ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'} px-2 py-1 transition-colors`}
      onClick={() => onChange('gradient')}
      type="button"
    >Gradient</button>
  </div>
);

export default SegmentedControl; 