import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creerProjet } from "../services/serviceProjet";
import MainLayout from "../components/layout/MainLayout";
import ProjectForm from "../components/forms/ProjectForm";
import useToast from "../hooks/useToast";

export default function AjouterProjet() {
  const navigate = useNavigate();
  const { showToast, Toast } = useToast();
  const [clientInfo, setClientInfo] = useState(null);

  const handleSubmit = async (projet) => {
    try {
      const result = await creerProjet(projet);
      showToast("Projet créé avec succès");
      if (result.client_info) {
        setClientInfo(result.client_info);
      } else {
        navigate("/projets");
      }
    } catch (erreur) {
      console.error(erreur);
      showToast("Impossible de créer le projet", "error");
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Ajouter un projet</p>
          <h2>Nouvelle fiche de projet</h2>
        </div>
      </div>

      <section className="panel-card form-panel">
        <ProjectForm onSubmit={handleSubmit} submitLabel="Créer le projet" />
      </section>

      {clientInfo && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "2rem"
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: "2rem",
            maxWidth: 420, width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: 8, color: "#102015", fontSize: 18 }}>
              Compte client créé
            </h3>
            <p style={{ fontSize: 14, color: "#5B6B5C", marginBottom: 16 }}>
              Transmettez ces identifiants à <strong style={{ color: "#102015" }}>{clientInfo.nom}</strong> pour accéder au suivi de son installation.
            </p>
            <div style={{ background: "#EEF3EA", borderRadius: 8, padding: "1rem", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: "#5B6B5C" }}>Nom d'utilisateur</span>
                <strong style={{ color: "#102015" }}>{clientInfo.username}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#5B6B5C" }}>Mot de passe</span>
                <strong style={{ color: "#102015" }}>{clientInfo.password}</strong>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#CA8A04", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              ⚠ Notez ces identifiants — ils ne seront plus affichés après fermeture.
            </p>
            <button
              className="primary-button"
              style={{ width: "100%" }}
              onClick={() => navigate("/projets")}
            >
              Compris, fermer
            </button>
          </div>
        </div>
      )}

      <Toast />
    </MainLayout>
  );
}