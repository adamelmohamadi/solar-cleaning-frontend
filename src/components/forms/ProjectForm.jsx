import { useMemo, useState } from "react";
import { geocoderAdresse } from "../../services/serviceGeocodage";
import { useAuth } from "../../context/AuthContext";

const initialErrors = {
  nom: "",
  localisation: "",
  nombre_panneaux: "",
  frequence_nettoyage: "",
};

export default function ProjectForm({ initialData = {}, onSubmit, submitLabel }) {
  const { utilisateur } = useAuth();
  const [formState, setFormState] = useState({
    nom: initialData.nom || "",
    localisation: initialData.localisation || "",
    nombre_panneaux: initialData.nombre_panneaux || "",
    frequence_nettoyage: initialData.frequence_nettoyage || "",
    latitude: initialData.latitude || null,
    longitude: initialData.longitude || null,
  });
  const [errors, setErrors] = useState(initialErrors);
  const [geocodage, setGeocodage] = useState({ statut: "idle", message: "" });

  const isValid = useMemo(
    () =>
      formState.nom.trim().length > 0 &&
      formState.localisation.trim().length > 0 &&
      Number(formState.nombre_panneaux) > 0 &&
      Number(formState.frequence_nettoyage) > 0,
    [formState]
  );

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleLocaliser = async () => {
    if (!formState.localisation.trim()) {
      setGeocodage({ statut: "error", message: "Entrez d'abord une adresse." });
      return;
    }

    setGeocodage({ statut: "loading", message: "Recherche en cours..." });

    try {
      const resultat = await geocoderAdresse(formState.localisation);

      if (!resultat) {
        setGeocodage({ statut: "error", message: "Adresse introuvable. Essayez une formulation différente." });
        return;
      }

      setFormState((prev) => ({
        ...prev,
        latitude: resultat.latitude,
        longitude: resultat.longitude,
      }));
      setGeocodage({ statut: "success", message: `Localisé : ${resultat.nomComplet}` });
    } catch (err) {
      console.error(err);
      setGeocodage({ statut: "error", message: "Erreur lors de la localisation." });
    }
  };

  const validate = () => {
    const validationErrors = { ...initialErrors };
    if (!formState.nom.trim()) validationErrors.nom = "Le nom est requis.";
    if (!formState.localisation.trim()) validationErrors.localisation = "La localisation est requise.";
    if (!Number(formState.nombre_panneaux)) validationErrors.nombre_panneaux = "Entrez un nombre de panneaux valide.";
    if (!Number(formState.frequence_nettoyage)) validationErrors.frequence_nettoyage = "Entrez une fréquence de nettoyage valide.";
    setErrors(validationErrors);
    return Object.values(validationErrors).every((value) => !value);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...formState,
      nombre_panneaux: Number(formState.nombre_panneaux),
      frequence_nettoyage: Number(formState.frequence_nettoyage),
      responsable_maintenance: utilisateur?.id,
    });
  };

  return (
    <form className="project-form" onSubmit={submitForm}>
      <div className="form-row">
        <label>Nom du projet</label>
        <input
          value={formState.nom}
          onChange={handleChange("nom")}
          placeholder="Entrez le nom du projet"
        />
        {errors.nom && <span className="input-error">{errors.nom}</span>}
      </div>

      <div className="form-row">
        <label>Localisation</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={formState.localisation}
            onChange={handleChange("localisation")}
            placeholder="Ex : Tanger, Maroc"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="text-button"
            onClick={handleLocaliser}
            disabled={geocodage.statut === "loading"}
            style={{ whiteSpace: "nowrap" }}
          >
            {geocodage.statut === "loading" ? "Recherche..." : "Localiser"}
          </button>
        </div>
        {errors.localisation && <span className="input-error">{errors.localisation}</span>}
        {geocodage.statut === "success" && (
          <span style={{ fontSize: 12, color: "#15803D" }}>{geocodage.message}</span>
        )}
        {geocodage.statut === "error" && (
          <span className="input-error">{geocodage.message}</span>
        )}
        {formState.latitude && formState.longitude && (
          <span style={{ fontSize: 12, color: "#5B6B5C" }}>
            Coordonnées : {formState.latitude.toFixed(5)}, {formState.longitude.toFixed(5)}
          </span>
        )}
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Nombre de panneaux</label>
          <input
            type="number"
            value={formState.nombre_panneaux}
            onChange={handleChange("nombre_panneaux")}
            placeholder="0"
          />
          {errors.nombre_panneaux && <span className="input-error">{errors.nombre_panneaux}</span>}
        </div>
        <div className="form-row">
          <label>Fréquence de nettoyage (jours)</label>
          <input
            type="number"
            value={formState.frequence_nettoyage}
            onChange={handleChange("frequence_nettoyage")}
            placeholder="0"
          />
          {errors.frequence_nettoyage && <span className="input-error">{errors.frequence_nettoyage}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={!isValid}>
          {submitLabel}
        </button>
        <button type="button" className="text-button" onClick={() => window.history.back()}>
          Annuler
        </button>
      </div>
    </form>
  );
}