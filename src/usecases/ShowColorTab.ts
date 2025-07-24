import { useMainTabStore } from '@/state/MainTabState';

export function useShowColorTab() {
  const setActiveTab = useMainTabStore(state => state.setActiveTab);
  
  return () => setActiveTab('colors');
}