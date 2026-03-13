import { Link, useLocation } from "react-router-dom";
import { Calculator, Home, History, TrendingUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface LayoutProps {
  children: React.ReactNode;
}

/** Main application layout with header navigation and logo. */
export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/calculator", label: "Calculator", icon: Calculator },
    { path: "/sensitivity", label: "Sensitivity", icon: TrendingUp },
    { path: "/runs", label: "History", icon: History },
    { path: "/documentation", label: "Manual", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a
              href="https://giovannimalagninoconsulting.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <img
                src={logo}
                alt="Giovanni Malagnino Consulting"
                className="h-10 w-auto hover:opacity-80 transition-opacity"
              />
            </a>

            <nav className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};
