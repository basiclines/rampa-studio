import React from 'react';
import ScopedStyleInjector from './ScopedStyleInjector';
import { ComponentProvider } from '@/state/ComponentProviderState';
import ShadcnComponentKit from '@/uiproviders/ShadcnComponentKit';

interface ComponentsPlaygroundProps {
  provider: ComponentProvider;
}

const ComponentsPlayground: React.FC<ComponentsPlaygroundProps> = ({ provider }) => {
  const renderShadcnComponents = () => <ShadcnComponentKit />;

  const renderComingSoonMessage = (providerName: string) => (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {providerName} Components
        </h3>
        <p className="text-sm text-gray-500">
          Coming soon! This provider will be available in a future update.
        </p>
      </div>
    </div>
  );

  const renderComponentsByProvider = () => {
    switch (provider) {
      case 'shadcn':
        return renderShadcnComponents();
      case 'bootstrap':
        return renderComingSoonMessage('Bootstrap');
      case 'radix':
        return renderComingSoonMessage('Radix');
      case 'tailwindui':
        return renderComingSoonMessage('TailwindUI');
      default:
        return renderShadcnComponents();
    }
  };

  return (
    <>
      <ScopedStyleInjector />
      <div className="component-preview">
        {renderComponentsByProvider()}
      </div>
    </>
  );
};

export default ComponentsPlayground;