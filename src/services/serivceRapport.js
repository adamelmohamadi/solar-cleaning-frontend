import api from "./api";

export const recupererRapports = async () => {
  const response = await api.get("rapports/");
  return response.data;
};