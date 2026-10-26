import { Link } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Affichée à la place d'une page que le rôle connecté ne peut pas ouvrir (titre posé par Layout). */
export function PageReservee() {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Lock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-semibold">Accès réservé</h1>
      <p className="text-muted-foreground">
        Votre rôle ne donne pas accès à cette page. Demandez à un administrateur si vous en avez besoin.
      </p>
      <Button asChild>
        <Link href="/dashboard">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}
