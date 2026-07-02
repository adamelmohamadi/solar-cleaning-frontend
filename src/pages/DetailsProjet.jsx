import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { recupererProjetParId, recupererNettoyagesParProjet, genererPlanning } from "../services/serviceProjet";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";
import useToast from "../hooks/useToast";

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

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
};

export default function DetailsProjet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const { showToast, Toast } = useToast();
  const estMainteneur = utilisateur?.is_superuser || utilisateur?.role === "MAINTENEUR";
  const estAdmin = utilisateur?.is_superuser || utilisateur?.role === "DIRECTEUR_GENERAL";

  const [projet, setProjet] = useState(null);
  const [nettoyages, setNettoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageAgrandie, setImageAgrandie] = useState(null);
  const [generant, setGenerant] = useState(false);

  useEffect(() => {
    charger();
  }, [id]);

  const charger = async () => {
    setLoading(true);
    try {
      const [projetData, nettoyagesData] = await Promise.all([
        recupererProjetParId(id),
        recupererNettoyagesParProjet(id),
      ]);
      setProjet(projetData);
      setNettoyages(nettoyagesData);
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setLoading(false);
    }
  };

  const handleGenererPlanning = async () => {
    const confirmation = window.confirm(
      `Générer automatiquement tous les nettoyages de l'année pour "${projet.nom}" (fréquence : ${projet.frequence_nettoyage} jours) ?\n\nLes nettoyages planifiés futurs existants seront remplacés.`
    );
    if (!confirmation) return;

    setGenerant(true);
    try {
      const result = await genererPlanning(id);
      showToast(result.detail);
      const nettoyagesData = await recupererNettoyagesParProjet(id);
      setNettoyages(nettoyagesData);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération du planning", "error");
    } finally {
      setGenerant(false);
    }
  };

  const total = nettoyages.length;
  const termines = nettoyages.filter((n) => n.statut === "TERMINE").length;
  const enRetard = nettoyages.filter((n) => n.statut === "EN_RETARD").length;
  const taux = total ? Math.round((termines / total) * 100) : 0;

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Détails du projet</p>
          <h2>{projet?.nom || "Projet"}</h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {estMainteneur && (
            <button
              className="primary-button"
              onClick={() => navigate(`/nettoyages/ajouter`)}
            >
              Ajouter un nettoyage
            </button>
          )}
          {estAdmin && (
            <>
              <button
                className="text-button"
                onClick={handleGenererPlanning}
                disabled={generant}
              >
                {generant ? "Génération..." : "Générer le planning annuel"}
              </button>
              <button
                className="text-button"
                onClick={() => navigate(`/projets/${id}/modifier`)}
              >
                Modifier le projet
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? <Loader /> : projet ? (
        <>
          <div className="kpi-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="kpi-card">
              <span className="kpi-label">Panneaux</span>
              <span className="kpi-value">{projet.nombre_panneaux}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Fréquence</span>
              <span className="kpi-value" style={{ fontSize: 20 }}>{projet.frequence_nettoyage}j</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Nettoyages terminés</span>
              <span className="kpi-value kpi-success">{termines}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">En retard</span>
              <span className="kpi-value kpi-danger">{enRetard}</span>
            </div>
          </div>

          <div className="table-card" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#102015" }}>Avancement global</span>
              <span style={{ fontSize: 13, color: "#5B6B5C" }}>{taux}%</span>
            </div>
            <div className="progress-bar-wrap" style={{ width: "100%" }}>
              <div className="progress-bar-fill" style={{ width: `${taux}%` }} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: 10, fontSize: 12, color: "#5B6B5C" }}>
              <span>{projet.localisation}</span>
              <span>· {total} opération{total > 1 ? "s" : ""} au total</span>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h2>Nettoyages du projet</h2>
              <span>{nettoyages.length} opérations</span>
            </div>
            {nettoyages.length === 0 ? (
              <p style={{ padding: "1.5rem 1.25rem", color: "#5B6B5C", fontSize: 14 }}>
                Aucun nettoyage planifié pour ce projet.
              </p>
            ) : (
              <div className="table-scroll mobile-hide">
                <table className="project-table">
                  <thead>
                    <tr>
                      <th>Date prévue</th>
                      <th>Date réalisée</th>
                      <th>Statut</th>
                      <th>Commentaire</th>
                      <th>Preuves</th>
                      {estMainteneur && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {nettoyages.map((n) => (
                      <tr key={n.id}>
                        <td>{formatDate(n.date_prevue)}</td>
                        <td>{formatDate(n.date_realisee)}</td>
                        <td>
                          <span className={getStatutClass(n.statut)}>
                            {getStatutLabel(n.statut)}
                          </span>
                        </td>
                        <td style={{ color: "#5B6B5C", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {n.commentaire || "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {n.photo && (
                              <button
                                onClick={() => setImageAgrandie({ url: n.photo, titre: "Photo du nettoyage" })}
                                style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                              >
                                <img
                                  src={n.photo}
                                  alt="Photo"
                                  style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", border: "0.5px solid #E1E8DC" }}
                                />
                              </button>
                            )}
                            {n.signature && (
                              <button
                                onClick={() => setImageAgrandie({ url: n.signature, titre: "Signature de confirmation" })}
                                style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                              >
                                <img
                                  src={n.signature}
                                  alt="Signature"
                                  style={{ width: 36, height: 36, borderRadius: 6, objectFit: "contain", border: "0.5px solid #E1E8DC", background: "#fff" }}
                                />
                              </button>
                            )}
                            {!n.photo && !n.signature && (
                              <span style={{ color: "#5B6B5C", fontSize: 12 }}>—</span>
                            )}
                          </div>
                        </td>
                        {estMainteneur && (
                          <td>
                            <button
                              className="text-button"
                              onClick={() => navigate(`/nettoyages/${n.id}/modifier`)}
                            >
                              Modifier
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <p style={{ color: "#5B6B5C" }}>Impossible de charger les informations du projet.</p>
        </div>
      )}

      {imageAgrandie && (
        <div
          onClick={() => setImageAgrandie(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "2rem"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 12, padding: "1.25rem", maxWidth: 500, width: "100%" }}
          >
            <p style={{ fontWeight: 500, marginBottom: 10, color: "#102015" }}>{imageAgrandie.titre}</p>
            <img src={imageAgrandie.url} alt={imageAgrandie.titre} style={{ width: "100%", borderRadius: 8 }} />
            <button className="text-button" onClick={() => setImageAgrandie(null)} style={{ marginTop: 10, width: "100%" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <Toast />
    </MainLayout>
  );
}