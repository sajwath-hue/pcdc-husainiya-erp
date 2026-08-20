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

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Academic Years", href: "/academic-years", icon: CalendarRange },
  { label: "Classes", href: "/classes", icon: School },
  { label: "Teachers", href: "/teachers", icon: Users },
  { label: "Students", href: "/students", icon: GraduationCap },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { label: "Exams & Results", href: "/exams", icon: FileText },
  { label: "Assignments", href: "/assignments", icon: ListChecks },
  { label: "Fees", href: "/fees", icon: Wallet },
  { label: "Financial Management", href: "/financial", icon: Landmark },
  { label: "Timetable", href: "/timetable", icon: CalendarClock },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];
