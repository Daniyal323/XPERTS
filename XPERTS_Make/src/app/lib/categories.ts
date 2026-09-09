import {
  ShoppingCart,
  Factory,
  Truck,
  ClipboardCheck,
  TrendingUp,
  Users,
  Wrench,
  Package,
  type LucideIcon,
} from "lucide-react";

/**
 * Canonical project areas. `id` is stored on the project; `labelKey` resolves
 * the localized label so the same category reads correctly in EN and DE.
 */
export interface ProjectCategory {
  id: string;
  labelKey: string;
  icon: LucideIcon;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: "purchasing", labelKey: "project.categories.purchasing", icon: ShoppingCart },
  { id: "production", labelKey: "project.categories.production", icon: Factory },
  { id: "logistics", labelKey: "project.categories.logistics", icon: Truck },
  { id: "quality", labelKey: "project.categories.quality", icon: ClipboardCheck },
  { id: "sales", labelKey: "project.categories.sales", icon: TrendingUp },
  { id: "hr", labelKey: "project.categories.hr", icon: Users },
  { id: "maintenance", labelKey: "project.categories.maintenance", icon: Wrench },
  { id: "warehouse", labelKey: "project.categories.warehouse", icon: Package },
];

export function categoryLabelKey(id: string): string {
  return PROJECT_CATEGORIES.find((c) => c.id === id)?.labelKey ?? id;
}
