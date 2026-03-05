import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Shield } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-hero rounded-lg p-1.5">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">Models</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/submit">
              <Plus className="h-4 w-4 mr-1" /> Enviar Modelo
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <Shield className="h-4 w-4 mr-1" /> Admin
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
