import { useState } from "react";
import { useParams } from "wouter";
import { 
  useGetBande,
  useListBandeDepenses,
  useCreateBandeDepense,
  useUpdateBandeDepense,
  useDeleteBandeDepense,
  useListBandeVentes,
  useCreateBandeVente,
  useUpdateBandeVente,
  useDeleteBandeVente,
  useGetBandeChargesFixe,
  useUpdateBandeChargesFixe,
  useListBandeDepensesVente,
  useCreateBandeDepenseVente,
  useUpdateBandeDepenseVente,
  useDeleteBandeDepenseVente,
  useGetMe,
  getGetBandeQueryKey,
  getListBandeDepensesQueryKey,
  getListBandeVentesQueryKey,
  getGetBandeChargesFixeQueryKey,
  getListBandeDepensesVenteQueryKey
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowLeft, Receipt, ShoppingCart, Info, CheckSquare } from "lucide-react";
import { Link } from "wouter";
import { BandeDetail } from "@workspace/api-client-react";
import { CreateBandeDepenseBodyCategorie } from "@workspace/api-client-react";

const depenseSchema = z.object({
  designation: z.string().min(1, "La désignation est requise"),
  categorie: z.nativeEnum(CreateBandeDepenseBodyCategorie),
  quantite: z.coerce.number().min(0, "La quantité doit être positive"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
});

const venteSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  quantiteVendue: z.coerce.number().min(1, "La quantité doit être supérieure à 0"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
});

const depenseVenteSchema = z.object({
  designation: z.string().min(1, "La désignation est requise"),
  montant: z.coerce.number().min(0, "Le montant doit être positif"),
});

const chargesFixesSchema = z.object({
  loyer: z.coerce.number().min(0, "Le loyer doit être positif"),
});

