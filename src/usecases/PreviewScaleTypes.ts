import { create } from 'zustand';

type State = {
  previewScaleType: string | null;
};

type Actions = {
  setPreviewScaleType: (type: string | null) => void;
};

const usePreviewScaleTypesStore = create<State & Actions>((set) => ({
  previewScaleType: null,
  setPreviewScaleType: (type) => set({ previewScaleType: type }),
}));

export function usePreviewScaleTypes() {
  const previewScaleType = usePreviewScaleTypesStore(state => state.previewScaleType);
  const setPreviewScaleType = usePreviewScaleTypesStore(state => state.setPreviewScaleType);
  
  return { previewScaleType, setPreviewScaleType };
} 