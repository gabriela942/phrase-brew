import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import logo from "@/assets/logo-crm-models.png";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="CRM Models" className="h-9 transition-transform group-hover:scale-105" />
        </Link>

        <nav className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-hero hover:opacity-90 transition-opacity shadow-md gap-1.5"
            asChild
          >
            <a href="#como-contribuir">
              <Plus className="h-4 w-4" />
              Enviar Modelo
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
