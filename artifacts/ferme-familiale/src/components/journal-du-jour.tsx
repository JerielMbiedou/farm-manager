import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { offlineFetch } from "@/lib/offline-fetch";
import { getAgeJours } from "@/lib/utils";

interface JournalDuJourProps {
  bande: {
    id: number;
    nom: string;
    dateDeDepart: string;
    statut: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function formatDateFR(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const numFromInput = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n as number) ? n : undefined;
}, z.number().min(0).optional());

const schema = z.object({
  deces: z.coerce.number().int().min(0),
  alimentKg: numFromInput,
  typeAliment: z.enum(["demarrage", "croissance", "finition"]),
  eauLitres: numFromInput,
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function JournalDuJour({ bande, open, onOpenChange, onSuccess }: JournalDuJourProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayDate = new Date();
  const ageJours = getAgeJours(bande.dateDeDepart, todayDate);
  const typeAlimentDefaut: "demarrage" | "croissance" | "finition" =
    ageJours < 14 ? "demarrage" : ageJours <= 28 ? "croissance" : "finition";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deces: 0,
      alimentKg: undefined,
      typeAliment: typeAlimentDefaut,
      eauLitres: undefined,
      observations: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const base = import.meta.env.BASE_URL || "/";
    const baseUrl = `${base}api/bandes/${bande.id}`;

    const tasks: Promise<{ ok: boolean; queued: boolean }>[] = [];

    tasks.push(
      offlineFetch(`${baseUrl}/mortalite`, {
        method: "POST",
        body: { date: today, ageJours, decesJour: values.deces ?? 0 },
        label: `Mortalité ${bande.nom} J${ageJours}`,
      })
    );

    if (values.alimentKg && values.alimentKg > 0) {
      tasks.push(
        offlineFetch(`${baseUrl}/consommation`, {
          method: "POST",
          body: {
            date: today,
            ageJours,
            quantiteKg: values.alimentKg,
            typeAliment: values.typeAliment,
          },
          label: `Aliment ${bande.nom} J${ageJours}`,
        })
      );
    }

    if (values.eauLitres && values.eauLitres > 0) {
      tasks.push(
        offlineFetch(`${baseUrl}/consommation-eau`, {
          method: "POST",
          body: { date: today, ageJours, quantiteLitres: values.eauLitres },
          label: `Eau ${bande.nom} J${ageJours}`,
        })
      );
    }

    if (values.observations?.trim()) {
      tasks.push(
        offlineFetch(`${baseUrl}/observations`, {
          method: "POST",
          body: { date: today, ageJours, contenu: values.observations.trim() },
          label: `Observation ${bande.nom} J${ageJours}`,
        })
      );
    }

    try {
      const results = await Promise.allSettled(tasks);
      const fulfilled = results.filter((r) => r.status === "fulfilled") as PromiseFulfilledResult<{ ok: boolean; queued: boolean }>[];
      const anyQueued = fulfilled.some((r) => r.value.queued);
      const anySucceeded = fulfilled.some((r) => r.value.ok);
      const anyFailed = fulfilled.some((r) => !r.value.ok && !r.value.queued) || results.some((r) => r.status === "rejected");

      if (anyFailed) {
        toast({ title: "Erreur lors de l'enregistrement de certaines saisies", variant: "destructive" });
      } else if (anyQueued) {
        toast({
          title: "Saisie enregistrée localement",
          description: "Synchronisation automatique au retour de connexion.",
        });
      } else {
        toast({ title: `Journée J${ageJours} enregistrée pour ${bande.nom}` });
      }

      if (anySucceeded && !anyFailed) {
        onSuccess?.();
        onOpenChange(false);
        form.reset({
          deces: 0,
          alimentKg: undefined,
          typeAliment: typeAlimentDefaut,
          eauLitres: undefined,
          observations: "",
        });
      }
    } catch {
      toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-journal-du-jour">
        <DialogHeader>
          <DialogTitle>Journée d'aujourd'hui</DialogTitle>
          <DialogDescription>
            Saisissez en une seule fois la mortalité, l'aliment, l'eau et les observations du jour.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-2 space-y-1" data-testid="journal-header">
          <div className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden>🐔</span>
            <span>{bande.nom}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>📅 {formatDateFR(todayDate)}</span>
            <span>⏱️ J{ageJours}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Décès aujourd'hui<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      data-testid="input-deces"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormDescription>Indiquer 0 si aucun décès aujourd'hui.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alimentKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aliment consommé (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="Ex: 48"
                      data-testid="input-aliment-kg"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="typeAliment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'aliment</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-type-aliment">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="demarrage">Démarrage (J1–J13)</SelectItem>
                      <SelectItem value="croissance">Croissance (J14–J28)</SelectItem>
                      <SelectItem value="finition">Finition (J29+)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Pré-sélectionné selon l'âge actuel (J{ageJours}).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eauLitres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eau consommée (litres)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="Ex: 120"
                      data-testid="input-eau-litres"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Observations du jour
                    <span className="text-muted-foreground text-xs ml-2">(optionnel)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Traitements administrés, comportement anormal, visiteurs, météo, problèmes observés..."
                      data-testid="input-observations"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-submit-journal"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "✓ Enregistrer la journée"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
