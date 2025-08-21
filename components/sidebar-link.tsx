import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, label, icon: Icon, disabled }) => {
  const base =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all";
  const enabled =
    "text-muted-foreground hover:text-primary";
  const disabledClasses =
    "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none";

  if (disabled) {
    return (
      <span
        className={`${base} ${disabledClasses}`}
        aria-disabled="true"
        tabIndex={-1}
        title="Bientôt disponible"
      >
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={`${base} ${enabled}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

export default SidebarLink;
