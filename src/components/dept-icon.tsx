import {
  Briefcase,
  Building2,
  Code2,
  Eye,
  FilePlus2,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  Languages,
  Mic,
  Microscope,
  Palette,
  Presentation,
  Settings,
  Sparkles,
  Sprout,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Building2,
  Code2,
  Eye,
  FilePlus2,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  Languages,
  Mic,
  Microscope,
  Palette,
  Presentation,
  Settings,
  Sparkles,
  Sprout,
};

export function DeptIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
