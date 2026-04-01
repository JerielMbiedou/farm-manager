import { useState } from "react";
import { 
  useListBatimentItems, 
  useCreateBatimentItem, 
  useUpdateBatimentItem, 
  useDeleteBatimentItem,
  useListDepensesPuitsItems,
  useCreateDepensesPuitsItem,
  useUpdateDepensesPuitsItem,
  useDeleteDepensesPuitsItem,
  useListSortiesCarburant,
  useCreateSortieCarburant,
  useUpdateSortieCarburant,
  useDeleteSortieCarburant,
  useGetDashboardSummary,
  useGetMe,
  getListBatimentItemsQueryKey,
  getListDepensesPuitsItemsQueryKey,
  getListSortiesCarburantQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatFCFA } from "@/lib/format";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Construction, Droplets, Fuel, Wallet } from "lucide-react";

const depenseDetailleeSchema = z.object({
  designation: z.string().min(1, "La désignation est requise"),
  quantite: z.coerce.number().min(1, "La quantité doit être supérieure à 0"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
});

const sortieCarburantSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  montant: z.coerce.number().min(0, "Le montant doit être positif"),
});

export default function Depenses() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: batimentItems, isLoading: isLoadingBatiment } = useListBatimentItems();
  const { data: puitsItems, isLoading: isLoadingPuits } = useListDepensesPuitsItems();
  const { data: carburantItems, isLoading: isLoadingCarburant } = useListSortiesCarburant();
  const { data: user } = useGetMe();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isReadOnly = user?.role === "investisseur";

  // Mutations
  const createBatiment = useCreateBatimentItem();
  const updateBatiment = useUpdateBatimentItem();
  const deleteBatiment = useDeleteBatimentItem();

  const createPuits = useCreateDepensesPuitsItem();
  const updatePuits = useUpdateDepensesPuitsItem();
  const deletePuits = useDeleteDepensesPuitsItem();

  const createCarburant = useCreateSortieCarburant();
  const updateCarburant = useUpdateSortieCarburant();
  const deleteCarburant = useDeleteSortieCarburant();

  // State
  const [activeTab, setActiveTab] = useState("batiment");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const detailleeForm = useForm<z.infer<typeof depenseDetailleeSchema>>({
    resolver: zodResolver(depenseDetailleeSchema),
    defaultValues: { designation: "", quantite: 1, prixUnitaire: 0 },
  });

  const carburantForm = useForm<z.infer<typeof sortieCarburantSchema>>({
    resolver: zodResolver(sortieCarburantSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], montant: 0 },
  });

  const resetForms = () => {
    detailleeForm.reset({ designation: "", quantite: 1, prixUnitaire: 0 });
    carburantForm.reset({ date: new Date().toISOString().split("T")[0], montant: 0 });
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === "carburant") {
      carburantForm.reset({
        date: new Date(item.date).toISOString().split("T")[0],
        montant: item.montant,
      });
    } else {
      detailleeForm.reset({
        designation: item.designation,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
      });
    }
    setIsDialogOpen(true);
  };

  const onDetailleeSubmit = async (values: z.infer<typeof depenseDetailleeSchema>) => {
    try {
      if (activeTab === "batiment") {
        if (editingId) await updateBatiment.mutateAsync({ id: editingId, data: values });
        else await createBatiment.mutateAsync({ data: values });
        queryClient.invalidateQueries({ queryKey: getListBatimentItemsQueryKey() });
      } else if (activeTab === "puits") {
        if (editingId) await updatePuits.mutateAsync({ id: editingId, data: values });
        else await createPuits.mutateAsync({ data: values });
        queryClient.invalidateQueries({ queryKey: getListDepensesPuitsItemsQueryKey() });
      }
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      toast({ title: "Enregistrement réussi" });
      setIsDialogOpen(false);
      resetForms();
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const onCarburantSubmit = async (values: z.infer<typeof sortieCarburantSchema>) => {
    try {
      if (editingId) await updateCarburant.mutateAsync({ id: editingId, data: values });
      else await createCarburant.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getListSortiesCarburantQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      toast({ title: "Enregistrement réussi" });
      setIsDialogOpen(false);
      resetForms();
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ligne ?")) return;
    try {
      if (activeTab === "batiment") {
        await deleteBatiment.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListBatimentItemsQueryKey() });
      } else if (activeTab === "puits") {
        await deletePuits.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListDepensesPuitsItemsQueryKey() });
      } else if (activeTab === "carburant") {
        await deleteCarburant.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListSortiesCarburantQueryKey() });
      }
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      toast({ title: "Ligne supprimée" });
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const isLoading = isLoadingSummary || isLoadingBatiment || isLoadingPuits || isLoadingCarburant;

  if (isLoading) return <div>Chargement...</div>;

  const totalBatiment = batimentItems?.reduce((sum, item) => sum + item.prixTotal, 0) || 0;
  const totalPuits = puitsItems?.reduce((sum, item) => sum + item.prixTotal, 0) || 0;
  const totalCarburant = carburantItems?.reduce((sum, item) => sum + item.montant, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Dépenses Construction</h1>
          <p className="text-muted-foreground mt-1">Suivi des décaissements et achats réels</p>
        </div>
        {!isReadOnly && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForms();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle dépense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier la dépense" : "Ajouter une dépense"}</DialogTitle>
              </DialogHeader>
              
              {activeTab === "carburant" ? (
                <Form {...carburantForm}>
                  <form onSubmit={carburantForm.handleSubmit(onCarburantSubmit)} className="space-y-4">
                    <FormField control={carburantForm.control} name="date" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={carburantForm.control} name="montant" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Enregistrer</Button>
                  </form>
                </Form>
              ) : (
                <Form {...detailleeForm}>
                  <form onSubmit={detailleeForm.handleSubmit(onDetailleeSubmit)} className="space-y-4">
                    <FormField control={detailleeForm.control} name="designation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Désignation</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={detailleeForm.control} name="quantite" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={detailleeForm.control} name="prixUnitaire" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix unitaire (FCFA)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Enregistrer</Button>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-primary shadow-sm bg-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dépensé</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary?.totalDepenseConstruction || 0)}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-accent shadow-sm bg-accent/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Restant (Devis)</CardTitle>
            <Wallet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatFCFA((summary?.totalDevis || 0) - (summary?.totalDepenseConstruction || 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-secondary shadow-sm bg-secondary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Caisse Actuelle</CardTitle>
            <Wallet className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatFCFA(summary?.caisseDisponible || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
          <TabsTrigger value="batiment" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Construction className="h-4 w-4" /> Bâtiment
          </TabsTrigger>
          <TabsTrigger value="puits" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Droplets className="h-4 w-4" /> Puits & Eau
          </TabsTrigger>
          <TabsTrigger value="carburant" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Fuel className="h-4 w-4" /> Carburant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batiment">
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Désignation</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batimentItems?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune dépense enregistrée</TableCell></TableRow>
                    ) : (
                      batimentItems?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.designation}</TableCell>
                          <TableCell className="text-right">{item.quantite}</TableCell>
                          <TableCell className="text-right">{formatFCFA(item.prixUnitaire)}</TableCell>
                          <TableCell className="text-right font-medium">{formatFCFA(item.prixTotal)}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={3} className="font-bold">Total Bâtiment</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatFCFA(totalBatiment)}</TableCell>
                      {!isReadOnly && <TableCell></TableCell>}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="puits">
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Désignation</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {puitsItems?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune dépense enregistrée</TableCell></TableRow>
                    ) : (
                      puitsItems?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.designation}</TableCell>
                          <TableCell className="text-right">{item.quantite}</TableCell>
                          <TableCell className="text-right">{formatFCFA(item.prixUnitaire)}</TableCell>
                          <TableCell className="text-right font-medium">{formatFCFA(item.prixTotal)}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={3} className="font-bold">Total Puits</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatFCFA(totalPuits)}</TableCell>
                      {!isReadOnly && <TableCell></TableCell>}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carburant">
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carburantItems?.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucune dépense enregistrée</TableCell></TableRow>
                    ) : (
                      carburantItems?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="text-right font-medium">{formatFCFA(item.montant)}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-bold">Total Carburant</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatFCFA(totalCarburant)}</TableCell>
                      {!isReadOnly && <TableCell></TableCell>}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
