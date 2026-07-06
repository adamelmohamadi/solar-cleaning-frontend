import api from "./api";

export const recupererUtilisateurs = async () => {
  const response = await api.get("utilisateurs/");
  return response.data;
};

export const creerUtilisateur = async (data) => {
  const response = await api.post("utilisateurs/creer-mainteneur/", data);
  return response.data;
};

export const supprimerUtilisateur = async (id) => {
  const response = await api.delete(`utilisateurs/${id}/`);
  return response.data;
};

export const recupererClients = async () => {
  const response = await api.get("clients/");
  return response.data;
};

export const resetPasswordClient = async (id) => {
  const response = await api.post(`clients/${id}/reset-password/`);
  return response.data;
};