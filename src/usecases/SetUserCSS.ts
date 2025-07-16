import { useUserCSSStore } from '@/state/UserCSSState';

export function useSetUserCSS() {
  return useUserCSSStore(state => state.setUserCSSCode);
}

export function useResetUserCSS() {
  return useUserCSSStore(state => state.resetUserCSSCode);
}

export function useSetIsUserCSSModified() {
  return useUserCSSStore(state => state.setIsUserModified);
} 