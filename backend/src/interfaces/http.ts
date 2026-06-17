import type { User } from "@prisma/client";

export interface AuthUser extends Pick<User, "id" | "email" | "firstName" | "lastName" | "roleId" | "area" | "position"> {
  role: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
