import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetActiveTab } from '@/usecases/GetActiveTab';
import { useShowColorTab } from '@/usecases/ShowColorTab';
import { useShowColorSpacesTab } from '@/usecases/ShowColorSpacesTab';
import ColorsSection from './ColorsSection';
import ColorSpacesSection from './ColorSpacesSection';


const MainTabs: React.FC = () => {
  const activeTab = useGetActiveTab();
  const showColorTab = useShowColorTab();
  const showColorSpacesTab = useShowColorSpacesTab();

  const handleTabChange = (value: string) => {
    if (value === 'colors') showColorTab();
    else if (value === 'colorSpaces') showColorSpacesTab();
  };
  
  return (
    <div className="h-screen r-canvas-dotgrid">
      {/* Top Navigation Tabs */}
      <div className="fixed top-0 left-0 right-0 flex justify-center pt-6 pb-4 z-50 pointer-events-none">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-auto pointer-events-auto"
        >
          <TabsList>
            <TabsTrigger value="colors" className="px-8 py-2">
              Ramps
            </TabsTrigger>
            <TabsTrigger value="colorSpaces" className="px-8 py-2">
              Color Spaces
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="h-full">
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'colorSpaces' && <ColorSpacesSection />}
      </div>
    </div>
  );
};

export default MainTabs;