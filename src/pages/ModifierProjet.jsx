import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  recupererProjetParId,
  modifierProjet,
} from "../services/serviceProjet";
import MainLayout from "../components/layout/MainLayout";
import ProjectForm from "../components/forms/ProjectForm";
import Loader from "../components/ui/Loader";
import useToast from "../hooks/useToast";

export default function ModifierProjet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    const chargerProjet = async () => {
      setLoading(true);
      try {
        const data = await recupererProjetParId(id);
        setProjet(data);
      } catch (erreur) {
        console.error(erreur);
        showToast("Impossible de charger le projet", "error");
      } finally {
        setLoading(false);
      }
    };

    chargerProjet();
  }, [id, showToast]);

  const handleSubmit = async (values) => {
    try {
      await modifierProjet(id, values);
      showToast("Projet mis à jour avec succès");
      navigate("/projets");
    } catch (erreur) {
  console.error("Détail erreur:", JSON.stringify(erreur.response?.data));
  showToast("Impossible de mettre à jour le projet", "error");
}
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Modifier le projet</p>
          <h2>Mettre à jour les informations du projet</h2>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <section className="panel-card form-panel">
          <ProjectForm
            initialData={projet}
            onSubmit={handleSubmit}
            submitLabel="Sauvegarder les modifications"
          />
        </section>
      )}

      <Toast />
    </MainLayout>
  );
}
