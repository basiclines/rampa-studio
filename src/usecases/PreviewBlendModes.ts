import { create } from 'zustand';

type State = {
  previewBlendModes: { [rampId: string]: string | undefined };
};

type Actions = {
  setPreviewBlendMode: (rampId: string, blendMode: string | undefined) => void;
};

const usePreviewBlendModesStore = create<State & Actions>((set) => ({
  previewBlendModes: {},
  setPreviewBlendMode: (rampId, blendMode) => 
    set((state) => ({
      previewBlendModes: {
        ...state.previewBlendModes,
        [rampId]: blendMode,
      },
    })),
}));

export function usePreviewBlendModes() {
  const previewBlendModes = usePreviewBlendModesStore(state => state.previewBlendModes);
  const setPreviewBlendMode = usePreviewBlendModesStore(state => state.setPreviewBlendMode);
  
  return { previewBlendModes, setPreviewBlendMode };
} 