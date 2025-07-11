import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useGetActiveTab } from '@/usecases/GetActiveTab';
import { useShowColorTab } from '@/usecases/ShowColorTab';
import { useShowUITab } from '@/usecases/ShowUITab';
import ColorsSection from './ColorsSection';
import UISection from './UISection';

const MainTabs: React.FC = () => {
  const activeTab = useGetActiveTab();
  const showColorTab = useShowColorTab();
  const showUITab = useShowUITab();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Navigation Tabs */}
      <div className="flex justify-center pt-6 pb-4">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            if (value === 'colors') {
              showColorTab();
            } else if (value === 'ui') {
              showUITab();
            }
          }}
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="colors" className="px-8 py-2">
              Colors
            </TabsTrigger>
            <TabsTrigger value="ui" className="px-8 py-2">
              UI
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'ui' && <UISection />}
      </div>
    </div>
  );
};

export default MainTabs;