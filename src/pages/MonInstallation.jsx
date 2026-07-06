import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";
import Loader from "../components/ui/Loader";
import { ThumbsUp, Minus, ThumbsDown, CheckCircle2 } from "lucide-react";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

const SATISFACTION_OPTIONS = [
  { key: "SATISFAIT", label: "Satisfait", icon: ThumbsUp, color: "#15803D" },
  { key: "NEUTRE", label: "Neutre", icon: Minus, color: "#CA8A04" },
  { key: "INSATISFAIT", label: "Insatisfait", icon: ThumbsDown, color: "#DC2626" },
];

export default function MonInstallation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avisForm, setAvisForm] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    api.get("mon-installation/")
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleAvis = async (nettoyageId) => {
    setSubmitting(nettoyageId);
    try {
      await api.post(`nettoyages/${nettoyageId}/avis/`, avisForm[nettoyageId]);
      setSubmitted(prev => ({ ...prev, [nettoyageId]: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(null);
    }
  };

  const updateForm = (nettoyageId, field, value) => {
    setAvisForm(prev => ({
      ...prev,
      [nettoyageId]: { ...prev[nettoyageId], [field]: value }
    }));
  };

  if (loading) return <MainLayout><Loader /></MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Mon Installation</p>
          <h2>Suivi de mes panneaux solaires</h2>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="table-card" style={{ padding: "2rem", textAlign: "center", color: "#5B6B5C" }}>
          Aucune installation trouvée pour votre compte.
        </div>
      ) : (
        data.map((item) => (
          <div key={item.projet.id} style={{ marginBottom: "1.5rem" }}>

            {/* KPIs projet */}
            <div className="kpi-grid" style={{ marginBottom: "1rem" }}>
              <div className="kpi-card">
                <span className="kpi-label">Panneaux installés</span>
                <span className="kpi-value">{item.projet.nombre_panneaux}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Nettoyages terminés</span>
                <span className="kpi-value kpi-success">{item.termines_count}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Taux d'avancement</span>
                <span className="kpi-value kpi-success">{item.taux}%</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Prochain nettoyage</span>
                <span className="kpi-value" style={{ fontSize: 18 }}>
                  {formatDate(item.prochain_nettoyage)}
                </span>
              </div>
            </div>

            {/* Barre avancement */}
            <div className="table-card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#102015" }}>
                  {item.projet.nom}
                </span>
                <span style={{ fontSize: 13, color: "#5B6B5C" }}>
                  {item.projet.localisation}
                </span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${item.taux}%` }} />
              </div>
            </div>

            {/* Nettoyages terminés */}
            <div className="table-card">
              <div className="table-header">
                <h2>Mes nettoyages réalisés</h2>
                <span>{item.nettoyages_termines.length} opérations</span>
              </div>

              {item.nettoyages_termines.length === 0 ? (
                <p style={{ padding: "1rem 1.25rem", color: "#5B6B5C", fontSize: 14 }}>
                  Aucun nettoyage terminé pour le moment.
                </p>
              ) : (
                <div style={{ padding: "0 1.25rem 1.25rem" }}>
                  {item.nettoyages_termines.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        border: "0.5px solid #E1E8DC",
                        borderRadius: 10,
                        padding: "1rem",
                        marginBottom: 10,
                        background: "#FAFCF8",
                      }}
                    >
                      {/* Header nettoyage */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontWeight: 500, fontSize: 14, color: "#102015" }}>
                          Nettoyage du {formatDate(n.date_prevue)}
                        </span>
                        <span className="status-badge status-success">Terminé</span>
                      </div>

                      {/* Avis déjà soumis */}
                      {(n.avis_client || submitted[n.id]) ? (
                        <div style={{
                          background: "#EEF3EA",
                          borderRadius: 8,
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                          color: "#15803D"
                        }}>
                          <CheckCircle2 size={16} />
                          Avis enregistré — merci pour votre retour.
                        </div>
                      ) : (
                        /* Formulaire avis */
                        <div>
                          <p style={{ fontSize: 13, color: "#5B6B5C", marginBottom: 10 }}>
                            Êtes-vous satisfait de ce nettoyage ?
                          </p>

                          {/* Boutons satisfaction */}
                          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                            {SATISFACTION_OPTIONS.map(({ key, label, icon: Icon, color }) => {
                              const selected = avisForm[n.id]?.satisfaction === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => updateForm(n.id, "satisfaction", key)}
                                  style={{
                                    padding: "6px 16px",
                                    borderRadius: 20,
                                    border: `0.5px solid ${selected ? color : "#E1E8DC"}`,
                                    background: selected ? color : "#fff",
                                    color: selected ? "#fff" : "#102015",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <Icon size={13} />
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Commentaire */}
                          <textarea
                            placeholder="Commentaire (optionnel) — remarques, points à améliorer..."
                            className="form-textarea"
                            rows={2}
                            value={avisForm[n.id]?.commentaire || ""}
                            onChange={(e) => updateForm(n.id, "commentaire", e.target.value)}
                            style={{ marginBottom: 10 }}
                          />

                          {/* Confirmation + bouton */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#5B6B5C" }}>
                              <input
                                type="checkbox"
                                checked={avisForm[n.id]?.confirme || false}
                                onChange={(e) => updateForm(n.id, "confirme", e.target.checked)}
                              />
                              Je confirme que le nettoyage a bien été effectué
                            </label>
                            <button
                              className="primary-button"
                              onClick={() => handleAvis(n.id)}
                              disabled={submitting === n.id || !avisForm[n.id]?.satisfaction}
                              style={{ padding: "8px 20px", fontSize: 13 }}
                            >
                              {submitting === n.id ? "Envoi..." : "Envoyer mon avis"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </MainLayout>
  );
}