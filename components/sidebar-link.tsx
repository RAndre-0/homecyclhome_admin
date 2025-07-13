import Link from "next/link";

interface SidebarLinkProps {
    href: string;
    label: string;
    icon: IconType;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, label, icon: Icon }) => {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );
};

export default SidebarLink;
