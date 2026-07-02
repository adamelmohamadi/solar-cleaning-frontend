import api from "./api";

export const recupererNotifications = async () => {
  const response = await api.get("notifications/");
  return response.data;
};