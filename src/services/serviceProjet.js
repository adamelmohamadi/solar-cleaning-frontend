import api from "./api";

export const recupererProjets = async () => {
  const response = await api.get("projects/");
  return response.data;
};

export const recupererProjetParId = async (id) => {
  const response = await api.get(`projects/${id}/`);
  return response.data;
};

export const recupererNettoyagesParProjet = async (id) => {
  const response = await api.get(`cleanings/?projet=${id}`);
  return response.data;
};

export const creerProjet = async (projet) => {
  const response = await api.post("projects/", projet);
  return response.data;
};

export const modifierProjet = async (id, projet) => {
  const response = await api.put(`projects/${id}/`, projet);
  return response.data;
};

export const supprimerProjet = async (id) => {
  const response = await api.delete(`projects/${id}/`);
  return response.data;
};

export const genererPlanning = async (id) => {
  const response = await api.post(`projects/${id}/generer-planning/`);
  return response.data;
};