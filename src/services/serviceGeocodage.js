export const geocoderAdresse = async (adresse) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse + ", Maroc")}&limit=1`;
  
  const response = await fetch(url, {
    headers: {
      "Accept-Language": "fr",
    },
  });
  
  const data = await response.json();
  
  if (data.length === 0) {
    return null;
  }
  
  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    nomComplet: data[0].display_name,
  };
};