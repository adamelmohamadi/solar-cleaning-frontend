import { useNavigate } from "react-router-dom";
import { creerProjet } from "../services/serviceProjet";
import MainLayout from "../components/layout/MainLayout";
import ProjectForm from "../components/forms/ProjectForm";
import useToast from "../hooks/useToast";

export default function AjouterProjet() {
  const navigate = useNavigate();
  const { showToast, Toast } = useToast();

  const handleSubmit = async (projet) => {
    try {
      await creerProjet(projet);
      showToast("Projet créé avec succès");
      navigate("/projets");
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

      <Toast />
    </MainLayout>
  );
}
