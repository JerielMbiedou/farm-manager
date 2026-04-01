import { useState } from "react";
import { useListFinancements, useCreateFinancement, useUpdateFinancement, useDeleteFinancement, useGetMe, getListFinancementsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatFCFA } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const financementSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  montant: z.coerce.number().min(1, "Le montant doit être supérieur à 0"),
  date: z.string().min(1, "La date est requise"),
});

export default function Financement() {
  const { data: financements, isLoading } = useListFinancements();
  const { data: user } = useGetMe();
  const createFinancement = useCreateFinancement();
  const updateFinancement = useUpdateFinancement();
  const deleteFinancement = useDeleteFinancement();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const isAdmin = user?.role === "admin";
  const isReadOnly = user?.role === "investisseur" || user?.role === "gestionnaire";

  const form = useForm<z.infer<typeof financementSchema>>({
    resolver: zodResolver(financementSchema),
    defaultValues: {
      nom: "",
      montant: 0,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof financementSchema>) => {
    try {
      if (editingId) {
        await updateFinancement.mutateAsync({ id: editingId, data: values });
        toast({ title: "Financement mis à jour" });
      } else {
        await createFinancement.mutateAsync({ data: values });
        toast({ title: "Financement ajouté" });
      }
      queryClient.invalidateQueries({ queryKey: getListFinancementsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    form.reset({
      nom: item.nom,
      montant: item.montant,
      date: new Date(item.date).toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet apport ?")) {
      try {
        await deleteFinancement.mutateAsync({ id });
        toast({ title: "Financement supprimé" });
        queryClient.invalidateQueries({ queryKey: getListFinancementsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      } catch (e) {
        toast({ title: "Erreur", variant: "destructive" });
      }
    }
  };

  const totalInvesti = financements?.reduce((acc, curr) => acc + curr.montant, 0) || 0;

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Fonds Investis</h1>
          <p className="text-muted-foreground mt-1">Suivi des apports financiers de la famille</p>
        </div>
        {!isReadOnly && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              form.reset();
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvel apport
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier l'apport" : "Ajouter un apport"}</DialogTitle>
                <CardDescription>Saisissez les détails du financement.</CardDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du membre (ex: Papa, Maman, Murielle)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="montant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createFinancement.isPending || updateFinancement.isPending}>
                    {editingId ? "Mettre à jour" : "Enregistrer"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Membre</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              {!isReadOnly && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {financements?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isReadOnly ? 3 : 4} className="text-center py-8 text-muted-foreground">
                  Aucun financement enregistré.
                  <br />
                  <span className="text-xs">Ex: Papa 600 000, Maman 1 500 000, Murielle 1 200 000, Jeriel 1 800 000</span>
                </TableCell>
              </TableRow>
            ) : (
              financements?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{item.nom}</TableCell>
                  <TableCell className="text-right font-medium">{formatFCFA(item.montant)}</TableCell>
                  {!isReadOnly && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              <TableCell colSpan={2} className="font-bold text-lg">Total investi</TableCell>
              <TableCell className="text-right font-bold text-lg text-primary">{formatFCFA(totalInvesti)}</TableCell>
              {!isReadOnly && <TableCell></TableCell>}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
