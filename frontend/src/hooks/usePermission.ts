import React from "react";
import { useAuthStore } from "../store/auth.store";

export function useHasPermission() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = React.useCallback(
    (permissionKey: string) => {
      if (!user) return false;
      // Admin General has access to everything
      if (user.role === "Administrador General") return true;
      return user.permissions?.includes(permissionKey) || false;
    },
    [user]
  );

  return hasPermission;
}

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const hasPermission = useHasPermission();
  return hasPermission(permission)
    ? React.createElement(React.Fragment, null, children)
    : React.createElement(React.Fragment, null, fallback);
}
