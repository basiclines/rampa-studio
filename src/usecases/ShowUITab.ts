import { useMainTabStore } from '@/state/MainTabState';

export function useShowUITab() {
  const setActiveTab = useMainTabStore(state => state.setActiveTab);
  
  return () => setActiveTab('ui');
}