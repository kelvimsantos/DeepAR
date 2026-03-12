import { create } from 'zustand';

const useGameStore = create((set) => ({
  playerRigidBody: null,
  setPlayerRigidBody: (rb) => set({ playerRigidBody: rb }),

  playerPosition: { x: 0, y: 0, z: 0 }, // novo
  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  movementDirection: null,
  setMovementDirection: (dir) => set({ movementDirection: dir }),

  worldPlaced: false,
  setWorldPlaced: (placed) => set({ worldPlaced: placed }),

  worldGroupRef: null,
  setWorldGroupRef: (ref) => set({ worldGroupRef: ref }),
}));

export default useGameStore;