import api from "./api";

export const recupererNettoyages = async () => {
  const response = await api.get("cleanings/");
  return response.data;
};

export const recupererNettoyageStats = async () => {
  const response = await api.get("cleanings-stats/");
  return response.data;
};

export const recupererNettoyageParId = async (id) => {
  const response = await api.get(`cleanings/${id}/`);
  return response.data;
};

export const creerNettoyage = async (nettoyage) => {
  const response = await api.post("cleanings/", nettoyage);
  return response.data;
};

export const modifierNettoyage = async (id, nettoyage) => {
  const response = await api.put(`cleanings/${id}/`, nettoyage);
  return response.data;
};

export const mettreAJourNettoyageMainteneur = async (id, formData) => {
  const response = await api.patch(`cleanings/${id}/mainteneur/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const supprimerNettoyage = async (id) => {
  const response = await api.delete(`cleanings/${id}/`);
  return response.data;
};