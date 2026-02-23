import { useMainTabStore } from '@/state/MainTabState';

export function useShowColorSpacesTab() {
  const setActiveTab = useMainTabStore(state => state.setActiveTab);
  
  return () => setActiveTab('colorSpaces');
}
