import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";
import logo from "@/assets/logo-crm-models.png";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="CRM Models" className="h-9" />
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
