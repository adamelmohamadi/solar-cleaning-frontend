import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { creerNettoyage } from "../services/serviceNettoyage";
import { recupererProjets } from "../services/serviceProjet";
import useToast from "../hooks/useToast";

export default function AjouterNettoyage() {
  const navigate = useNavigate();
  const { showToast, Toast } = useToast();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    projet: "",
    date_prevue: "",
    statut: "PLANIFIE",
    commentaire: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await recupererProjets();
        setProjets(data);
      } catch (e) {
        console.error(e);
      }
    };
    charger();
  }, []);

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!formState.projet) errs.projet = "Sélectionnez un projet.";
    if (!formState.date_prevue) errs.date_prevue = "La date prévue est requise.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await creerNettoyage({
        projet: Number(formState.projet),
        date_prevue: formState.date_prevue,
        statut: formState.statut,
        commentaire: formState.commentaire,
      });
      showToast("Nettoyage créé avec succès");
      navigate("/nettoyages");
    } catch (erreur) {
      console.error(erreur);
      showToast("Impossible de créer le nettoyage", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Nettoyages</p>
          <h2>Planifier un nettoyage</h2>
        </div>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Projet</label>
          <select
            value={formState.projet}
            onChange={handleChange("projet")}
            className="form-select"
          >
            <option value="">Sélectionnez un projet</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          {errors.projet && <span className="input-error">{errors.projet}</span>}
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label>Date prévue</label>
            <input
              type="date"
              value={formState.date_prevue}
              onChange={handleChange("date_prevue")}
            />
            {errors.date_prevue && <span className="input-error">{errors.date_prevue}</span>}
          </div>
          <div className="form-row">
            <label>Statut</label>
            <select
              value={formState.statut}
              onChange={handleChange("statut")}
              className="form-select"
            >
              <option value="PLANIFIE">Planifié</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="EN_RETARD">En retard</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <label>Commentaire <span className="form-optional">(optionnel)</span></label>
          <textarea
            value={formState.commentaire}
            onChange={handleChange("commentaire")}
            placeholder="Observations, remarques..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Création..." : "Planifier le nettoyage"}
          </button>
          <button type="button" className="text-button" onClick={() => navigate("/nettoyages")}>
            Annuler
          </button>
        </div>
      </form>

      <Toast />
    </MainLayout>
  );
}