import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { recupererNotifications } from "../services/serviceNotification";
import Loader from "../components/ui/Loader";

const getTypeConfig = (type) => {
  switch (type) {
    case "retard":
      return { classe: "notif-retard", label: "En retard", icone: "ti-alert-triangle" };
    case "a_venir":
      return { classe: "notif-avenir", label: "À venir", icone: "ti-calendar-event" };
    case "termine":
      return { classe: "notif-termine", label: "Terminé", icone: "ti-circle-check" };
    default:
      return { classe: "", label: "", icone: "ti-bell" };
  }
};

const FILTRES = ["Toutes", "En retard", "À venir", "Terminées"];

export default function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("Toutes");

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const result = await recupererNotifications();
        setData(result);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const notificationsFiltrees = () => {
    if (!data) return [];
    switch (filtre) {
      case "En retard": return data.notifications.filter((n) => n.type === "retard");
      case "À venir": return data.notifications.filter((n) => n.type === "a_venir");
      case "Terminées": return data.notifications.filter((n) => n.type === "termine");
      default: return data.notifications;
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Notifications</p>
          <h2>Alertes et rappels</h2>
        </div>
      </div>

      {loading ? <Loader /> : !data ? (
        <p style={{ color: "#5B6B5C" }}>Impossible de charger les notifications.</p>
      ) : (
        <>
          <div className="kpi-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="kpi-card">
              <span className="kpi-label">Total</span>
              <span className="kpi-value">{data.total}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">En retard</span>
              <span className="kpi-value kpi-danger">{data.en_retard}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">À venir (7j)</span>
              <span className="kpi-value kpi-warning">{data.a_venir}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Terminés (7j)</span>
              <span className="kpi-value kpi-success">{data.termines}</span>
            </div>
          </div>

          <div className="filtre-bar">
            {FILTRES.map((f) => (
              <button
                key={f}
                className={`filtre-btn ${filtre === f ? "filtre-btn-active" : ""}`}
                onClick={() => setFiltre(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="notif-list">
            {notificationsFiltrees().length === 0 ? (
              <div className="table-card" style={{ padding: "2rem", textAlign: "center", color: "#5B6B5C" }}>
                Aucune notification dans cette catégorie.
              </div>
            ) : (
              notificationsFiltrees().map((n) => {
                const config = getTypeConfig(n.type);
                return (
                  <div key={n.id} className={`notif-item ${config.classe}`}>
                    <span className="notif-icone">
                      <i className={`ti ${config.icone}`} aria-hidden="true" />
                    </span>
                    <div className="notif-content">
                      <span className="notif-projet">{n.projet}</span>
                      <span className="notif-message">{n.message}</span>
                    </div>
                    <span className={`notif-badge notif-badge-${n.type}`}>{config.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}