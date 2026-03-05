import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
            <a href="#como-contribuir">
              <Plus className="h-4 w-4 mr-1" /> Enviar Modelo
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
