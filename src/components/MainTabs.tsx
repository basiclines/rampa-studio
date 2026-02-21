import React, { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetActiveTab } from '@/usecases/GetActiveTab';
import { useShowColorTab } from '@/usecases/ShowColorTab';
import { useShowUITab } from '@/usecases/ShowUITab';
import { useShowColorSpacesTab } from '@/usecases/ShowColorSpacesTab';
import ColorsSection from './ColorsSection';
import UISection from './UISection';
import ColorSpacesSection from './ColorSpacesSection';
import { getVariant } from '@/utilities/AmplitudeTracker';
import type { MainTabType } from '@/state/MainTabState';


const MainTabs: React.FC = () => {
  const activeTab = useGetActiveTab();
  const showColorTab = useShowColorTab();
  const showUITab = useShowUITab();
  const showColorSpacesTab = useShowColorSpacesTab();
  const [tabsEnabled, setTabsEnabled] = useState<boolean>(false);

  useEffect(() => {
    getVariant('components_editor').then((variant) => {
      setTabsEnabled(variant === 'on');
    }).catch((error) => {
      console.error('Error getting variant:', error);
      setTabsEnabled(false);
    });
  }, [])

  const handleTabChange = (value: string) => {
    if (value === 'colors') showColorTab();
    else if (value === 'ui') showUITab();
    else if (value === 'colorSpaces') showColorSpacesTab();
  };
  
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Navigation Tabs */}
      <div className="flex justify-center pt-6 pb-4">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-auto"
        >
          <TabsList className={`grid w-full bg-white shadow-sm ${tabsEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="colors" className="px-8 py-2">
              Ramps
            </TabsTrigger>
            <TabsTrigger value="colorSpaces" className="px-8 py-2">
              Color Spaces
            </TabsTrigger>
            {tabsEnabled && (
              <TabsTrigger value="ui" className="px-8 py-2">
                UI
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'colorSpaces' && <ColorSpacesSection />}
        {activeTab === 'ui' && <UISection />}
      </div>
    </div>
  );
};

export default MainTabs;