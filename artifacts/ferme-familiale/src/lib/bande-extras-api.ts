import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = `${import.meta.env.BASE_URL}api/bandes`;

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useConsommationEau(bandeId: number) {
  return useQuery({
    queryKey: ["consommation-eau", bandeId],
    queryFn: () => fetchJson(`${BASE}/${bandeId}/consommation-eau`),
  });
}

export function useCreateConsommationEau(bandeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchJson(`${BASE}/${bandeId}/consommation-eau`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consommation-eau", bandeId] }),
  });
}

export function useDeleteConsommationEau(bandeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eauId: number) => fetchJson(`${BASE}/${bandeId}/consommation-eau/${eauId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consommation-eau", bandeId] }),
  });
}

export function useTraitements(bandeId: number) {
  return useQuery({
    queryKey: ["traitements", bandeId],
    queryFn: () => fetchJson(`${BASE}/${bandeId}/traitements`),
  });
}

export function useCreateTraitement(bandeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchJson(`${BASE}/${bandeId}/traitements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["traitements", bandeId] }),
  });
}

export function useDeleteTraitement(bandeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (traitId: number) => fetchJson(`${BASE}/${bandeId}/traitements/${traitId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["traitements", bandeId] }),
  });
}

export function useObservations(bandeId: number) {
  return useQuery({
    queryKey: ["observations", bandeId],
    queryFn: () => fetchJson(`${BASE}/${bandeId}/observations`),
  });
}

export function useCreateObservation(bandeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchJson(`${BASE}/${bandeId}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["observations", bandeId] }),
  });
}

export function useDeleteObservation(bandeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (obsId: number) => fetchJson(`${BASE}/${bandeId}/observations/${obsId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["observations", bandeId] }),
  });
}

export function useReferencePoids() {
  return useQuery({
    queryKey: ["reference-poids"],
    queryFn: () => fetchJson(`${BASE}/reference-poids`),
  });
}
