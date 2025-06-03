import { create } from 'zustand';

type State = {
  selectedRampId: string | null;
};

type Actions = {
  selectColorRamp: (id: string | null) => void;
};

const useSelectColorRampStore = create<State & Actions>((set) => ({
  selectedRampId: null,
  selectColorRamp: (id) => set({ selectedRampId: id }),
}));

export function useSelectColorRamp() {
  const selectedRampId = useSelectColorRampStore(state => state.selectedRampId);
  const selectColorRamp = useSelectColorRampStore(state => state.selectColorRamp);
  
  return { selectedRampId, selectColorRamp };
} 