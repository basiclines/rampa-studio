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
    <div className="min-h-screen bg-muted">
      {/* Top Navigation Tabs */}
      <div className="flex justify-center pt-6 pb-4">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
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
      <div className="flex-1">
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'colorSpaces' && <ColorSpacesSection />}
      </div>
    </div>
  );
};

export default MainTabs;