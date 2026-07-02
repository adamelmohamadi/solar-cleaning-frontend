import api from "./api";

export const connexion = async (username, password) => {
  const response = await api.post("token/", { username, password });
  const { access, refresh } = response.data;
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  return response.data;
};

export const deconnexion = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("utilisateur");
};

export const estConnecte = () => {
  return !!localStorage.getItem("access_token");
};

export const recupererUtilisateurConnecte = async () => {
  const response = await api.get("moi/");
  localStorage.setItem("utilisateur", JSON.stringify(response.data));
  return response.data;
};

export const getUtilisateurLocal = () => {
  const data = localStorage.getItem("utilisateur");
  return data ? JSON.parse(data) : null;
};

export const changerMotDePasse = async (ancien_mot_de_passe, nouveau_mot_de_passe) => {
  const response = await api.post("moi/changer-mot-de-passe/", {
    ancien_mot_de_passe,
    nouveau_mot_de_passe,
  });
  return response.data;
};