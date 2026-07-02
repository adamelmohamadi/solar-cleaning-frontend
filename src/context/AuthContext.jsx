import { createContext, useContext, useEffect, useState } from "react";
import { recupererUtilisateurConnecte, estConnecte, deconnexion } from "../services/serviceAuthentification";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (estConnecte()) {
        try {
          const data = await recupererUtilisateurConnecte();
          setUtilisateur(data);
        } catch {
          deconnexion();
        }
      }
      setChargement(false);
    };
    init();
  }, []);

  const login = (userData) => setUtilisateur(userData);

  const logout = () => {
    deconnexion();
    setUtilisateur(null);
    window.location.href = "/connexion";
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);