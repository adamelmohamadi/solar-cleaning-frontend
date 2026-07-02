import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { changerMotDePasse } from "../services/serviceAuthentification";
import useToast from "../hooks/useToast";

const getRoleLabel = (role) => {
  switch (role) {
    case "MAINTENEUR": return "Mainteneur";
    case "CHEF_PROJET": return "Chef de Projet";
    case "DIRECTEUR_TECHNIQUE": return "Directeur Technique";
    case "DIRECTEUR_GENERAL": return "Directeur Général";
    default: return role || "—";
  }
};

export default function Profil() {
  const { utilisateur, logout } = useAuth();
  const { showToast, Toast } = useToast();
  const [formState, setFormState] = useState({
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
    confirmer_mot_de_passe: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!formState.ancien_mot_de_passe) errs.ancien = "Requis.";
    if (!formState.nouveau_mot_de_passe) errs.nouveau = "Requis.";
    else if (formState.nouveau_mot_de_passe.length < 6) errs.nouveau = "Minimum 6 caractères.";
    if (formState.nouveau_mot_de_passe !== formState.confirmer_mot_de_passe)
      errs.confirmer = "Les mots de passe ne correspondent pas.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await changerMotDePasse(
        formState.ancien_mot_de_passe,
        formState.nouveau_mot_de_passe
      );
      showToast("Mot de passe mis à jour — reconnectez-vous.");
      setFormState({
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
        confirmer_mot_de_passe: "",
      });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Erreur lors de la mise à jour.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const initiales = utilisateur
    ? (utilisateur.first_name?.[0] || utilisateur.username?.[0] || "U").toUpperCase()
    : "U";

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Mon compte</p>
          <h2>Profil utilisateur</h2>
        </div>
      </div>

<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="profil-grid">
        <div className="table-card" style={{ padding: "1.75rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "0.5px solid #E1E8DC" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#15803D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 500, color: "#fff" }}>
              {initiales}
            </div>
            <div>
              <p style={{ fontWeight: 500, fontSize: 16, color: "#102015" }}>
                {utilisateur?.first_name
                  ? `${utilisateur.first_name} ${utilisateur.last_name || ""}`.trim()
                  : utilisateur?.username}
              </p>
              <p style={{ fontSize: 13, color: "#5B6B5C" }}>{getRoleLabel(utilisateur?.role)}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#5B6B5C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Nom d'utilisateur</p>
              <p style={{ fontSize: 14, color: "#102015" }}>{utilisateur?.username || "—"}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#5B6B5C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Email</p>
              <p style={{ fontSize: 14, color: "#102015" }}>{utilisateur?.email || "—"}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#5B6B5C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Rôle</p>
              <p style={{ fontSize: 14, color: "#102015" }}>{getRoleLabel(utilisateur?.role)}</p>
            </div>
          </div>
        </div>

        <form className="project-form" onSubmit={handleSubmit}>
          <p style={{ fontSize: 15, fontWeight: 500, color: "#102015", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "0.5px solid #E1E8DC" }}>
            Changer le mot de passe
          </p>

          <div className="form-row">
            <label>Ancien mot de passe</label>
            <input
              type="password"
              value={formState.ancien_mot_de_passe}
              onChange={handleChange("ancien_mot_de_passe")}
              placeholder="••••••••"
            />
            {errors.ancien && <span className="input-error">{errors.ancien}</span>}
          </div>

          <div className="form-row">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={formState.nouveau_mot_de_passe}
              onChange={handleChange("nouveau_mot_de_passe")}
              placeholder="••••••••"
            />
            {errors.nouveau && <span className="input-error">{errors.nouveau}</span>}
          </div>

          <div className="form-row">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={formState.confirmer_mot_de_passe}
              onChange={handleChange("confirmer_mot_de_passe")}
              placeholder="••••••••"
            />
            {errors.confirmer && <span className="input-error">{errors.confirmer}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Mise à jour..." : "Changer le mot de passe"}
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#5B6B5C", marginTop: "0.75rem" }}>
            Après le changement, vous serez automatiquement déconnecté.
          </p>
        </form>
      </div>

      <Toast />
    </MainLayout>
  );
}