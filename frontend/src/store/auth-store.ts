import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Permission {
    module: string;
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    print: boolean;
    fullControl: boolean;
}

interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

interface AuthState {
    token: string | null;
    user: User | null;
    _hasHydrated: boolean;
    setAuth: (token: string, user: User) => void;
    setUser: (user: User) => void;
    setHasHydrated: (state: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            _hasHydrated: false,
            setAuth: (token, user) => set({ token, user }),
            setUser: (user) => set({ user }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) state.setHasHydrated(true);
            },
        },
    ),
);
