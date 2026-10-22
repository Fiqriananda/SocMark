export type ActiveRole = "buyer" | "creator" | "merchant";

/** Role values as the backend / RBAC layer understands them. */
export type ApiRole = "REGULAR_USER" | "CONTENT_CREATOR" | "MERCHANT";

/** Role stored on the user row (prisma enum `UserRole`). */
export type DbRole = "user" | "creator" | "merchant" | "admin";

export interface RoleMeta {
  id: ActiveRole;
  apiRole: ApiRole;
  /** Text shown inside the role switcher pill. */
  pillLabel: string;
  /** Short label for the dropdown list. */
  description: string;
  /** Tailwind-free status dot color. */
  dotColor: string;
  /** Contextual link shown to this role (null = none). */
  workspace: { label: string; href: string } | null;
}

export const ROLE_META: Record<ActiveRole, RoleMeta> = {
  buyer: {
    id: "buyer",
    apiRole: "REGULAR_USER",
    pillLabel: "Buyer Mode",
    description: "Belanja dan ikuti kreator",
    dotColor: "#2563eb",
    workspace: null,
  },
  creator: {
    id: "creator",
    apiRole: "CONTENT_CREATOR",
    pillLabel: "Creator Studio",
    description: "Posting konten dan kelola komunitas",
    dotColor: "#7c3aed",
    workspace: { label: "Studio Posting", href: "/studio" },
  },
  merchant: {
    id: "merchant",
    apiRole: "MERCHANT",
    pillLabel: "Merchant Store",
    description: "Kelola etalase, produk, dan pesanan",
    dotColor: "#059669",
    workspace: { label: "Kelola Toko", href: "/merchant" },
  },
};

export const ROLE_ORDER: ActiveRole[] = ["buyer", "creator", "merchant"];

export function isActiveRole(value: unknown): value is ActiveRole {
  return value === "buyer" || value === "creator" || value === "merchant";
}

/** Every account is a buyer; creator/merchant add on top. Admin may use all modes. */
export function rolesFromDbRole(role: DbRole | string | undefined): ActiveRole[] {
  switch (role) {
    case "creator":
      return ["buyer", "creator"];
    case "merchant":
      return ["buyer", "merchant"];
    case "admin":
      return ["buyer", "creator", "merchant"];
    default:
      return ["buyer"];
  }
}

export function canCreate(role: ActiveRole): boolean {
  return role === "creator" || role === "merchant";
}
