import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarRange,
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  ListChecks,
  Wallet,
  Landmark,
  CalendarClock,
  BarChart3,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

export interface NavItem {
  labelKey: keyof Dictionary["nav"];
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "academicYears", href: "/academic-years", icon: CalendarRange },
  { labelKey: "classes", href: "/classes", icon: School },
  { labelKey: "teachers", href: "/teachers", icon: Users },
  { labelKey: "students", href: "/students", icon: GraduationCap },
  { labelKey: "subjects", href: "/subjects", icon: BookOpen },
  { labelKey: "attendance", href: "/attendance", icon: ClipboardCheck },
  { labelKey: "examsResults", href: "/exams", icon: FileText },
  { labelKey: "assignments", href: "/assignments", icon: ListChecks },
  { labelKey: "fees", href: "/fees", icon: Wallet },
  { labelKey: "financialManagement", href: "/financial", icon: Landmark },
  { labelKey: "timetable", href: "/timetable", icon: CalendarClock },
  { labelKey: "reports", href: "/reports", icon: BarChart3 },
];
