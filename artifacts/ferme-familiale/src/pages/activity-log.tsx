import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { DataPagination } from "@/components/data-pagination";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ActivityEntry {
  id: number;
  userId: number | null;
  userNom: string;
  action: string;
  details: string | null;
  createdAt: string;
}
interface PagedActivity {
  items: ActivityEntry[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchActivityPage(page: number, pageSize: number): Promise<PagedActivity> {
  const res = await fetch(`${BASE}/api/activity-log?page=${page}&pageSize=${pageSize}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erreur chargement journal");
  return res.json();
}

export default function ActivityLog() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, error } = useQuery({
    queryKey: ["activity-log", page, pageSize],
    queryFn: () => fetchActivityPage(page, pageSize),
  });

  if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (error) return <div className="text-destructive p-4">Erreur de chargement du journal d'activité.</div>;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Journal d'activité</h1>
        <p className="text-muted-foreground mt-1">Historique des actions effectuées sur la plateforme</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            Dernières activités
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Aucune activité enregistrée.</div>
          ) : (
            <div className="space-y-1" data-testid="activity-list">
              {items.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 p-3 rounded-md hover:bg-muted/30 transition-colors border-b last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{entry.userNom}</span>
                      <span className="text-xs text-muted-foreground">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString("fr-FR") : ""}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5">{entry.action}</p>
                    {entry.details && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DataPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="mt-4 border-t pt-3"
          />
        </CardContent>
      </Card>
    </div>
  );
}
