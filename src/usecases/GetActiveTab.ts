import { useMainTabStore } from '@/state/MainTabState';

export function useGetActiveTab() {
  return useMainTabStore(state => state.activeTab);
}