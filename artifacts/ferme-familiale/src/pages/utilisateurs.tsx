import { useState, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, Users, UserPlus } from "lucide-react";
import { useSortable } from "@/lib/use-sortable";
import { DataPagination } from "@/components/data-pagination";
import { confirmAction } from "@/lib/confirm-dialog";

type UserInfo = {
  id: number;
  username: string;
  nom: string;
  role: string;
  createdAt: string;
};

const ROLES = [
  { value: "admin", label: "Administrateur", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "gestionnaire", label: "Gestionnaire", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "investisseur", label: "Investisseur", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "lecteur", label: "Lecteur", color: "bg-gray-100 text-gray-800 border-gray-200" },
];

function getRoleInfo(role: string) {
  return ROLES.find(r => r.value === role) || { value: role, label: role, color: "bg-gray-100 text-gray-800 border-gray-200" };
}

export default function Utilisateurs() {
  const { data: currentUser } = useGetMe();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  // BLOC 7 — Tri + pagination
  const { sorted, toggleSort, sortIcon } = useSortable<UserInfo>(users, "nom", "asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nom: "", username: "", password: "", role: "lecteur" });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/users`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`${baseUrl}/auth/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Rôle mis à jour" });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || form.username.trim().length < 3 || form.password.length < 6) {
      toast({ title: "Champs invalides", description: "Nom requis, identifiant ≥ 3 caractères, mot de passe ≥ 6 caractères.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erreur");
      toast({ title: "Compte créé", description: `${form.nom} (${form.role}) ajouté.` });
      setForm({ nom: "", username: "", password: "", role: "lecteur" });
      setCreateOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId: number, nom: string) => {
    const ok = await confirmAction({
      title: "Supprimer cet utilisateur ?",
      description: `Le compte de ${nom} sera supprimé définitivement. Cette action est irréversible.`,
      confirmText: "Supprimer",
      destructive: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${baseUrl}/auth/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Compte supprimé" });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les comptes et les droits d'accès</p>
        </div>
        {currentUser?.role === "admin" && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" /> Nouvel utilisateur</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un compte</DialogTitle>
                <DialogDescription>Le nouvel utilisateur pourra se connecter immédiatement avec ces identifiants.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-nom">Nom complet</Label>
                  <Input id="new-nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Marie Mbiedou" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-username">Identifiant (min. 3 caractères)</Label>
                  <Input id="new-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Ex: marie" autoComplete="off" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mot de passe (min. 6 caractères)</Label>
                  <Input id="new-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Rôle</Label>
                  <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <SelectTrigger id="new-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Annuler</Button>
                  <Button type="submit" disabled={creating}>{creating ? "Création..." : "Créer le compte"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role.value).length;
          return (
            <Card key={role.value} className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{role.label}s</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Badge variant="outline" className={role.color}>{role.label}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tous les utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("nom")}>Nom <span className="text-xs text-muted-foreground">{sortIcon("nom")}</span></TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("username")}>Identifiant <span className="text-xs text-muted-foreground">{sortIcon("username")}</span></TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("role")}>Rôle <span className="text-xs text-muted-foreground">{sortIcon("role")}</span></TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>Inscription <span className="text-xs text-muted-foreground">{sortIcon("createdAt")}</span></TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.slice((page - 1) * pageSize, page * pageSize).map(u => {
                const roleInfo = getRoleInfo(u.role);
                const isCurrentUser = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.nom}
                      {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(vous)</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.username}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.id, val)}
                        disabled={isCurrentUser}
                      >
                        <SelectTrigger className="w-[160px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy') : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(u.id, u.nom)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <DataPagination
            page={page}
            pageSize={pageSize}
            total={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="border-t"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-blue-400">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> Description des rôles</h3>
          <div className="grid gap-2 text-sm">
            <div><span className="font-medium">Administrateur</span> : Accès complet à toutes les fonctionnalités, gestion des utilisateurs</div>
            <div><span className="font-medium">Gestionnaire</span> : Peut ajouter et modifier les dépenses, bandes, ventes</div>
            <div><span className="font-medium">Investisseur</span> : Consultation du financement, historique caisse, comparaisons</div>
            <div><span className="font-medium">Lecteur</span> : Accès en lecture seule au tableau de bord et aux données principales</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
