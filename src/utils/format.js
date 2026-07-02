export const formatNumber = (value) => new Intl.NumberFormat("fr-FR").format(value);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
