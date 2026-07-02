import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TableauDeBord from "../pages/TableauDeBord";
import Projets from "../pages/Projets";
import DetailsProjet from "../pages/DetailsProjet";
import Nettoyages from "../pages/Nettoyages";
import Utilisateurs from "../pages/Utilisateurs";
import Rapports from "../pages/Rapports";
import Connexion from "../pages/Connexion";
import Notifications from "../pages/Notifications";
import AjouterProjet from "../pages/AjouterProjet";
import ModifierProjet from "../pages/ModifierProjet";
import AjouterNettoyage from "../pages/AjouterNettoyage";
import ModifierNettoyage from "../pages/ModifierNettoyage";
import Profil from "../pages/Profil";

function RouteProtegee({ children }) {
  const { utilisateur, chargement } = useAuth();
  if (chargement) return null;
  if (!utilisateur) return <Navigate to="/connexion" replace />;
  return children;
}

function RouteAccueil() {
  const { utilisateur } = useAuth();
  const estAdmin = utilisateur?.is_superuser || utilisateur?.role === "DIRECTEUR_GENERAL";
  const estMainteneur = !estAdmin && utilisateur?.role === "MAINTENEUR";

  if (estMainteneur) return <Nettoyages />;
  return <TableauDeBord />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/" element={<RouteProtegee><RouteAccueil /></RouteProtegee>} />
        <Route path="/projets" element={<RouteProtegee><Projets /></RouteProtegee>} />
        <Route path="/projets/ajouter" element={<RouteProtegee><AjouterProjet /></RouteProtegee>} />
        <Route path="/projets/:id" element={<RouteProtegee><DetailsProjet /></RouteProtegee>} />
        <Route path="/projets/:id/modifier" element={<RouteProtegee><ModifierProjet /></RouteProtegee>} />
        <Route path="/nettoyages" element={<RouteProtegee><Nettoyages /></RouteProtegee>} />
        <Route path="/nettoyages/ajouter" element={<RouteProtegee><AjouterNettoyage /></RouteProtegee>} />
        <Route path="/utilisateurs" element={<RouteProtegee><Utilisateurs /></RouteProtegee>} />
        <Route path="/rapports" element={<RouteProtegee><Rapports /></RouteProtegee>} />
        <Route path="/notifications" element={<RouteProtegee><Notifications /></RouteProtegee>} />
        <Route path="/nettoyages/:id/modifier" element={<RouteProtegee><ModifierNettoyage /></RouteProtegee>} />
        <Route path="/profil" element={<RouteProtegee><Profil /></RouteProtegee>} />
      </Routes>
    </BrowserRouter>
  );
}