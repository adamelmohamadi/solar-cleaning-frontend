import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { recupererUtilisateurs, creerUtilisateur, supprimerUtilisateur, recupererClients, resetPasswordClient } from "../services/serviceUtilisateur";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import useToast from "../hooks/useToast";
import { ThumbsUp, Minus, ThumbsDown, KeyRound, FileText } from "lucide-react";
import jsPDF from "jspdf";

const getRoleClass = (role) => {
  switch (role) {
    case "MAINTENEUR": return "status-badge status-success";
    case "CHEF_PROJET": return "status-badge status-muted";
    case "DIRECTEUR_TECHNIQUE": return "status-badge status-muted";
    case "DIRECTEUR_GENERAL": return "status-badge status-warning";
    case "CLIENT": return "status-badge status-muted";
    default: return "status-badge status-muted";
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "MAINTENEUR": return "Mainteneur";
    case "CHEF_PROJET": return "Chef de Projet";
    case "DIRECTEUR_TECHNIQUE": return "Directeur Technique";
    case "DIRECTEUR_GENERAL": return "Directeur Général";
    case "CLIENT": return "Client";
    default: return role || "—";
  }
};

const SatisfactionIcon = ({ satisfaction }) => {
  if (satisfaction === "SATISFAIT") return <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#15803D", fontSize: 12 }}><ThumbsUp size={12} /> Satisfait</span>;
  if (satisfaction === "NEUTRE") return <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#CA8A04", fontSize: 12 }}><Minus size={12} /> Neutre</span>;
  return <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#DC2626", fontSize: 12 }}><ThumbsDown size={12} /> Insatisfait</span>;
};

const initialForm = {
  username: "", email: "", first_name: "", last_name: "",
  password: "", confirmer_password: "", role: "MAINTENEUR",
};

const initialErrors = {
  username: "", email: "", first_name: "", last_name: "",
  password: "", confirmer_password: "",
};

const validerEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const genererFicheClient = (client, password = null) => {
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
    ["Nom complet", client.nom],
    ["Nom d'utilisateur", client.username],
    ["Mot de passe", password || "••••••••"],
    ["Email", client.email !== "—" ? client.email : "Non renseigné"],
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

  y += 6;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 42, 30);
  doc.text("Projets associés", 14, y);
  y += 4;
  doc.setDrawColor(21, 128, 61);
  doc.line(14, y, 196, y);
  y += 10;

  if (client.projets.length === 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text("Aucun projet associé.", 14, y);
  } else {
    client.projets.forEach((p) => {
      doc.setFillColor(238, 243, 234);
      doc.roundedRect(14, y - 5, 182, 16, 3, 3, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 32, 21);
      doc.text(p.nom, 20, y + 2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 90, 90);
      doc.text(p.localisation, 20, y + 8);
      y += 22;
    });
  }

  y += 10;
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

  doc.save(`fiche-client-${client.username}.pdf`);
};

