import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { recupererStatistiques } from "../services/ServiceTableauDeBord";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const statutStyles = {
  PLANIFIE: "bg-secondary text-secondary-foreground",
  EN_COURS: "bg-accent text-accent-foreground",
  TERMINE: "bg-primary text-primary-foreground",
  EN_RETARD: "bg-destructive text-white",
};

const statutLabels = {
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  EN_RETARD: "En retard",
};

const DONUT_COLORS = {
  PLANIFIE: "#5B6B5C",
  EN_COURS: "#FACC15",
  TERMINE: "#15803D",
  EN_RETARD: "#DC2626",
};

function StatutBadge({ statut }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutStyles[statut] || "bg-secondary"}`}>
      {statutLabels[statut] || statut}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "0.5px solid #E1E8DC", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
        <strong style={{ color: payload[0].payload.fill }}>{payload[0].name}</strong>
        <br />
        {payload[0].value} opération{payload[0].value > 1 ? "s" : ""}
      </div>
    );
  }
  return null;
};

export default function TableauDeBord() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    recupererStatistiques()
      .then(setData)
      .catch(() => setErreur("Impossible de charger les données du tableau de bord."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-muted-foreground">Chargement du tableau de bord...</p>
      </MainLayout>
    );
  }

  if (erreur) {
    return (
      <MainLayout>
        <p className="text-destructive">{erreur}</p>
      </MainLayout>
    );
  }

  const { kpis, prochains_nettoyages, nettoyages_en_retard, projets_recents, activite_recente } = data;

  const donutData = [
    { name: "Planifié", value: kpis.planned, fill: DONUT_COLORS.PLANIFIE },
    { name: "En cours", value: kpis.in_progress, fill: DONUT_COLORS.EN_COURS },
    { name: "Terminé", value: kpis.completed, fill: DONUT_COLORS.TERMINE },
    { name: "En retard", value: kpis.delayed, fill: DONUT_COLORS.EN_RETARD },
  ].filter((d) => d.value > 0);

  return (
    <MainLayout>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Tableau de bord</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={FolderKanban} label="Projets" value={kpis.total_projects} accent="text-primary" />
        <KpiCard icon={Clock} label="En cours" value={kpis.in_progress} accent="text-accent-foreground" />
        <KpiCard icon={CheckCircle2} label="Terminés" value={kpis.completed} accent="text-primary" />
        <KpiCard icon={AlertTriangle} label="En retard" value={kpis.delayed} accent="text-destructive" />
        <KpiCard icon={TrendingUp} label="Avancement" value={`${kpis.taux_avancement}%`} accent="text-primary" />
      </div>

      {/* Barre d'avancement global */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Avancement global</span>
          <span className="text-muted-foreground">{kpis.taux_avancement}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${kpis.taux_avancement}%` }}
          />
        </div>
      </div>

      {/* Donut + Planning */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Graphique Donut */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Répartition des statuts</h2>
          {donutData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {donutData.map((entry) => (
                  <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: entry.fill, display: "inline-block" }} />
                      <span style={{ color: "#5B6B5C" }}>{entry.name}</span>
                    </div>
                    <span style={{ fontWeight: 500, color: "#102015" }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Planning + Retards */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Prochains nettoyages</h2>
          {prochains_nettoyages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun nettoyage planifié.</p>
          ) : (
            <ul className="divide-y divide-border">
              {prochains_nettoyages.map((n) => (
                <li key={n.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">{n.projet_nom}</p>
                    <p className="text-sm text-muted-foreground">{n.date_prevue}</p>
                  </div>
                  <StatutBadge statut={n.statut} />
                </li>
              ))}
            </ul>
          )}

          {nettoyages_en_retard.length > 0 && (
            <>
              <h3 className="mt-6 mb-3 text-sm font-semibold text-destructive">
                ⚠ Nettoyages en retard ({kpis.projets_en_retard} projet(s) concerné(s))
              </h3>
              <ul className="divide-y divide-border">
                {nettoyages_en_retard.map((n) => (
                  <li key={n.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">{n.projet_nom}</p>
                      <p className="text-sm text-muted-foreground">Prévu le {n.date_prevue}</p>
                    </div>
                    <StatutBadge statut={n.statut} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Activité récente */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Activité récente</h2>
        {activite_recente.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
        ) : (
          <ul className="space-y-3">
            {activite_recente.map((h) => (
              <li key={h.id} className="text-sm">
                <p className="text-foreground">{h.action}</p>
                <p className="text-xs text-muted-foreground">
                  {h.projet_nom} · {h.utilisateur_nom} ·{" "}
                  {new Date(h.date_action).toLocaleDateString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Projets récents */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Projets récents</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Localisation</th>
                <th className="py-2 pr-4">Panneaux</th>
                <th className="py-2 pr-4">Fréquence</th>
              </tr>
            </thead>
            <tbody>
              {projets_recents.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{p.nom}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.localisation}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.nombre_panneaux}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.frequence_nettoyage} j</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}