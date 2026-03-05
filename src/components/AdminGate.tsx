import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "Models@2026";
const STORAGE_KEY = "admin_authenticated";

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setAuthenticated(true);
    } else {
      setError(true);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Lock className="h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-xl font-bold text-foreground">Área Restrita</h1>
          <p className="text-sm text-muted-foreground">Digite a senha para acessar o painel.</p>
        </div>
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">Senha incorreta.</p>}
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </div>
  );
};
