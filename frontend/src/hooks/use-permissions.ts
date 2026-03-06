'use client';

import { useAuthStore } from '@/store/auth-store';
import { useMemo, useCallback } from 'react';

export function usePermissions() {
    const { user } = useAuthStore();

    const permissions = useMemo(() => {
        if (!user || !user.role || !user.role.permissions) return [];
        return user.role.permissions;
    }, [user]);

    const canView = useCallback((moduleName: string) => {
        if (!user) return false;
        // Super admin check if needed, but for now strict RBAC
        const perm = permissions.find(p => p.module === moduleName);
        return perm ? perm.view : false;
    }, [user, permissions]);

    const hasAction = useCallback((moduleName: string, action: 'add' | 'edit' | 'delete' | 'print' | 'fullControl') => {
        if (!user) return false;
        const perm = permissions.find(p => p.module === moduleName);
        if (!perm) return false;

        if (perm.fullControl) return true;
        return (perm as any)[action] || false;
    }, [user, permissions]);

    return { canView, hasAction, permissions, roleName: user?.role?.name };
}
