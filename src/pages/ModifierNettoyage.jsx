import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { recupererNettoyageParId, mettreAJourNettoyageMainteneur } from "../services/serviceNettoyage";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";
import useToast from "../hooks/useToast";
import SignaturePad from "../components/forms/SignaturePad";

const dataUrlToFile = (dataUrl, filename) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export default function ModifierNettoyage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const { showToast, Toast } = useToast();
  const [nettoyage, setNettoyage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    statut: "",
    date_realisee: "",
    commentaire: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signature, setSignature] = useState(null);

  const estMainteneur = utilisateur?.is_superuser || utilisateur?.role === "MAINTENEUR";

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const data = await recupererNettoyageParId(id);
        setNettoyage(data);
        setFormState({
          statut: data.statut || "PLANIFIE",
          date_realisee: data.date_realisee || "",
          commentaire: data.commentaire || "",
          photo: null,
        });
        if (data.photo) setPhotoPreview(data.photo);
      } catch (e) {
        console.error(e);
        showToast("Impossible de charger le nettoyage", "error");
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id]);

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormState((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formState.statut === "TERMINE" && !signature && !nettoyage?.signature) {
      showToast("Une signature est requise pour terminer le nettoyage", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("statut", formState.statut);
      formData.append("commentaire", formState.commentaire);
      if (formState.date_realisee) formData.append("date_realisee", formState.date_realisee);
      if (formState.photo) formData.append("photo", formState.photo);
      if (signature) {
        const fichierSignature = dataUrlToFile(signature, `signature_${id}.png`);
        formData.append("signature", fichierSignature);
      }
      await mettreAJourNettoyageMainteneur(id, formData);
      showToast("Nettoyage mis à jour avec succès");
      navigate("/nettoyages");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la mise à jour", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!estMainteneur) {
    return (
      <MainLayout>
        <div style={{ padding: "2rem", color: "#DC2626" }}>
          Accès refusé — réservé aux mainteneurs.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Nettoyages</p>
          <h2>Mettre à jour le nettoyage</h2>
        </div>
      </div>

      {loading ? <Loader /> : (
        <form className="project-form" onSubmit={handleSubmit}>
          {nettoyage && (
            <div style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "#EEF3EA", borderRadius: "0.75rem", fontSize: 14, color: "#5B6B5C" }}>
              Projet : <strong style={{ color: "#102015" }}>{nettoyage.projet_nom || "—"}</strong>
              &nbsp;·&nbsp;
              Date prévue : <strong style={{ color: "#102015" }}>{nettoyage.date_prevue || "—"}</strong>
            </div>
          )}

          <div className="form-grid">
            <div className="form-row">
              <label>Statut</label>
              <select value={formState.statut} onChange={handleChange("statut")} className="form-select">
                <option value="PLANIFIE">Planifié</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="EN_RETARD">En retard</option>
              </select>
            </div>
            <div className="form-row">
              <label>Date réalisée</label>
              <input
                type="date"
                value={formState.date_realisee}
                onChange={handleChange("date_realisee")}
              />
            </div>
          </div>

          <div className="form-row">
            <label>Commentaire <span className="form-optional">(optionnel)</span></label>
            <textarea
              value={formState.commentaire}
              onChange={handleChange("commentaire")}
              placeholder="Observations, remarques sur le nettoyage..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-row">
            <label>Photo <span className="form-optional">(optionnel)</span></label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="form-file" />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Aperçu"
                style={{ marginTop: 10, maxHeight: 200, borderRadius: 8, border: "0.5px solid #E1E8DC" }}
              />
            )}
          </div>

          {formState.statut === "TERMINE" && (
            <div className="form-row">
              <label>Signature de confirmation</label>
              {signature ? (
                <div style={{ border: "0.5px solid #E1E8DC", borderRadius: 8, padding: 8 }}>
                  <img src={signature} alt="Signature" style={{ maxHeight: 100 }} />
                  <div>
                    <button type="button" className="text-button" onClick={() => setSignature(null)}>
                      Refaire la signature
                    </button>
                  </div>
                </div>
              ) : nettoyage?.signature ? (
                <div style={{ border: "0.5px solid #E1E8DC", borderRadius: 8, padding: 8 }}>
                  <img src={nettoyage.signature} alt="Signature existante" style={{ maxHeight: 100 }} />
                </div>
              ) : (
                <SignaturePad onSave={(sig) => setSignature(sig)} />
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="text-button" onClick={() => navigate("/nettoyages")}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <Toast />
    </MainLayout>
  );
}