export default function BandeDetailView() {
  const params = useParams<{ id: string }>();
  const bandeId = Number(params.id);

  const { data: user } = useGetMe();
  const { data: bande, isLoading: isLoadingBande } = useGetBande(bandeId, {
    query: { enabled: !!bandeId, queryKey: getGetBandeQueryKey(bandeId) }
  });
  
  const { data: depenses } = useListBandeDepenses(bandeId);
  const { data: ventes } = useListBandeVentes(bandeId);
  const { data: chargesFixes } = useGetBandeChargesFixe(bandeId);
  const { data: depensesVente } = useListBandeDepensesVente(bandeId);

  const createDepense = useCreateBandeDepense();
  const updateDepense = useUpdateBandeDepense();
  const deleteDepense = useDeleteBandeDepense();

  const createVente = useCreateBandeVente();
  const updateVente = useUpdateBandeVente();
  const deleteVente = useDeleteBandeVente();

  const updateChargesFixes = useUpdateBandeChargesFixe();

  const createDepenseVente = useCreateBandeDepenseVente();
  const updateDepenseVente = useUpdateBandeDepenseVente();
  const deleteDepenseVente = useDeleteBandeDepenseVente();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("resume");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const isReadOnly = user?.role === "investisseur";

  // Forms
  const depenseForm = useForm<z.infer<typeof depenseSchema>>({
    resolver: zodResolver(depenseSchema),
    defaultValues: { designation: "", categorie: CreateBandeDepenseBodyCategorie.aliments, quantite: 1, prixUnitaire: 0 },
  });

  const venteForm = useForm<z.infer<typeof venteSchema>>({
    resolver: zodResolver(venteSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], quantiteVendue: 1, prixUnitaire: 0 },
  });

  const depenseVenteForm = useForm<z.infer<typeof depenseVenteSchema>>({
    resolver: zodResolver(depenseVenteSchema),
    defaultValues: { designation: "", montant: 0 },
  });

  const chargesFixesForm = useForm<z.infer<typeof chargesFixesSchema>>({
    resolver: zodResolver(chargesFixesSchema),
    defaultValues: { loyer: 0 },
  });

  // Init charges fixes form
  if (chargesFixes && chargesFixesForm.getValues("loyer") !== chargesFixes.loyer && !editingId) {
    chargesFixesForm.reset({ loyer: chargesFixes.loyer });
  }

  const resetForms = () => {
    depenseForm.reset({ designation: "", categorie: CreateBandeDepenseBodyCategorie.aliments, quantite: 1, prixUnitaire: 0 });
    venteForm.reset({ date: new Date().toISOString().split("T")[0], quantiteVendue: 1, prixUnitaire: 0 });
    depenseVenteForm.reset({ designation: "", montant: 0 });
    setEditingId(null);
  };

  const invalidateBandeData = () => {
    queryClient.invalidateQueries({ queryKey: getGetBandeQueryKey(bandeId) });
  };

  const onDepenseSubmit = async (values: z.infer<typeof depenseSchema>) => {
    try {
      if (editingId) await updateDepense.mutateAsync({ id: editingId, data: { ...values, bandeId } as any });
      else await createDepense.mutateAsync({ data: { ...values, bandeId } as any });
      queryClient.invalidateQueries({ queryKey: getListBandeDepensesQueryKey(bandeId) });
      invalidateBandeData();
      toast({ title: "Dépense enregistrée" });
      setIsDialogOpen(false);
      resetForms();
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const onVenteSubmit = async (values: z.infer<typeof venteSchema>) => {
    try {
      if (editingId) await updateVente.mutateAsync({ id: editingId, data: { ...values, bandeId } as any });
      else await createVente.mutateAsync({ data: { ...values, bandeId } as any });
      queryClient.invalidateQueries({ queryKey: getListBandeVentesQueryKey(bandeId) });
      invalidateBandeData();
      toast({ title: "Vente enregistrée" });
      setIsDialogOpen(false);
      resetForms();
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const onDepenseVenteSubmit = async (values: z.infer<typeof depenseVenteSchema>) => {
    try {
      if (editingId) await updateDepenseVente.mutateAsync({ id: editingId, data: { ...values, bandeId } as any });
      else await createDepenseVente.mutateAsync({ data: { ...values, bandeId } as any });
      queryClient.invalidateQueries({ queryKey: getListBandeDepensesVenteQueryKey(bandeId) });
      invalidateBandeData();
      toast({ title: "Frais de vente enregistré" });
      setIsDialogOpen(false);
      resetForms();
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const onChargesFixesSubmit = async (values: z.infer<typeof chargesFixesSchema>) => {
    try {
      await updateChargesFixes.mutateAsync({ id: bandeId, data: values });
      queryClient.invalidateQueries({ queryKey: getGetBandeChargesFixeQueryKey(bandeId) });
      invalidateBandeData();
      toast({ title: "Charges fixes mises à jour" });
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleEdit = (item: any, type: 'depense' | 'vente' | 'depenseVente') => {
    setEditingId(item.id);
    if (type === 'depense') {
      depenseForm.reset({
        designation: item.designation,
        categorie: item.categorie as CreateBandeDepenseBodyCategorie,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
      });
    } else if (type === 'vente') {
      venteForm.reset({
        date: new Date(item.date).toISOString().split("T")[0],
        quantiteVendue: item.quantiteVendue,
        prixUnitaire: item.prixUnitaire,
      });
    } else if (type === 'depenseVente') {
      depenseVenteForm.reset({
        designation: item.designation,
        montant: item.montant,
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number, type: 'depense' | 'vente' | 'depenseVente') => {
    if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
      if (type === 'depense') {
        await deleteDepense.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListBandeDepensesQueryKey(bandeId) });
      } else if (type === 'vente') {
        await deleteVente.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListBandeVentesQueryKey(bandeId) });
      } else if (type === 'depenseVente') {
        await deleteDepenseVente.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListBandeDepensesVenteQueryKey(bandeId) });
      }
      invalidateBandeData();
      toast({ title: "Élément supprimé" });
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  if (isLoadingBande) return <div>Chargement de la bande...</div>;
  if (!bande) return <div>Bande introuvable.</div>;

  const detail = bande as BandeDetail;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bandes">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">{detail.nom}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${detail.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {detail.statut === 'active' ? 'Active' : 'Terminée'}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            N° {detail.numero} • Départ : {detail.sujetsDepart} sujets • Restants : {detail.sujetsRestants} sujets
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 mb-6">
          <TabsTrigger value="resume" className="flex gap-2"><Info className="h-4 w-4" /> <span className="hidden sm:inline">Résumé</span></TabsTrigger>
          <TabsTrigger value="depenses" className="flex gap-2"><Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Dépenses</span></TabsTrigger>
          <TabsTrigger value="ventes" className="flex gap-2"><ShoppingCart className="h-4 w-4" /> <span className="hidden sm:inline">Ventes & Frais</span></TabsTrigger>
          <TabsTrigger value="charges" className="flex gap-2"><CheckSquare className="h-4 w-4" /> <span className="hidden sm:inline">Charges Fixes</span></TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sujets Restants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{detail.sujetsRestants}</div>
                <p className="text-xs text-muted-foreground mt-1">{detail.nombreDeces} décès</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Coût de Production</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatFCFA(detail.totalDepenses)}</div>
                <p className="text-xs text-muted-foreground mt-1">Coût / sujet : {formatFCFA(detail.coutParSujet)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-sidebar-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recettes Brutes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatFCFA(detail.totalRecettes)}</div>
              </CardContent>
            </Card>

            <Card className={`shadow-sm border-t-4 ${detail.beneficeNet >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bénéfice Net</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${detail.beneficeNet >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {formatFCFA(detail.beneficeNet)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sans charges fixes : {formatFCFA(detail.beneficeNetSansCharges)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="depenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-serif">Dépenses de Production</CardTitle>
              {!isReadOnly && (
                <Dialog open={isDialogOpen && activeTab === "depenses"} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForms();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Modifier la dépense" : "Ajouter une dépense"}</DialogTitle></DialogHeader>
                    <Form {...depenseForm}>
                      <form onSubmit={depenseForm.handleSubmit(onDepenseSubmit)} className="space-y-4">
                        <FormField control={depenseForm.control} name="categorie" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {Object.values(CreateBandeDepenseBodyCategorie).map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={depenseForm.control} name="designation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Désignation</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={depenseForm.control} name="quantite" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantité</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={depenseForm.control} name="prixUnitaire" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix U. (FCFA)</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <Button type="submit" className="w-full">Enregistrer</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Désignation</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">Prix U.</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depenses?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune dépense enregistrée</TableCell></TableRow>
                    ) : (
                      depenses?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="capitalize">{item.categorie.replace('_', ' ')}</TableCell>
                          <TableCell className="font-medium">{item.designation}</TableCell>
                          <TableCell className="text-right">{item.quantite}</TableCell>
                          <TableCell className="text-right">{formatFCFA(item.prixUnitaire)}</TableCell>
                          <TableCell className="text-right font-medium">{formatFCFA(item.montant)}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item, 'depense')}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id, 'depense')}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={4} className="font-bold">Total Dépenses</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatFCFA(detail.totalDepenses)}</TableCell>
                      {!isReadOnly && <TableCell></TableCell>}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ventes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-serif">Ventes de Poulets</CardTitle>
              {!isReadOnly && (
                <Dialog open={isDialogOpen && activeTab === "ventes"} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForms();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Vendre</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Modifier la vente" : "Enregistrer une vente"}</DialogTitle></DialogHeader>
                    <Form {...venteForm}>
                      <form onSubmit={venteForm.handleSubmit(onVenteSubmit)} className="space-y-4">
                        <FormField control={venteForm.control} name="date" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={venteForm.control} name="quantiteVendue" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantité vendue</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={venteForm.control} name="prixUnitaire" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix unitaire (FCFA)</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <Button type="submit" className="w-full">Enregistrer</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventes?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune vente enregistrée</TableCell></TableRow>
                    ) : (
                      ventes?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="text-right">{item.quantiteVendue}</TableCell>
                          <TableCell className="text-right">{formatFCFA(item.prixUnitaire)}</TableCell>
                          <TableCell className="text-right font-medium">{formatFCFA(item.montant)}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item, 'vente')}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id, 'vente')}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-primary/5">
                      <TableCell colSpan={3} className="font-bold">Total Recettes</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatFCFA(detail.totalRecettes)}</TableCell>
                      {!isReadOnly && <TableCell></TableCell>}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-serif">Frais de Vente (Sanitaire, Police, etc.)</CardTitle>
              {!isReadOnly && (
                <Dialog open={isDialogOpen && activeTab === "ventes_frais"} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForms();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("ventes_frais")}><Plus className="w-4 h-4" /> Ajouter frais</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Modifier le frais" : "Ajouter un frais lié à la vente"}</DialogTitle></DialogHeader>
                    <Form {...depenseVenteForm}>
                      <form onSubmit={depenseVenteForm.handleSubmit(onDepenseVenteSubmit)} className="space-y-4">
                        <FormField control={depenseVenteForm.control} name="designation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Désignation</FormLabel>
                            <FormControl><Input placeholder="ex: Ticket, Sanitaire..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={depenseVenteForm.control} name="montant" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant (FCFA)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" className="w-full">Enregistrer</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Désignation</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depensesVente?.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Aucun frais enregistré</TableCell></TableRow>
                    ) : (
                      depensesVente?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.designation}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">{formatFCFA(item.montant)}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setActiveTab("ventes_frais"); handleEdit(item, 'depenseVente'); }}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id, 'depenseVente')}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Loyer de l'exploitation</CardTitle>
              </CardHeader>
              <CardContent>
                {isReadOnly ? (
                  <div className="text-2xl font-bold">{formatFCFA(chargesFixes?.loyer || 0)}</div>
                ) : (
                  <Form {...chargesFixesForm}>
                    <form onSubmit={chargesFixesForm.handleSubmit(onChargesFixesSubmit)} className="space-y-4">
                      <FormField control={chargesFixesForm.control} name="loyer" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant du loyer pour cette bande (FCFA)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={updateChargesFixes.isPending}>
                        Mettre à jour le loyer
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Dépréciation & Imprévus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Valeur perdue matériel (estimée)</span>
                  <span className="font-medium">{formatFCFA(chargesFixes?.valeurPerdueMateriel || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Imprévus (5%)</span>
                  <span className="font-medium">{formatFCFA(chargesFixes?.imprévus || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-4">
                  <span className="font-bold">Total Charges Fixes</span>
                  <span className="font-bold text-destructive">{formatFCFA(chargesFixes?.total || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
