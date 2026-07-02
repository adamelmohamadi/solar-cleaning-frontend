import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  SprayCan,
  FileBarChart,
  Bell,
  Users,
  X,
} from "lucide-react";
import logo from "../../assets/USElogo.png";
import { useAuth } from "../../context/AuthContext";

const navItemsAdmin = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/projets", label: "Projets", icon: FolderKanban },
  { to: "/nettoyages", label: "Nettoyages", icon: SprayCan },
  { to: "/rapports", label: "Rapports", icon: FileBarChart },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/utilisateurs", label: "Utilisateurs", icon: Users },
];

const navItemsConsultation = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/projets", label: "Projets", icon: FolderKanban },
  { to: "/nettoyages", label: "Nettoyages", icon: SprayCan },
  { to: "/rapports", label: "Rapports", icon: FileBarChart },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const navItemsMainteneur = [
  { to: "/", label: "Mes nettoyages", icon: SprayCan },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar({ onClose }) {
  const { utilisateur } = useAuth();

  const estAdmin = utilisateur?.is_superuser || utilisateur?.role === "DIRECTEUR_GENERAL";
  const estMainteneur = !estAdmin && utilisateur?.role === "MAINTENEUR";

  const navItems = estAdmin
    ? navItemsAdmin
    : estMainteneur
    ? navItemsMainteneur
    : navItemsConsultation;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Unisystem Energy" style={{ height: 36, width: "auto", objectFit: "contain" }} />
          <span className="text-sm font-semibold tracking-tight leading-tight">
            Unisystem Energy
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-5 text-xs text-sidebar-foreground/50">
        © {new Date().getFullYear()} Unisystem Energy
      </div>
    </aside>
  );
}