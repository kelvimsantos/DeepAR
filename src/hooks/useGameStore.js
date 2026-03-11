import { create } from 'zustand';

const useGameStore = create((set) => ({
  playerRigidBody: null,
  setPlayerRigidBody: (rb) => set({ playerRigidBody: rb }),

  movementDirection: null,
  setMovementDirection: (dir) => set({ movementDirection: dir }),

  worldPlaced: false,
  setWorldPlaced: (placed) => set({ worldPlaced: placed }),

  worldGroupRef: null,
  setWorldGroupRef: (ref) => set({ worldGroupRef: ref }),
}));

export default useGameStore;