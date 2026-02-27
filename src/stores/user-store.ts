// Zustand store for user state
import { create } from "zustand";

interface UserState {
    // User profile
    name: string | null;
    province: string | null;
    preferredCurrency: string;
    onboardingCompleted: boolean;

    // Actions
    setName: (name: string) => void;
    setProvince: (province: string) => void;
    setPreferredCurrency: (currency: string) => void;
    setOnboardingCompleted: (completed: boolean) => void;
    reset: () => void;
}

const initialState = {
    name: null,
    province: null,
    preferredCurrency: "aeroplan",
    onboardingCompleted: false,
};

export const useUserStore = create<UserState>((set) => ({
    ...initialState,

    setName: (name) => set({ name }),
    setProvince: (province) => set({ province }),
    setPreferredCurrency: (preferredCurrency) => set({ preferredCurrency }),
    setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
    reset: () => set(initialState),
}));
