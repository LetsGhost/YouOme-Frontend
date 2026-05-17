import { NavLink, Outlet } from "react-router-dom";
import { House, Users, UserRound, Settings, LogOut } from "lucide-react";
import { useAppState } from "../../app/AppStateContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: House },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/friends", label: "Friends", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { logout } = useAppState();

  return (
    <div className="shell-root">
      <main className="shell-main">
        <div className="shell-content">
          <Outlet />
        </div>
      </main>

      <nav className="ig-nav-wrap" aria-label="Primary">
        <div className="ig-nav-pill">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={({ isActive }) =>
                  `ig-nav-item${isActive ? " ig-nav-item-active" : ""}`
                }
              >
                <Icon size={25} strokeWidth={2.2} />
              </NavLink>
            );
          })}

          <button
            type="button"
            aria-label="Logout"
            onClick={() => void logout()}
            className="ig-nav-item ig-nav-item-logout"
          >
            <LogOut size={25} strokeWidth={2.2} />
          </button>
        </div>
      </nav>
    </div>
  );
}