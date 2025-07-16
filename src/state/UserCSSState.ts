import { create } from 'zustand';

type State = {
  userCSSCode: string;
  isUserModified: boolean;
};

type Actions = {
  setUserCSSCode: (code: string) => void;
  setIsUserModified: (modified: boolean) => void;
  resetUserCSSCode: () => void;
};

export const useUserCSSStore = create<State & Actions>((set) => ({
  userCSSCode: '',
  isUserModified: false,
  setUserCSSCode: (code) => set({ userCSSCode: code, isUserModified: true }),
  setIsUserModified: (modified) => set({ isUserModified: modified }),
  resetUserCSSCode: () => set({ userCSSCode: '', isUserModified: false }),
})); 