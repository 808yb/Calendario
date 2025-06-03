import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import createSelectors from "./selectors";

type UserType = {
  name: string;
  username: string;
  email: string;
};

type AuthSlice = {
  user: UserType | null;
  accessToken: string | null;
  expiresAt: number | null;
  setUser: (user: UserType | null) => void;
  setAccessToken: (token: string | null) => void;
  setExpiresAt: (expiresAt: number | null) => void;
  clearUser: () => void;
  clearAccessToken: () => void;
  clearExpiresAt: () => void;
};

type StoreType = AuthSlice;

const createAuthSlice: StateCreator<StoreType> = (set) => ({
  user: null,
  accessToken: null,
  expiresAt: null,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setExpiresAt: (expiresAt) => set({ expiresAt }),
  clearUser: () => set({ user: null }),
  clearAccessToken: () => set({ accessToken: null }),
  clearExpiresAt: () => set({ expiresAt: null }),
});

export const useStoreBase = create<StoreType>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAuthSlice(...a),
      })),
      {
        name: "local-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export const useStore = createSelectors(useStoreBase);