export default function Utilisateurs() {
  const { utilisateur } = useAuth();
  const [onglet, setOnglet] = useState("equipe");
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [submitting, setSubmitting] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState(null);
  const { showToast, Toast } = useToast();

  const estAdmin = utilisateur?.is_superuser || utilisateur?.role === "DIRECTEUR_GENERAL";

  const charger = async () => {
    setLoading(true);
    try {
      const [users, clientsData] = await Promise.all([
        recupererUtilisateurs(),
        estAdmin ? recupererClients() : Promise.resolve([]),
      ]);
      setUtilisateurs(users);
      setClients(clientsData);
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
    if (!formState.username.trim()) { errs.username = "Le nom d'utilisateur est requis."; valide = false; }
    else if (formState.username.length < 3) { errs.username = "Minimum 3 caractères."; valide = false; }
    else if (/\s/.test(formState.username)) { errs.username = "Pas d'espaces autorisés."; valide = false; }
    if (formState.email && !validerEmail(formState.email)) { errs.email = "Email invalide."; valide = false; }
    if (!formState.password) { errs.password = "Le mot de passe est requis."; valide = false; }
    else if (formState.password.length < 6) { errs.password = "Minimum 6 caractères."; valide = false; }
    if (!formState.confirmer_password) { errs.confirmer_password = "Confirmez le mot de passe."; valide = false; }
    else if (formState.password !== formState.confirmer_password) { errs.confirmer_password = "Les mots de passe ne correspondent pas."; valide = false; }
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
      if (erreurs?.username) setErrors((prev) => ({ ...prev, username: erreurs.username[0] }));
      else if (erreurs?.email) setErrors((prev) => ({ ...prev, email: erreurs.email[0] }));
      else if (erreurs?.password) setErrors((prev) => ({ ...prev, password: erreurs.password[0] }));
      else showToast("Erreur lors de la création", "error");
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

  const handleResetEtFiche = async (client) => {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${client.nom} et télécharger la fiche ?`)) return;
    try {
      const result = await resetPasswordClient(client.id);
      setCredentialsModal(result);
      genererFicheClient(client, result.password);
    } catch {
      showToast("Erreur lors de la réinitialisation", "error");
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Utilisateurs</p>
          <h2>Équipe et accès</h2>
        </div>
        {estAdmin && onglet === "equipe" && (
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Annuler" : "Ajouter un utilisateur"}
          </button>
        )}
      </div>

      <div className="filtre-bar">
        <button className={`filtre-btn ${onglet === "equipe" ? "filtre-btn-active" : ""}`} onClick={() => setOnglet("equipe")}>
          Équipe
        </button>
        {estAdmin && (
          <button className={`filtre-btn ${onglet === "clients" ? "filtre-btn-active" : ""}`} onClick={() => setOnglet("clients")}>
            Clients
          </button>
        )}
      </div>

      {/* ═══ ONGLET ÉQUIPE ═══ */}
      {onglet === "equipe" && (
        <>
          {showForm && estAdmin && (
            <form className="project-form" onSubmit={handleCreer} style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#102015", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "0.5px solid #E1E8DC" }}>
                Nouveau membre de l'équipe
              </p>
              <div className="form-grid">
                <div className="form-row">
                  <label>Prénom <span className="form-optional">(optionnel)</span></label>
                  <input value={formState.first_name} onChange={handleChange("first_name")} placeholder="Prénom" />
                </div>
                <div className="form-row">
                  <label>Nom <span className="form-optional">(optionnel)</span></label>
                  <input value={formState.last_name} onChange={handleChange("last_name")} placeholder="Nom" />
                </div>
              </div>
              <div className="form-row">
                <label>Nom d'utilisateur</label>
                <input value={formState.username} onChange={handleChange("username")} placeholder="Ex : khalid.alami" />
                {errors.username && <span className="input-error">{errors.username}</span>}
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>Email <span className="form-optional">(optionnel)</span></label>
                  <input type="email" value={formState.email} onChange={handleChange("email")} placeholder="email@exemple.com" />
                  {errors.email && <span className="input-error">{errors.email}</span>}
                </div>
                <div className="form-row">
                  <label>Rôle</label>
                  <select value={formState.role} onChange={handleChange("role")} className="form-select">
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
                  <input type="password" value={formState.password} onChange={handleChange("password")} placeholder="••••••••" />
                  {errors.password && <span className="input-error">{errors.password}</span>}
                </div>
                <div className="form-row">
                  <label>Confirmer le mot de passe</label>
                  <input type="password" value={formState.confirmer_password} onChange={handleChange("confirmer_password")} placeholder="••••••••" />
                  {errors.confirmer_password && <span className="input-error">{errors.confirmer_password}</span>}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Création..." : "Créer le compte"}
                </button>
                <button type="button" className="text-button" onClick={() => { setShowForm(false); setFormState(initialForm); setErrors(initialErrors); }}>
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
                          {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : "—"}
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email || "—"}</td>
                        <td><span className={getRoleClass(user.role)}>{getRoleLabel(user.role)}</span></td>
                        {estAdmin && (
                          <td>
                            {user.id !== utilisateur?.id && (
                              <button className="text-button danger" onClick={() => handleSupprimer(user.id)}>
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
              <div className="mobile-card-list mobile-only">
                {utilisateurs.map((user) => (
                  <div key={user.id} className="mobile-card">
                    <span className="mobile-card-title">
                      {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}
                    </span>
                    <div className="mobile-card-row"><span>Identifiant</span><span>{user.username}</span></div>
                    <div className="mobile-card-row"><span>Email</span><span>{user.email || "—"}</span></div>
                    <div className="mobile-card-row">
                      <span>Rôle</span>
                      <span className={getRoleClass(user.role)}>{getRoleLabel(user.role)}</span>
                    </div>
                    {estAdmin && user.id !== utilisateur?.id && (
                      <div className="mobile-card-actions">
                        <button className="text-button danger" onClick={() => handleSupprimer(user.id)}>Supprimer</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState title="Aucun utilisateur trouvé" description="Ajoutez des membres à votre équipe pour superviser les opérations." />
          )}
        </>
      )}

      {/* ═══ ONGLET CLIENTS ═══ */}
      {onglet === "clients" && estAdmin && (
        <>
          {loading ? <Loader /> : clients.length === 0 ? (
            <EmptyState title="Aucun client" description="Les clients sont créés automatiquement lors de l'ajout d'un projet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {clients.map((client) => (
                <div key={client.id} className="table-card">
                  <div className="table-header">
                    <div>
                      <h2>{client.nom}</h2>
                      <span style={{ fontSize: 13, color: "#5B6B5C" }}>@{client.username}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="text-button"
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                        onClick={() => genererFicheClient(client)}
                      >
                        <FileText size={14} />
                        Fiche client
                      </button>
                      <button
                        className="text-button"
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                        onClick={() => handleResetEtFiche(client)}
                      >
                        <KeyRound size={14} />
                        Réinitialiser + Fiche
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: "0 1.25rem 1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#102015", marginBottom: 8 }}>Projets associés</p>
                      {client.projets.length === 0 ? (
                        <p style={{ fontSize: 13, color: "#5B6B5C" }}>Aucun projet.</p>
                      ) : (
                        client.projets.map((p) => (
                          <div key={p.id} style={{ fontSize: 13, padding: "6px 10px", background: "#EEF3EA", borderRadius: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 500, color: "#102015" }}>{p.nom}</span>
                            <span style={{ color: "#5B6B5C" }}> — {p.localisation}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#102015", marginBottom: 8 }}>Avis récents</p>
                      {client.avis_recents.length === 0 ? (
                        <p style={{ fontSize: 13, color: "#5B6B5C" }}>Aucun avis pour le moment.</p>
                      ) : (
                        client.avis_recents.map((a, i) => (
                          <div key={i} style={{ border: "0.5px solid #E1E8DC", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <SatisfactionIcon satisfaction={a.satisfaction} />
                              <span style={{ fontSize: 11, color: "#5B6B5C" }}>{a.date}</span>
                            </div>
                            {a.commentaire && <p style={{ fontSize: 12, color: "#5B6B5C", margin: 0 }}>{a.commentaire}</p>}
                            {a.confirme && <p style={{ fontSize: 11, color: "#15803D", margin: "4px 0 0" }}>✓ Nettoyage confirmé</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal credentials */}
      {credentialsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "2rem", maxWidth: 400, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontWeight: 600, marginBottom: 8, color: "#102015" }}>Nouveau mot de passe généré</h3>
            <p style={{ fontSize: 14, color: "#5B6B5C", marginBottom: 16 }}>
              La fiche PDF a été téléchargée automatiquement pour <strong style={{ color: "#102015" }}>{credentialsModal.nom}</strong>.
            </p>
            <div style={{ background: "#EEF3EA", borderRadius: 8, padding: "1rem", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: "#5B6B5C" }}>Nom d'utilisateur</span>
                <strong>{credentialsModal.username}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#5B6B5C" }}>Nouveau mot de passe</span>
                <strong>{credentialsModal.password}</strong>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#CA8A04", marginBottom: 16 }}>
              ⚠ Ces identifiants sont aussi dans la fiche PDF téléchargée.
            </p>
            <button className="primary-button" style={{ width: "100%" }} onClick={() => setCredentialsModal(null)}>
              Compris, fermer
            </button>
          </div>
        </div>
      )}

      <Toast />
    </MainLayout>
  );
}