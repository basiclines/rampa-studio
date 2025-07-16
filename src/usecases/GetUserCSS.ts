import { useUserCSSStore } from '@/state/UserCSSState';

export function useGetUserCSS() {
  return useUserCSSStore(state => state.userCSSCode);
}

export function useIsUserCSSModified() {
  return useUserCSSStore(state => state.isUserModified);
} 