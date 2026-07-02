import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { recupererNettoyages, recupererNettoyageStats } from "../services/serviceNettoyage";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
});

const messages = {
  today: "Aujourd'hui",
  previous: "Précédent",
  next: "Suivant",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Opération",
  noEventsInRange: "Aucun nettoyage sur cette période.",
};

const getStatutClass = (statut) => {
  switch (statut) {
    case "TERMINE": return "status-badge status-success";
    case "EN_COURS": return "status-badge status-success";
    case "EN_RETARD": return "status-badge status-warning";
    case "PLANIFIE": return "status-badge status-muted";
    default: return "status-badge status-muted";
  }
};

const getStatutLabel = (statut) => {
  switch (statut) {
    case "TERMINE": return "Terminé";
    case "EN_COURS": return "En cours";
    case "EN_RETARD": return "En retard";
    case "PLANIFIE": return "Planifié";
    default: return statut || "—";
  }
};

const getStatutColor = (statut) => {
  switch (statut) {
    case "TERMINE": return "#15803D";
    case "EN_COURS": return "#15803D";
    case "EN_RETARD": return "#CA8A04";
    case "PLANIFIE": return "#5B6B5C";
    default: return "#5B6B5C";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
};

export default function Nettoyages() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const estMainteneur = utilisateur?.is_superuser || utilisateur?.role === "MAINTENEUR";
  const [nettoyages, setNettoyages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vue, setVue] = useState("tableau");
  const [vueCalendrier, setVueCalendrier] = useState(Views.MONTH);
  const [estMobile, setEstMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setEstMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (estMobile) setVueCalendrier(Views.AGENDA);
  }, [estMobile]);

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const [data, statsData] = await Promise.all([
          recupererNettoyages(),
          recupererNettoyageStats(),
        ]);
        setNettoyages(data);
        setStats(statsData);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const evenements = nettoyages.map((n) => ({
    id: n.id,
    title: n.projet_nom || "Nettoyage",
    start: new Date(n.date_prevue),
    end: new Date(n.date_prevue),
    statut: n.statut,
    resource: n,
  }));

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: getStatutColor(event.statut),
      borderRadius: "6px",
      border: "none",
      color: "#fff",
      fontSize: "12px",
      padding: "2px 6px",
    },
  });

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Nettoyages</p>
          <h2>Suivi des opérations de nettoyage</h2>
        </div>
        {estMainteneur && (
          <button className="primary-button" onClick={() => navigate("/nettoyages/ajouter")}>
            Ajouter un nettoyage
          </button>
        )}
      </div>

      {loading ? <Loader /> : (
        <>
          {stats && (
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">Total opérations</span>
                <span className="kpi-value">{stats.kpis.total}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Terminées</span>
                <span className="kpi-value kpi-success">{stats.kpis.termines}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">En retard</span>
                <span className="kpi-value kpi-danger">{stats.kpis.en_retard}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">À venir (7j)</span>
                <span className="kpi-value kpi-warning">{stats.kpis.a_venir}</span>
              </div>
            </div>
          )}

          {stats?.alertes?.length > 0 && (
            <div className="alert-band">
              <span className="alert-band-title">⚠ Opérations à traiter</span>
              <div className="alert-list">
                {stats.alertes.map((a) => (
                  <div key={a.id} className="alert-item">
                    <span className="alert-projet">{a.projet_nom || "—"}</span>
                    <span className="alert-date">{formatDate(a.date_prevue)}</span>
                    <span className={getStatutClass(a.statut)}>{getStatutLabel(a.statut)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="filtre-bar">
            <button
              className={`filtre-btn ${vue === "tableau" ? "filtre-btn-active" : ""}`}
              onClick={() => setVue("tableau")}
            >
              Tableau
            </button>
            <button
              className={`filtre-btn ${vue === "calendrier" ? "filtre-btn-active" : ""}`}
              onClick={() => setVue("calendrier")}
            >
              Calendrier
            </button>
          </div>

          {vue === "tableau" ? (
            nettoyages.length ? (
              <section className="table-card">
                <div className="table-header">
                  <h2>Planning des nettoyages</h2>
                  <span>{nettoyages.length} opérations</span>
                </div>

                <div className="table-scroll mobile-hide">
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th>Projet</th>
                        <th>Date prévue</th>
                        <th>Date réalisée</th>
                        <th>Statut</th>
                        <th>Commentaire</th>
                        {estMainteneur && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {nettoyages.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 500 }}>{item.projet_nom || "—"}</td>
                          <td>{formatDate(item.date_prevue)}</td>
                          <td>{formatDate(item.date_realisee)}</td>
                          <td>
                            <span className={getStatutClass(item.statut)}>
                              {getStatutLabel(item.statut)}
                            </span>
                          </td>
                          <td style={{ color: "#5B6B5C", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.commentaire || "—"}
                          </td>
                          {estMainteneur && (
                            <td>
                              <button className="text-button" onClick={() => navigate(`/nettoyages/${item.id}/modifier`)}>
                                Modifier
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-card-list mobile-only">
                  {nettoyages.map((item) => (
                    <div key={item.id} className="mobile-card">
                      <span className="mobile-card-title">{item.projet_nom || "—"}</span>
                      <div className="mobile-card-row">
                        <span>Date prévue</span>
                        <span>{formatDate(item.date_prevue)}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span>Date réalisée</span>
                        <span>{formatDate(item.date_realisee)}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span>Statut</span>
                        <span className={getStatutClass(item.statut)}>
                          {getStatutLabel(item.statut)}
                        </span>
                      </div>
                      {item.commentaire && (
                        <div className="mobile-card-row">
                          <span>Commentaire</span>
                          <span>{item.commentaire}</span>
                        </div>
                      )}
                      {estMainteneur && (
                        <div className="mobile-card-actions">
                          <button className="text-button" onClick={() => navigate(`/nettoyages/${item.id}/modifier`)}>
                            Modifier
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <EmptyState
                title="Aucun nettoyage trouvé"
                description="Les opérations de nettoyage seront affichées ici lorsque votre planning sera défini."
              />
            )
          ) : (
            <div className="table-card" style={{ padding: "1.25rem" }}>
              <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", fontSize: 13, color: "#5B6B5C", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#15803D", display: "inline-block" }} />
                  Terminé / En cours
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#CA8A04", display: "inline-block" }} />
                  En retard
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#5B6B5C", display: "inline-block" }} />
                  Planifié
                </span>
              </div>
              <Calendar
                localizer={localizer}
                events={evenements}
                startAccessor="start"
                endAccessor="end"
                style={{ height: estMobile ? 480 : 560 }}
                eventPropGetter={eventStyleGetter}
                messages={messages}
                culture="fr"
                view={vueCalendrier}
                onView={(v) => setVueCalendrier(v)}
                views={estMobile ? [Views.AGENDA, Views.DAY] : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                onSelectEvent={(event) => {
                  if (estMainteneur) {
                    navigate(`/nettoyages/${event.id}/modifier`);
                  }
                }}
              />
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}