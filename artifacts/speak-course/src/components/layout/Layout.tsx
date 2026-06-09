import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Mic2, Activity, LayoutDashboard, Settings, Sparkles } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Studio", icon: LayoutDashboard },
    { href: "/coach", label: "Coach", icon: Sparkles },
    { href: "/attempts", label: "Recordings", icon: Mic2 },
    { href: "/progress", label: "Progress", icon: Activity },
    { href: "/diagnostics", label: "Diagnostics", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0 flex flex-col">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-2 font-serif text-2xl font-bold text-primary cursor-pointer">
              <Mic2 className="w-8 h-8" />
              Podium
            </div>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide">Public Speaking Studio</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
