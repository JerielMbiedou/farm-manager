import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bird, UserPlus } from "lucide-react";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

const registerSchema = z.object({
  nom: z.string().min(2, "Le nom complet est requis"),
  username: z.string().min(3, "Minimum 3 caractères"),
  password: z.string().min(6, "Minimum 6 caractères"),
  passwordConfirm: z.string().min(1, "Confirmez le mot de passe"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"],
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const loginMutation = useLogin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nom: "", username: "", password: "", passwordConfirm: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await loginMutation.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Connexion réussie", description: "Bienvenue dans l'espace de gestion." });
      setLocation("/dashboard");
    } catch {
      toast({ title: "Erreur de connexion", description: "Vérifiez vos identifiants.", variant: "destructive" });
    }
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: values.nom, username: values.username, password: values.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      toast({ title: "Compte créé", description: "Vous pouvez maintenant vous connecter." });
      setIsRegistering(false);
      form.reset({ username: values.username, password: "" });
      registerForm.reset();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Impossible de créer le compte.", variant: "destructive" });
    }
  }

  if (isUserLoading || user) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F6F0]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground mb-4 shadow-md">
            <Bird className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Ferme Mbiedou</h1>
          <p className="text-muted-foreground mt-2">Gestion et suivi de notre exploitation</p>
        </div>

        <Card className="border-border/60 shadow-xl">
          {!isRegistering ? (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Connexion</CardTitle>
                <CardDescription>Entrez vos identifiants pour accéder à votre espace</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl><Input placeholder="Votre identifiant" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl><Input type="password" placeholder="Votre mot de passe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center">
                  <button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" />
                    Créer un compte
                  </button>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Créer un compte</CardTitle>
                <CardDescription>Votre compte sera en lecture seule par défaut. L'administrateur pourra vous accorder des droits supplémentaires.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField control={registerForm.control} name="nom" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl><Input placeholder="Ex: Jean Mbiedou" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl><Input placeholder="Ex: jean" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl><Input type="password" placeholder="Minimum 6 caractères" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="passwordConfirm" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl><Input type="password" placeholder="Retapez le mot de passe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium">
                      Créer mon compte
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center">
                  <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-muted-foreground hover:text-foreground">
                    Déjà un compte ? Se connecter
                  </button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
