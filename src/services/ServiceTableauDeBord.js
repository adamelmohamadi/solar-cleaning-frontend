import api from "./api";

export const recupererStatistiques = async () => {
  const response = await api.get("dashboard/");
  return response.data;
};