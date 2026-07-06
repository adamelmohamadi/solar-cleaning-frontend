import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creerProjet } from "../services/serviceProjet";
import MainLayout from "../components/layout/MainLayout";
import ProjectForm from "../components/forms/ProjectForm";
import useToast from "../hooks/useToast";
import jsPDF from "jspdf";

const genererFicheClient = (clientInfo) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("fr-FR");

  doc.setFillColor(15, 42, 30);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Unisystem Energy", 14, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Fiche confidentielle — Accès client", 14, 28);
  doc.text(`Générée le ${today}`, 14, 35);

  doc.setTextColor(15, 42, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Informations du compte", 14, 58);
  doc.setDrawColor(21, 128, 61);
  doc.setLineWidth(0.5);
  doc.line(14, 62, 196, 62);

  const infos = [
    ["Nom complet", clientInfo.nom],
    ["Nom d'utilisateur", clientInfo.username],
    ["Mot de passe", clientInfo.password],
    ["Lien de connexion", "https://solar-cleaning-frontend-orpin.vercel.app"],
  ];

  let y = 74;
  infos.forEach(([label, value]) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 32, 21);
    doc.text(label + " :", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(String(value), 80, y);
    y += 10;
  });

  y += 10;
  doc.setFillColor(220, 242, 231);
  doc.roundedRect(14, y, 182, 22, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 42, 30);
  doc.text("Recommandation sécurité", 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text("Il est recommandé de changer votre mot de passe lors de votre première connexion.", 20, y + 16);

  y += 32;
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(14, y, 182, 22, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(133, 79, 11);
  doc.text("Document confidentiel", 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text("Ces informations sont strictement personnelles. Ne pas partager.", 20, y + 16);

  doc.setFillColor(15, 42, 30);
  doc.rect(0, 277, 210, 20, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Unisystem Energy — Document généré automatiquement", 105, 288, { align: "center" });

  doc.save(`fiche-client-${clientInfo.username}.pdf`);
};

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
            maxWidth: 440, width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: 8, color: "#102015", fontSize: 18 }}>
              Compte client créé
            </h3>
            <p style={{ fontSize: 14, color: "#5B6B5C", marginBottom: 16 }}>
              Identifiants générés pour <strong style={{ color: "#102015" }}>{clientInfo.nom}</strong> — téléchargez la fiche pour les transmettre.
            </p>

            <div style={{ background: "#EEF3EA", borderRadius: 8, padding: "1rem", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: "#5B6B5C" }}>Nom d'utilisateur</span>
                <strong style={{ color: "#102015" }}>{clientInfo.username}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#5B6B5C" }}>Mot de passe</span>
                <strong style={{ color: "#102015" }}>{clientInfo.password}</strong>
              </div>
            </div>

            <div style={{ background: "#DCFCE7", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#15803D" }}>
              Il est recommandé au client de changer son mot de passe lors de sa première connexion.
            </div>

            <p style={{ fontSize: 12, color: "#CA8A04", marginBottom: 16 }}>
              ⚠ Ces identifiants ne seront plus affichés après fermeture — téléchargez la fiche maintenant.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="primary-button"
                style={{ flex: 1 }}
                onClick={() => genererFicheClient(clientInfo)}
              >
                Télécharger la fiche PDF
              </button>
              <button
                className="text-button"
                style={{ flex: 1 }}
                onClick={() => navigate("/projets")}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast />
    </MainLayout>
  );
}