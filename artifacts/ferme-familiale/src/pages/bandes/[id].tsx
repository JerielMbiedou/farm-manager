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
  useGetBandeMortalite,
  useCreateBandeMortalite,
  useDeleteBandeMortalite,
  useGetBandePesees,
  useCreateBandePesee,
  useDeleteBandePesee,
  useGetBandeConsommation,
  useCreateBandeConsommation,
  useDeleteBandeConsommation,
  useGetBandeVaccinations,
  useCreateBandeVaccination,
  useUpdateBandeVaccination,
  useGetMe,
  getGetBandeQueryKey,
  getListBandeDepensesQueryKey,
  getListBandeVentesQueryKey,
  getGetBandeChargesFixeQueryKey,
  getListBandeDepensesVenteQueryKey,
  getGetBandeMortaliteQueryKey,
  getGetBandePeseesQueryKey,
  getGetBandeConsommationQueryKey,
  getGetBandeVaccinationsQueryKey,
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowLeft, Receipt, ShoppingCart, Info, CheckSquare, Skull, Scale, Wheat, Syringe, Check, Download } from "lucide-react";
import { Link } from "wouter";
import { BandeDetail } from "@workspace/api-client-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { CreateBandeDepenseBodyCategorie } from "@workspace/api-client-react";
import { exportBandePDF, exportBandeExcel } from "@/lib/export";

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

const mortaliteSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  ageJours: z.coerce.number().min(1, "L'âge est requis"),
  decesJour: z.coerce.number().min(0, "Le nombre de décès est requis"),
});

const peseeSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  ageJours: z.coerce.number().min(1, "L'âge est requis"),
  poidsMoyenG: z.coerce.number().min(0, "Le poids est requis"),
  objectifPoidsG: z.coerce.number().optional(),
});

const consommationSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  quantiteKg: z.coerce.number().min(0, "La quantité est requise"),
});

