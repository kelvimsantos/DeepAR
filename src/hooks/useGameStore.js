import { create } from 'zustand';

const useGameStore = create((set) => ({
  playerRigidBody: null,
  setPlayerRigidBody: (rb) => set({ playerRigidBody: rb }),
  worldGroupRef: null,
  setWorldGroupRef: (ref) => set({ worldGroupRef: ref }),
  worldPlaced: false,
  setWorldPlaced: (placed) => set({ worldPlaced: placed }),
}));

export default useGameStore;