import type { PermissionType } from "../enums/role.enum.js";
import { UnauthorizedException } from "./app-error.js";
import { RolePermissions } from "./rules-permission.js";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[]
) => {
  const permissions = RolePermissions[role];

  // If the role doesnt exists or lacks required permissions, throw an exception
  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermissions) {
    throw new UnauthorizedException(
      "You dont have the necessary permissions to perform this action"
    );
  }
};
