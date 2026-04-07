import { useState, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Construction, Droplets, Fuel, Wallet, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "materiaux", label: "Materiaux" },
  { value: "main_oeuvre", label: "Main d'oeuvre" },
  { value: "transport", label: "Transport" },
  { value: "carburant", label: "Carburant" },
  { value: "divers", label: "Divers" },
] as const;

const categoryColors: Record<string, string> = {
  materiaux: "bg-blue-100 text-blue-800 border-blue-200",
  main_oeuvre: "bg-orange-100 text-orange-800 border-orange-200",
  transport: "bg-purple-100 text-purple-800 border-purple-200",
  carburant: "bg-red-100 text-red-800 border-red-200",
  divers: "bg-gray-100 text-gray-800 border-gray-200",
};

function getCategoryLabel(value: string) {
  return CATEGORIES.find(c => c.value === value)?.label || value;
}

const depenseDetailleeSchema = z.object({
  designation: z.string().min(1, "La designation est requise"),
  quantite: z.coerce.number().min(1, "La quantite doit etre superieure a 0"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire doit etre positif"),
  categorie: z.string().optional(),
});

const sortieCarburantSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  montant: z.coerce.number().min(0, "Le montant doit etre positif"),
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

  const createBatiment = useCreateBatimentItem();
  const updateBatiment = useUpdateBatimentItem();
  const deleteBatiment = useDeleteBatimentItem();

  const createPuits = useCreateDepensesPuitsItem();
  const updatePuits = useUpdateDepensesPuitsItem();
  const deletePuits = useDeleteDepensesPuitsItem();

  const createCarburant = useCreateSortieCarburant();
  const updateCarburant = useUpdateSortieCarburant();
  const deleteCarburant = useDeleteSortieCarburant();

  const [activeTab, setActiveTab] = useState("batiment");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const detailleeForm = useForm<z.infer<typeof depenseDetailleeSchema>>({
    resolver: zodResolver(depenseDetailleeSchema),
    defaultValues: { designation: "", quantite: 1, prixUnitaire: 0, categorie: "materiaux" },
  });

  const carburantForm = useForm<z.infer<typeof sortieCarburantSchema>>({
    resolver: zodResolver(sortieCarburantSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], montant: 0 },
  });

  const resetForms = () => {
    detailleeForm.reset({ designation: "", quantite: 1, prixUnitaire: 0, categorie: "materiaux" });
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
        categorie: item.categorie || "materiaux",
      });
    }
    setIsDialogOpen(true);
  };

  const onDetailleeSubmit = async (values: z.infer<typeof depenseDetailleeSchema>) => {
    try {
      const payload = activeTab === "batiment" 
        ? { designation: values.designation, quantite: values.quantite, prixUnitaire: values.prixUnitaire, categorie: values.categorie as any }
        : { designation: values.designation, quantite: values.quantite, prixUnitaire: values.prixUnitaire };
      
      if (activeTab === "batiment") {
        if (editingId) await updateBatiment.mutateAsync({ id: editingId, data: payload });
        else await createBatiment.mutateAsync({ data: payload });
        queryClient.invalidateQueries({ queryKey: getListBatimentItemsQueryKey() });
      } else if (activeTab === "puits") {
        if (editingId) await updatePuits.mutateAsync({ id: editingId, data: payload });
        else await createPuits.mutateAsync({ data: payload });
        queryClient.invalidateQueries({ queryKey: getListDepensesPuitsItemsQueryKey() });
      }
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      toast({ title: "Enregistrement reussi" });
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
      toast({ title: "Enregistrement reussi" });
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
      toast({ title: "Ligne supprimee" });
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const isLoading = isLoadingSummary || isLoadingBatiment || isLoadingPuits || isLoadingCarburant;

  const filteredBatimentItems = useMemo(() => {
    if (!batimentItems) return [];
    if (!filterCategory) return batimentItems;
    return batimentItems.filter(item => (item as any).categorie === filterCategory);
  }, [batimentItems, filterCategory]);

  const categoryTotals = useMemo(() => {
    if (!batimentItems) return {};
    const totals: Record<string, { count: number; total: number }> = {};
    for (const item of batimentItems) {
      const cat = (item as any).categorie || "materiaux";
      if (!totals[cat]) totals[cat] = { count: 0, total: 0 };
      totals[cat].count++;
      totals[cat].total += item.prixTotal;
    }
    return totals;
  }, [batimentItems]);

  if (isLoading) return <div>Chargement...</div>;

  const totalBatiment = batimentItems?.reduce((sum, item) => sum + item.prixTotal, 0) || 0;
  const totalPuits = puitsItems?.reduce((sum, item) => sum + item.prixTotal, 0) || 0;
  const totalCarburant = carburantItems?.reduce((sum, item) => sum + item.montant, 0) || 0;
  const filteredTotal = filteredBatimentItems.reduce((sum, item) => sum + item.prixTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Depenses Construction</h1>
          <p className="text-muted-foreground mt-1">Suivi des decaissements et achats reels</p>
        </div>
        {!isReadOnly && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForms();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle depense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier la depense" : "Ajouter une depense"}</DialogTitle>
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
                        <FormLabel>Designation</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={detailleeForm.control} name="quantite" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantite</FormLabel>
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
                    {activeTab === "batiment" && (
                      <FormField control={detailleeForm.control} name="categorie" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categorie</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "materiaux"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir une categorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Depense</CardTitle>
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

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setFilterCategory(null); }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
          <TabsTrigger value="batiment" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Construction className="h-4 w-4" /> Batiment
          </TabsTrigger>
          <TabsTrigger value="puits" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Droplets className="h-4 w-4" /> Puits & Eau
          </TabsTrigger>
          <TabsTrigger value="carburant" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Fuel className="h-4 w-4" /> Carburant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batiment">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant={filterCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterCategory(null)}
              >
                Tout ({batimentItems?.length || 0})
              </Badge>
              {CATEGORIES.map(cat => {
                const info = categoryTotals[cat.value];
                if (!info) return null;
                return (
                  <Badge
                    key={cat.value}
                    variant={filterCategory === cat.value ? "default" : "outline"}
                    className={`cursor-pointer ${filterCategory !== cat.value ? categoryColors[cat.value] : ""}`}
                    onClick={() => setFilterCategory(filterCategory === cat.value ? null : cat.value)}
                  >
                    {cat.label} ({info.count}) - {formatFCFA(info.total)}
                  </Badge>
                );
              })}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Designation</TableHead>
                        <TableHead>Categorie</TableHead>
                        <TableHead className="text-right">Quantite</TableHead>
                        <TableHead className="text-right">Prix Unitaire</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBatimentItems.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune depense enregistree</TableCell></TableRow>
                      ) : (
                        filteredBatimentItems.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.designation}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={categoryColors[(item as any).categorie || "materiaux"]}>
                                {getCategoryLabel((item as any).categorie || "materiaux")}
                              </Badge>
                            </TableCell>
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
                        <TableCell colSpan={4} className="font-bold">
                          {filterCategory ? `Total ${getCategoryLabel(filterCategory)}` : "Total Batiment"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatFCFA(filterCategory ? filteredTotal : totalBatiment)}
                        </TableCell>
                        {!isReadOnly && <TableCell></TableCell>}
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="puits">
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Quantite</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {puitsItems?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune depense enregistree</TableCell></TableRow>
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
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucune depense enregistree</TableCell></TableRow>
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
