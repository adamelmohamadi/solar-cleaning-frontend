import api from "./api";

export const rechercherGlobal = async (query) => {
  const [projets, nettoyages] = await Promise.all([
    api.get(`projects/?search=${query}`),
    api.get(`cleanings/?search=${query}`),
  ]);
  return {
    projets: projets.data,
    nettoyages: nettoyages.data,
  };
};