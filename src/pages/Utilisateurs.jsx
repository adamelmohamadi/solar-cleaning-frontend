import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { recupererUtilisateurs, creerUtilisateur, supprimerUtilisateur } from "../services/serviceUtilisateur";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import useToast from "../hooks/useToast";

const getRoleClass = (role) => {
  switch (role) {
    case "MAINTENEUR": return "status-badge status-success";
    case "CHEF_PROJET": return "status-badge status-muted";
    case "DIRECTEUR_TECHNIQUE": return "status-badge status-muted";
    case "DIRECTEUR_GENERAL": return "status-badge status-warning";
    default: return "status-badge status-muted";
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "MAINTENEUR": return "Mainteneur";
    case "CHEF_PROJET": return "Chef de Projet";
    case "DIRECTEUR_TECHNIQUE": return "Directeur Technique";
    case "DIRECTEUR_GENERAL": return "Directeur Général";
    default: return role || "—";
  }
};

const initialForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  confirmer_password: "",
  role: "MAINTENEUR",
};

const initialErrors = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  confirmer_password: "",
};

const validerEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Utilisateurs() {
  const { utilisateur } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [submitting, setSubmitting] = useState(false);
  const { showToast, Toast } = useToast();

  const estAdmin = utilisateur?.is_superuser || utilisateur?.role === "DIRECTEUR_GENERAL";

  const charger = async () => {
    setLoading(true);
    try {
      const data = await recupererUtilisateurs();
      setUtilisateurs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = { ...initialErrors };
    let valide = true;

    if (!formState.username.trim()) {
      errs.username = "Le nom d'utilisateur est requis.";
      valide = false;
    } else if (formState.username.length < 3) {
      errs.username = "Minimum 3 caractères.";
      valide = false;
    } else if (/\s/.test(formState.username)) {
      errs.username = "Pas d'espaces autorisés.";
      valide = false;
    }

    if (formState.email && !validerEmail(formState.email)) {
      errs.email = "Email invalide.";
      valide = false;
    }

    if (!formState.password) {
      errs.password = "Le mot de passe est requis.";
      valide = false;
    } else if (formState.password.length < 6) {
      errs.password = "Minimum 6 caractères.";
      valide = false;
    }

    if (!formState.confirmer_password) {
      errs.confirmer_password = "Confirmez le mot de passe.";
      valide = false;
    } else if (formState.password !== formState.confirmer_password) {
      errs.confirmer_password = "Les mots de passe ne correspondent pas.";
      valide = false;
    }

    setErrors(errs);
    return valide;
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { confirmer_password, ...dataToSend } = formState;
      await creerUtilisateur(dataToSend);
      showToast("Utilisateur créé avec succès");
      setFormState(initialForm);
      setErrors(initialErrors);
      setShowForm(false);
      charger();
    } catch (err) {
      const erreurs = err.response?.data;
      if (erreurs?.username) {
        setErrors((prev) => ({ ...prev, username: erreurs.username[0] }));
      } else if (erreurs?.email) {
        setErrors((prev) => ({ ...prev, email: erreurs.email[0] }));
      } else if (erreurs?.password) {
        setErrors((prev) => ({ ...prev, password: erreurs.password[0] }));
      } else {
        showToast("Erreur lors de la création", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await supprimerUtilisateur(id);
      showToast("Utilisateur supprimé");
      charger();
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleAnnuler = () => {
    setShowForm(false);
    setFormState(initialForm);
    setErrors(initialErrors);
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Utilisateurs</p>
          <h2>Équipe et accès</h2>
        </div>
        {estAdmin && (
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Annuler" : "Ajouter un utilisateur"}
          </button>
        )}
      </div>

      {showForm && estAdmin && (
        <form className="project-form" onSubmit={handleCreer} style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 15, fontWeight: 500, color: "#102015", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "0.5px solid #E1E8DC" }}>
            Nouveau membre de l'équipe
          </p>

          <div className="form-grid">
            <div className="form-row">
              <label>Prénom <span className="form-optional">(optionnel)</span></label>
              <input
                value={formState.first_name}
                onChange={handleChange("first_name")}
                placeholder="Prénom"
              />
            </div>
            <div className="form-row">
              <label>Nom <span className="form-optional">(optionnel)</span></label>
              <input
                value={formState.last_name}
                onChange={handleChange("last_name")}
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="form-row">
            <label>Nom d'utilisateur</label>
            <input
              value={formState.username}
              onChange={handleChange("username")}
              placeholder="Ex : khalid.alami"
            />
            {errors.username && <span className="input-error">{errors.username}</span>}
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>Email <span className="form-optional">(optionnel)</span></label>
              <input
                type="email"
                value={formState.email}
                onChange={handleChange("email")}
                placeholder="email@exemple.com"
              />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>
            <div className="form-row">
              <label>Rôle</label>
              <select
                value={formState.role}
                onChange={handleChange("role")}
                className="form-select"
              >
                <option value="MAINTENEUR">Mainteneur</option>
                <option value="CHEF_PROJET">Chef de Projet</option>
                <option value="DIRECTEUR_TECHNIQUE">Directeur Technique</option>
                <option value="DIRECTEUR_GENERAL">Directeur Général</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>Mot de passe</label>
              <input
                type="password"
                value={formState.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
              />
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>
            <div className="form-row">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={formState.confirmer_password}
                onChange={handleChange("confirmer_password")}
                placeholder="••••••••"
              />
              {errors.confirmer_password && <span className="input-error">{errors.confirmer_password}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Création..." : "Créer le compte"}
            </button>
            <button type="button" className="text-button" onClick={handleAnnuler}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? <Loader /> : utilisateurs.length ? (
        <section className="table-card">
          <div className="table-header">
            <h2>Utilisateurs du système</h2>
            <span>{utilisateurs.length} personnes</span>
          </div>
          <div className="table-scroll mobile-hide">
            <table className="project-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Nom d'utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  {estAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>
                      {user.first_name || user.last_name
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : "—"}
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email || "—"}</td>
                    <td>
                      <span className={getRoleClass(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    {estAdmin && (
                      <td>
                        {user.id !== utilisateur?.id && (
                          <button
                            className="text-button danger"
                            onClick={() => handleSupprimer(user.id)}
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Vue cartes mobile */}
<div className="mobile-card-list mobile-only">
  {utilisateurs.map((user) => (
    <div key={user.id} className="mobile-card">
      <span className="mobile-card-title">
        {user.first_name || user.last_name
          ? `${user.first_name} ${user.last_name}`.trim()
          : user.username}
      </span>
      <div className="mobile-card-row">
        <span>Identifiant</span>
        <span>{user.username}</span>
      </div>
      <div className="mobile-card-row">
        <span>Email</span>
        <span>{user.email || "—"}</span>
      </div>
      <div className="mobile-card-row">
        <span>Rôle</span>
        <span className={getRoleClass(user.role)}>{getRoleLabel(user.role)}</span>
      </div>
      {estAdmin && user.id !== utilisateur?.id && (
        <div className="mobile-card-actions">
          <button className="text-button danger" onClick={() => handleSupprimer(user.id)}>
            Supprimer
          </button>
        </div>
      )}
    </div>
  ))}
</div>
        </section>
      ) : (
        <EmptyState
          title="Aucun utilisateur trouvé"
          description="Ajoutez des membres à votre équipe pour superviser les opérations."
        />
      )}

      <Toast />
    </MainLayout>
  );
}