import { useState } from "react";
import { Link } from "wouter";
import { 
  useListBandes, 
  useCreateBande, 
  useDeleteBande, 
  useGetMe,
  getListBandesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatFCFA } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowRight, Bird } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CreateBandeBodyStatut } from "@workspace/api-client-react";

const bandeSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  sujetsDepart: z.coerce.number().min(1, "Il faut au moins 1 sujet"),
  statut: z.enum([CreateBandeBodyStatut.active, CreateBandeBodyStatut.terminee]).default(CreateBandeBodyStatut.active),
});

export default function Bandes() {
  const { data: bandes, isLoading } = useListBandes();
  const { data: user } = useGetMe();
  const createBande = useCreateBande();
  const deleteBande = useDeleteBande();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isReadOnly = user?.role === "investisseur";

  const form = useForm<z.infer<typeof bandeSchema>>({
    resolver: zodResolver(bandeSchema),
    defaultValues: {
      nom: "",
      sujetsDepart: 1000,
      statut: CreateBandeBodyStatut.active,
    },
  });

  const onSubmit = async (values: z.infer<typeof bandeSchema>) => {
    try {
      await createBande.mutateAsync({ data: values });
      toast({ title: "Bande créée" });
      queryClient.invalidateQueries({ queryKey: getListBandesQueryKey() });
      setIsDialogOpen(false);
      form.reset();
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer cette bande ?")) {
      try {
        await deleteBande.mutateAsync({ id });
        toast({ title: "Bande supprimée" });
        queryClient.invalidateQueries({ queryKey: getListBandesQueryKey() });
      } catch (e) {
        toast({ title: "Erreur", variant: "destructive" });
      }
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Bandes de Poulets</h1>
          <p className="text-muted-foreground mt-1">Gestion des cycles de production</p>
        </div>
        {!isReadOnly && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) form.reset();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle bande
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une bande</DialogTitle>
                <DialogDescription>Initialisez un nouveau lot de production.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la bande (ex: Bande A1)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sujetsDepart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de sujets au départ</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut initial</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CreateBandeBodyStatut.active}>Active</SelectItem>
                            <SelectItem value={CreateBandeBodyStatut.terminee}>Terminée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createBande.isPending}>
                    Créer
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bandes?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <Bird className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucune bande enregistrée.</p>
          </div>
        ) : (
          bandes?.map(bande => (
            <Link key={bande.id} href={`/bandes/${bande.id}`} className="block group">
              <Card className={`h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer ${bande.statut === 'terminee' ? 'opacity-80 bg-muted/30' : ''}`}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">
                      {bande.nom}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      N° {bande.numero} • Créé le {format(new Date(bande.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bande.statut === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {bande.statut === 'active' ? 'Active' : 'Terminée'}
                  </span>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sujets départ:</span>
                    <span className="font-medium">{bande.sujetsDepart}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Décès:</span>
                    <span className="font-medium text-destructive">{bande.nombreDeces}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex justify-between items-center bg-muted/10 rounded-b-xl">
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    Voir détails <ArrowRight className="h-3 w-3" />
                  </span>
                  {!isReadOnly && user?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                      onClick={(e) => handleDelete(e, bande.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}