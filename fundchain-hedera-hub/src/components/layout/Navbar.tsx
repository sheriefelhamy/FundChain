import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet/WalletButton";

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
};

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} />
          <span className="font-bold">FundChain</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" label="Home" />
          <NavLink to="/create" label="Create Project" />
          <NavLink to="/investments" label="My Investments" />
          <NavLink to="/tokens" label="Token Management" />
        </nav>
        <div className="flex items-center gap-2">
          <WalletButton />
          <Button asChild variant="secondary" className="md:hidden">
            <Link to="/create">New</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
