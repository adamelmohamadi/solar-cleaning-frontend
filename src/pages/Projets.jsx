import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recupererProjets, supprimerProjet } from "../services/serviceProjet";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";
import ProjectTable from "../components/tables/ProjectTable";
import ProjectsMap from "../components/maps/ProjectsMap";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import useToast from "../hooks/useToast";

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vue, setVue] = useState("tableau");
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const { showToast, Toast } = useToast();
  const estAdmin = utilisateur?.is_superuser || utilisateur?.role === "DIRECTEUR_GENERAL";

  useEffect(() => {
    chargerProjets();
  }, []);

  useEffect(() => {
    if (!search.trim()) return;
    setFiltered(
      projets.filter((projet) =>
        projet.nom.toLowerCase().includes(search.toLowerCase()) ||
        projet.localisation.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [projets, search]);

  const chargerProjets = async () => {
    setLoading(true);
    try {
      const data = await recupererProjets();
      setProjets(data);
    } catch (erreur) {
      console.error(erreur);
      showToast("Impossible de charger les projets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    const confirmation = window.confirm("Voulez-vous vraiment supprimer ce projet ?");
    if (!confirmation) return;
    try {
      await supprimerProjet(id);
      showToast("Projet supprimé avec succès");
      chargerProjets();
    } catch (erreur) {
      console.error(erreur);
      showToast("Impossible de supprimer le projet", "error");
    }
  };

  const displayedProjects = useMemo(
    () => (search.trim() ? filtered : projets),
    [filtered, projets, search]
  );

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Projets</p>
          <h2>Gestion des projets de nettoyage</h2>
        </div>
        {estAdmin && (
          <button className="primary-button" onClick={() => navigate("/projets/ajouter")}>
            Ajouter un projet
          </button>
        )}
      </div>

      <section className="panel-card">
        <div className="panel-actions">
          <div className="input-group">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un projet ou une localisation"
            />
          </div>
        </div>
      </section>

      <div className="filtre-bar">
        <button
          className={`filtre-btn ${vue === "tableau" ? "filtre-btn-active" : ""}`}
          onClick={() => setVue("tableau")}
        >
          Tableau
        </button>
        <button
          className={`filtre-btn ${vue === "carte" ? "filtre-btn-active" : ""}`}
          onClick={() => setVue("carte")}
        >
          Carte
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : displayedProjects.length > 0 ? (
        vue === "tableau" ? (
          <ProjectTable
            projects={displayedProjects}
            onView={(id) => navigate(`/projets/${id}`)}
            onEdit={(id) => navigate(`/projets/${id}/modifier`)}
            onDelete={handleSupprimer}
            estAdmin={estAdmin}
          />
        ) : (
          <div className="table-card" style={{ padding: "1rem" }}>
            <ProjectsMap projets={displayedProjects} />
          </div>
        )
      ) : (
        <EmptyState
          title="Aucun projet trouvé"
          description="Créez un projet pour démarrer l'entretien solaire de votre ferme."
          action={estAdmin && (
            <button className="primary-button" onClick={() => navigate("/projets/ajouter")}>
              Ajouter un projet
            </button>
          )}
        />
      )}

      <Toast />
    </MainLayout>
  );
}