const vaccinSchema = z.object({
  jourPrevu: z.coerce.number().min(0, "Le jour est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
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
  const { data: mortaliteData } = useGetBandeMortalite(bandeId);
  const { data: peseesData } = useGetBandePesees(bandeId);
  const { data: consommationData } = useGetBandeConsommation(bandeId);
  const { data: vaccinationsData } = useGetBandeVaccinations(bandeId);

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
  const createMortalite = useCreateBandeMortalite();
  const deleteMortalite = useDeleteBandeMortalite();
  const createPesee = useCreateBandePesee();
  const deletePesee = useDeleteBandePesee();
  const createConsommation = useCreateBandeConsommation();
  const deleteConsommation = useDeleteBandeConsommation();
  const createVaccination = useCreateBandeVaccination();
  const updateVaccination = useUpdateBandeVaccination();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("resume");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogType, setDialogType] = useState<string>("");

  const isReadOnly = user?.role === "investisseur" || user?.role === "lecteur";

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
  const mortaliteForm = useForm<z.infer<typeof mortaliteSchema>>({
    resolver: zodResolver(mortaliteSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], ageJours: 1, decesJour: 0 },
  });
  const peseeForm = useForm<z.infer<typeof peseeSchema>>({
    resolver: zodResolver(peseeSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], ageJours: 1, poidsMoyenG: 0 },
  });
  const consommationForm = useForm<z.infer<typeof consommationSchema>>({
    resolver: zodResolver(consommationSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], quantiteKg: 0 },
  });
  const vaccinForm = useForm<z.infer<typeof vaccinSchema>>({
    resolver: zodResolver(vaccinSchema),
    defaultValues: { jourPrevu: 1, nom: "", description: "" },
  });

  const [loyerInitialized, setLoyerInitialized] = useState(false);
  if (chargesFixes && !loyerInitialized) {
    chargesFixesForm.reset({ loyer: chargesFixes.loyer });
    setLoyerInitialized(true);
  }

  const resetForms = () => {
    depenseForm.reset({ designation: "", categorie: CreateBandeDepenseBodyCategorie.aliments, quantite: 1, prixUnitaire: 0 });
    venteForm.reset({ date: new Date().toISOString().split("T")[0], quantiteVendue: 1, prixUnitaire: 0 });
    depenseVenteForm.reset({ designation: "", montant: 0 });
    mortaliteForm.reset({ date: new Date().toISOString().split("T")[0], ageJours: 1, decesJour: 0 });
    peseeForm.reset({ date: new Date().toISOString().split("T")[0], ageJours: 1, poidsMoyenG: 0 });
    consommationForm.reset({ date: new Date().toISOString().split("T")[0], quantiteKg: 0 });
    vaccinForm.reset({ jourPrevu: 1, nom: "", description: "" });
    setEditingId(null);
    setDialogType("");
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
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
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
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
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
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const onChargesFixesSubmit = async (values: z.infer<typeof chargesFixesSchema>) => {
    try {
      await updateChargesFixes.mutateAsync({ id: bandeId, data: values });
      queryClient.invalidateQueries({ queryKey: getGetBandeChargesFixeQueryKey(bandeId) });
      invalidateBandeData();
      setLoyerInitialized(false);
      toast({ title: "Charges fixes mises à jour" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const onMortaliteSubmit = async (values: z.infer<typeof mortaliteSchema>) => {
    try {
      await createMortalite.mutateAsync({ id: bandeId, data: values });
      queryClient.invalidateQueries({ queryKey: getGetBandeMortaliteQueryKey(bandeId) });
      invalidateBandeData();
      toast({ title: "Mortalité enregistrée" });
      setIsDialogOpen(false);
      resetForms();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const onPeseeSubmit = async (values: z.infer<typeof peseeSchema>) => {
    try {
      await createPesee.mutateAsync({ id: bandeId, data: values });
      queryClient.invalidateQueries({ queryKey: getGetBandePeseesQueryKey(bandeId) });
      toast({ title: "Pesée enregistrée" });
      setIsDialogOpen(false);
      resetForms();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const onConsommationSubmit = async (values: z.infer<typeof consommationSchema>) => {
    try {
      await createConsommation.mutateAsync({ id: bandeId, data: values });
      queryClient.invalidateQueries({ queryKey: getGetBandeConsommationQueryKey(bandeId) });
      toast({ title: "Consommation enregistrée" });
      setIsDialogOpen(false);
      resetForms();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const onVaccinSubmit = async (values: z.infer<typeof vaccinSchema>) => {
    try {
      await createVaccination.mutateAsync({ id: bandeId, data: values });
      queryClient.invalidateQueries({ queryKey: getGetBandeVaccinationsQueryKey(bandeId) });
      toast({ title: "Vaccin ajouté" });
      setIsDialogOpen(false);
      resetForms();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleMarkVaccinDone = async (vaccId: number) => {
    try {
      await updateVaccination.mutateAsync({ id: bandeId, vaccId, data: { fait: "oui", dateFait: new Date().toISOString().split("T")[0] } });
      queryClient.invalidateQueries({ queryKey: getGetBandeVaccinationsQueryKey(bandeId) });
      toast({ title: "Vaccin marqué comme fait" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleEdit = (item: any, type: 'depense' | 'vente' | 'depenseVente') => {
    setEditingId(item.id);
    if (type === 'depense') {
      depenseForm.reset({ designation: item.designation, categorie: item.categorie as CreateBandeDepenseBodyCategorie, quantite: item.quantite, prixUnitaire: item.prixUnitaire });
    } else if (type === 'vente') {
      venteForm.reset({ date: new Date(item.date).toISOString().split("T")[0], quantiteVendue: item.quantiteVendue, prixUnitaire: item.prixUnitaire });
    } else if (type === 'depenseVente') {
      depenseVenteForm.reset({ designation: item.designation, montant: item.montant });
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
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  if (isLoadingBande) return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Chargement de la bande...</div>;
  if (!bande) return <div>Bande introuvable.</div>;

  const detail = bande as BandeDetail;
  const mortaliteItems = (mortaliteData || []) as Array<Record<string, unknown>>;
  const peseesItems = (peseesData || []) as Array<Record<string, unknown>>;
  const consResp = (consommationData || {}) as Record<string, unknown>;
  const consEntries = (consResp.entries || []) as Array<Record<string, unknown>>;
  const vaccinItems = (vaccinationsData || []) as Array<Record<string, unknown>>;

  const openDialog = (type: string) => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bandes">
          <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">{detail.nom}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${detail.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {detail.statut === 'active' ? 'Active' : 'Terminée'}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            N° {detail.numero} | Départ : {detail.sujetsDepart} sujets | Restants : {detail.sujetsRestants} sujets
          </p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForms(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "mortalite" && "Ajouter une entrée de mortalité"}
              {dialogType === "pesee" && "Ajouter une pesée"}
              {dialogType === "consommation" && "Ajouter consommation aliment"}
              {dialogType === "vaccin" && "Ajouter un vaccin"}
              {dialogType === "depense" && (editingId ? "Modifier la dépense" : "Ajouter une dépense")}
              {dialogType === "vente" && (editingId ? "Modifier la vente" : "Enregistrer une vente")}
              {dialogType === "depenseVente" && (editingId ? "Modifier le frais" : "Ajouter un frais de vente")}
            </DialogTitle>
          </DialogHeader>

          {dialogType === "mortalite" && (
            <Form {...mortaliteForm}>
              <form onSubmit={mortaliteForm.handleSubmit(onMortaliteSubmit)} className="space-y-4">
                <FormField control={mortaliteForm.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={mortaliteForm.control} name="ageJours" render={({ field }) => (
                  <FormItem><FormLabel>Âge (jours)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={mortaliteForm.control} name="decesJour" render={({ field }) => (
                  <FormItem><FormLabel>Décès ce jour</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}

          {dialogType === "pesee" && (
            <Form {...peseeForm}>
              <form onSubmit={peseeForm.handleSubmit(onPeseeSubmit)} className="space-y-4">
                <FormField control={peseeForm.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={peseeForm.control} name="ageJours" render={({ field }) => (
                  <FormItem><FormLabel>Âge (jours)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={peseeForm.control} name="poidsMoyenG" render={({ field }) => (
                  <FormItem><FormLabel>Poids moyen (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={peseeForm.control} name="objectifPoidsG" render={({ field }) => (
                  <FormItem><FormLabel>Objectif poids (g) - optionnel</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}

          {dialogType === "consommation" && (
            <Form {...consommationForm}>
              <form onSubmit={consommationForm.handleSubmit(onConsommationSubmit)} className="space-y-4">
                <FormField control={consommationForm.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={consommationForm.control} name="quantiteKg" render={({ field }) => (
                  <FormItem><FormLabel>Quantité aliment (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}

          {dialogType === "vaccin" && (
            <Form {...vaccinForm}>
              <form onSubmit={vaccinForm.handleSubmit(onVaccinSubmit)} className="space-y-4">
                <FormField control={vaccinForm.control} name="jourPrevu" render={({ field }) => (
                  <FormItem><FormLabel>Jour prévu (J+)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={vaccinForm.control} name="nom" render={({ field }) => (
                  <FormItem><FormLabel>Nom du vaccin</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={vaccinForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description (optionnel)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}

          {dialogType === "depense" && (
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
                  <FormItem><FormLabel>Désignation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={depenseForm.control} name="quantite" render={({ field }) => (
                    <FormItem><FormLabel>Quantité</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={depenseForm.control} name="prixUnitaire" render={({ field }) => (
                    <FormItem><FormLabel>Prix U. (FCFA)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}

          {dialogType === "vente" && (
            <Form {...venteForm}>
              <form onSubmit={venteForm.handleSubmit(onVenteSubmit)} className="space-y-4">
                <FormField control={venteForm.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={venteForm.control} name="quantiteVendue" render={({ field }) => (
                    <FormItem><FormLabel>Quantité vendue</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={venteForm.control} name="prixUnitaire" render={({ field }) => (
                    <FormItem><FormLabel>Prix unitaire (FCFA)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}

          {dialogType === "depenseVente" && (
            <Form {...depenseVenteForm}>
              <form onSubmit={depenseVenteForm.handleSubmit(onDepenseVenteSubmit)} className="space-y-4">
                <FormField control={depenseVenteForm.control} name="designation" render={({ field }) => (
                  <FormItem><FormLabel>Désignation</FormLabel><FormControl><Input placeholder="ex: Ticket, Sanitaire..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={depenseVenteForm.control} name="montant" render={({ field }) => (
                  <FormItem><FormLabel>Montant (FCFA)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap w-full bg-muted/50 p-1 mb-6 h-auto gap-1">
          <TabsTrigger value="resume" className="flex gap-1 text-xs sm:text-sm"><Info className="h-4 w-4" /><span className="hidden sm:inline">Résumé</span></TabsTrigger>
          <TabsTrigger value="depenses" className="flex gap-1 text-xs sm:text-sm"><Receipt className="h-4 w-4" /><span className="hidden sm:inline">Dépenses</span></TabsTrigger>
          <TabsTrigger value="ventes" className="flex gap-1 text-xs sm:text-sm"><ShoppingCart className="h-4 w-4" /><span className="hidden sm:inline">Ventes</span></TabsTrigger>
          <TabsTrigger value="mortalite" className="flex gap-1 text-xs sm:text-sm"><Skull className="h-4 w-4" /><span className="hidden sm:inline">Mortalité</span></TabsTrigger>
          <TabsTrigger value="pesees" className="flex gap-1 text-xs sm:text-sm"><Scale className="h-4 w-4" /><span className="hidden sm:inline">Pesées & IC</span></TabsTrigger>
          <TabsTrigger value="vaccinations" className="flex gap-1 text-xs sm:text-sm"><Syringe className="h-4 w-4" /><span className="hidden sm:inline">Vaccins</span></TabsTrigger>
          <TabsTrigger value="charges" className="flex gap-1 text-xs sm:text-sm"><CheckSquare className="h-4 w-4" /><span className="hidden sm:inline">Charges</span></TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportBandePDF(detail, depenses || [], ventes || [], chargesFixes, mortaliteItems, peseesItems, consResp)}>
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportBandeExcel(detail, depenses || [], ventes || [], chargesFixes)}>
              <Download className="h-4 w-4" /> Excel
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sujets restants</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{detail.sujetsRestants}</div>
                <p className="text-xs text-muted-foreground mt-1">{detail.nombreDeces} décès</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-t-4 border-t-destructive">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Coût de production</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatFCFA(detail.totalDepenses)}</div>
                <p className="text-xs text-muted-foreground mt-1">Coût / sujet : {formatFCFA(detail.coutParSujet)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-t-4 border-t-sidebar-primary">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Recettes brutes</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-foreground">{formatFCFA(detail.totalRecettes)}</div></CardContent>
            </Card>
            <Card className={`shadow-sm border-t-4 ${detail.beneficeNet >= 0 ? 'border-t-green-500' : 'border-t-red-500'}`}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Bénéfice net</CardTitle></CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${detail.beneficeNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFCFA(detail.beneficeNet)}</div>
                <p className="text-xs text-muted-foreground mt-1">Sans charges : {formatFCFA(detail.beneficeNetSansCharges)}</p>
              </CardContent>
            </Card>
          </div>

          {(() => {
            const catTotals: Record<string, number> = {};
            (depenses || []).forEach((d: any) => {
              const cat = d.categorie?.replace('_', ' ') || 'Autre';
              catTotals[cat] = (catTotals[cat] || 0) + (d.montant || 0);
            });
            if (detail.chargesFixesTotal > 0) catTotals["Charges fixes"] = detail.chargesFixesTotal;
            const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));
            const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];
            if (pieData.length === 0) return null;
            return (
              <Card>
                <CardHeader><CardTitle className="text-xl font-serif">Répartition des coûts</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatFCFA(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        <TabsContent value="depenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-serif">Dépenses de Production</CardTitle>
              {!isReadOnly && <Button size="sm" className="gap-2" onClick={() => { setDialogType("depense"); setIsDialogOpen(true); }}><Plus className="w-4 h-4" /> Ajouter</Button>}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Catégorie</TableHead><TableHead>Désignation</TableHead>
                      <TableHead className="text-right">Qté</TableHead><TableHead className="text-right">Prix U.</TableHead>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDialogType("depense"); handleEdit(item, 'depense'); }}><Pencil className="h-4 w-4" /></Button>
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
              {!isReadOnly && <Button size="sm" className="gap-2" onClick={() => { setDialogType("vente"); setIsDialogOpen(true); }}><Plus className="w-4 h-4" /> Vendre</Button>}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Date</TableHead><TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead><TableHead className="text-right">Montant</TableHead>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDialogType("vente"); handleEdit(item, 'vente'); }}><Pencil className="h-4 w-4" /></Button>
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
              <CardTitle className="text-xl font-serif">Frais de Vente</CardTitle>
              {!isReadOnly && <Button size="sm" variant="outline" className="gap-2" onClick={() => { setDialogType("depenseVente"); setIsDialogOpen(true); }}><Plus className="w-4 h-4" /> Ajouter frais</Button>}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/30"><TableHead>Désignation</TableHead><TableHead className="text-right">Montant</TableHead>{!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}</TableRow></TableHeader>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDialogType("depenseVente"); handleEdit(item, 'depenseVente'); }}><Pencil className="h-4 w-4" /></Button>
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

        <TabsContent value="mortalite" className="space-y-6">
          {mortaliteItems.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-xl font-serif">Courbe de mortalité</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mortaliteItems.map((m: any) => ({ jour: `J${m.ageJours}`, deces: m.decesJour, cumules: m.decesCumules, taux: m.tauxMortalite }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="deces" name="Décès / jour" fill="#ef4444" />
                    <Line yAxisId="right" type="monotone" dataKey="taux" name="Taux cumulé %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-serif flex items-center gap-2"><Skull className="h-5 w-5" /> Suivi de la mortalité</CardTitle>
              {!isReadOnly && <Button size="sm" className="gap-2" onClick={() => openDialog("mortalite")}><Plus className="w-4 h-4" /> Ajouter</Button>}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Date</TableHead><TableHead className="text-right">Jour</TableHead>
                      <TableHead className="text-right">Décès</TableHead><TableHead className="text-right">Cumulés</TableHead>
                      <TableHead className="text-right">Taux %</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-16"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mortaliteItems.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune donnée de mortalité</TableCell></TableRow>
                    ) : (
                      mortaliteItems.map((m) => (
                        <TableRow key={m.id as number} className={m.alerteRouge ? "bg-red-50" : ""}>
                          <TableCell>{m.date as string}</TableCell>
                          <TableCell className="text-right">J{m.ageJours as number}</TableCell>
                          <TableCell className="text-right font-medium">{m.decesJour as number}</TableCell>
                          <TableCell className="text-right">{m.decesCumules as number}</TableCell>
                          <TableCell className={`text-right font-medium ${(m.tauxMortalite as number) > 5 ? "text-red-600" : ""}`}>
                            {m.tauxMortalite as number}%
                            {m.alerteRouge && <span className="ml-1 text-xs text-red-600">ALERTE</span>}
                          </TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                                if (confirm("Supprimer cette entrée ?")) {
                                  try {
                                    await deleteMortalite.mutateAsync({ id: bandeId, mortaliteId: m.id as number });
                                    queryClient.invalidateQueries({ queryKey: getGetBandeMortaliteQueryKey(bandeId) });
                                    invalidateBandeData();
                                  } catch { toast({ title: "Erreur de suppression", variant: "destructive" }); }
                                }
                              }}><Trash2 className="h-4 w-4" /></Button>
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

        <TabsContent value="pesees" className="space-y-6">
          {peseesItems.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-xl font-serif">Courbe de croissance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={peseesItems.map((p: any) => ({ jour: `J${p.ageJours}`, poids: p.poidsMoyenG, objectif: p.objectifPoidsG || null }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis unit="g" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="poids" name="Poids moyen (g)" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="objectif" name="Objectif (g)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-serif flex items-center gap-2"><Scale className="h-5 w-5" /> Pesées</CardTitle>
                {!isReadOnly && <Button size="sm" className="gap-2" onClick={() => openDialog("pesee")}><Plus className="w-4 h-4" /> Ajouter</Button>}
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Date</TableHead><TableHead className="text-right">Jour</TableHead>
                        <TableHead className="text-right">Poids (g)</TableHead><TableHead className="text-right">Objectif</TableHead>
                        <TableHead className="text-right">Écart</TableHead>
                        {!isReadOnly && <TableHead className="text-right w-16"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {peseesItems.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune pesée enregistrée</TableCell></TableRow>
                      ) : (
                        peseesItems.map((p) => (
                          <TableRow key={p.id as number} className={p.alertePoids ? "bg-orange-50" : ""}>
                            <TableCell>{p.date as string}</TableCell>
                            <TableCell className="text-right">J{p.ageJours as number}</TableCell>
                            <TableCell className="text-right font-medium">{p.poidsMoyenG as number}g</TableCell>
                            <TableCell className="text-right text-muted-foreground">{p.objectifPoidsG ? `${p.objectifPoidsG}g` : "-"}</TableCell>
                            <TableCell className={`text-right font-medium ${p.ecart && (p.ecart as number) < 0 ? "text-orange-600" : "text-green-600"}`}>
                              {p.ecart != null ? `${(p.ecart as number) > 0 ? "+" : ""}${p.ecart}g` : "-"}
                            </TableCell>
                            {!isReadOnly && (
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                                  if (confirm("Supprimer cette pesée ?")) {
                                    try {
                                      await deletePesee.mutateAsync({ id: bandeId, peseeId: p.id as number });
                                      queryClient.invalidateQueries({ queryKey: getGetBandePeseesQueryKey(bandeId) });
                                    } catch { toast({ title: "Erreur de suppression", variant: "destructive" }); }
                                  }
                                }}><Trash2 className="h-4 w-4" /></Button>
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

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-serif flex items-center gap-2"><Wheat className="h-5 w-5" /> Consommation aliment & IC</CardTitle>
                  {!isReadOnly && <Button size="sm" className="gap-2" onClick={() => openDialog("consommation")}><Plus className="w-4 h-4" /> Ajouter</Button>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <span className="text-muted-foreground text-xs block">Total aliment</span>
                      <span className="font-bold text-lg">{consResp.totalAlimentKg as number || 0} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">IC</span>
                      <span className={`font-bold text-lg ${
                        consResp.ic ? ((consResp.ic as number) <= 1.8 ? "text-green-700" : (consResp.ic as number) <= 2.2 ? "text-orange-600" : "text-red-600") : ""
                      }`}>
                        {consResp.ic ? (consResp.ic as number).toFixed(2) : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Statut IC</span>
                      <span className={`font-bold text-sm px-2 py-0.5 rounded ${
                        consResp.icStatus === "bon" ? "bg-green-100 text-green-800" :
                        consResp.icStatus === "moyen" ? "bg-orange-100 text-orange-800" :
                        consResp.icStatus === "mauvais" ? "bg-red-100 text-red-800" : "text-muted-foreground"
                      }`}>
                        {consResp.icStatus ? (consResp.icStatus as string).toUpperCase() : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Date</TableHead><TableHead className="text-right">Quantité (kg)</TableHead>
                          {!isReadOnly && <TableHead className="text-right w-16"></TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consEntries.length === 0 ? (
                          <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Aucune consommation</TableCell></TableRow>
                        ) : (
                          consEntries.map((c) => (
                            <TableRow key={c.id as number}>
                              <TableCell>{c.date as string}</TableCell>
                              <TableCell className="text-right font-medium">{c.quantiteKg as number} kg</TableCell>
                              {!isReadOnly && (
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                                    if (confirm("Supprimer ?")) {
                                      try {
                                        await deleteConsommation.mutateAsync({ id: bandeId, consId: c.id as number });
                                        queryClient.invalidateQueries({ queryKey: getGetBandeConsommationQueryKey(bandeId) });
                                      } catch { toast({ title: "Erreur de suppression", variant: "destructive" }); }
                                    }
                                  }}><Trash2 className="h-4 w-4" /></Button>
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vaccinations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-serif flex items-center gap-2"><Syringe className="h-5 w-5" /> Calendrier de vaccination</CardTitle>
              {!isReadOnly && <Button size="sm" className="gap-2" onClick={() => openDialog("vaccin")}><Plus className="w-4 h-4" /> Ajouter vaccin</Button>}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Jour</TableHead><TableHead>Vaccin</TableHead>
                      <TableHead>Date prévue</TableHead><TableHead>Statut</TableHead>
                      <TableHead>Date fait</TableHead>
                      {!isReadOnly && <TableHead className="text-right w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vaccinItems.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune vaccination programmée</TableCell></TableRow>
                    ) : (
                      vaccinItems.map((v) => (
                        <TableRow key={v.id as number} className={v.enRetard && v.fait !== "oui" ? "bg-red-50" : v.fait === "oui" ? "bg-green-50/50" : ""}>
                          <TableCell className="font-medium">J{v.jourPrevu as number}</TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">{v.nom as string}</span>
                              {v.description && <span className="block text-xs text-muted-foreground">{v.description as string}</span>}
                            </div>
                          </TableCell>
                          <TableCell>{v.datePrevue as string}</TableCell>
                          <TableCell>
                            {v.fait === "oui" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800"><Check className="h-3 w-3" /> Fait</span>
                            ) : v.enRetard ? (
                              <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">EN RETARD</span>
                            ) : (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">En attente</span>
                            )}
                          </TableCell>
                          <TableCell>{v.dateFait ? (v.dateFait as string) : "-"}</TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              {v.fait !== "oui" && (
                                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleMarkVaccinDone(v.id as number)}>
                                  <Check className="h-3 w-3" /> Fait
                                </Button>
                              )}
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
              <CardHeader><CardTitle className="text-xl font-serif">Loyer de l'exploitation</CardTitle></CardHeader>
              <CardContent>
                {isReadOnly ? (
                  <div className="text-2xl font-bold">{formatFCFA(chargesFixes?.loyer || 0)}</div>
                ) : (
                  <Form {...chargesFixesForm}>
                    <form onSubmit={chargesFixesForm.handleSubmit(onChargesFixesSubmit)} className="space-y-4">
                      <FormField control={chargesFixesForm.control} name="loyer" render={({ field }) => (
                        <FormItem><FormLabel>Montant du loyer pour cette bande (FCFA)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={updateChargesFixes.isPending}>Mettre à jour le loyer</Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader><CardTitle className="text-xl font-serif">Dépréciation & Imprévus</CardTitle></CardHeader>
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
