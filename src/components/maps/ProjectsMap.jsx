import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z" fill="#15803D"/>
        <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
      </svg>
    `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

const getStatutBadge = (taux) => {
  if (taux >= 80) return { label: "Bon état", color: "#15803D", bg: "#DCFCE7" };
  if (taux >= 50) return { label: "À surveiller", color: "#854F0B", bg: "#FEF9C3" };
  return { label: "Attention requise", color: "#991B1B", bg: "#FEE2E2" };
};

export default function ProjectsMap({ projets }) {
  const navigate = useNavigate();
  const projetsAvecCoords = projets.filter((p) => p.latitude && p.longitude);

  if (projetsAvecCoords.length === 0) {
    return (
      <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#5B6B5C" }}>
        Aucun projet n'a de coordonnées GPS pour le moment.
        <br />
        Ajoutez une localisation via le bouton "Localiser" dans le formulaire projet.
      </div>
    );
  }

  return (
    <MapContainer
    center={[31.7917, -7.0926]}
    zoom={5}
    style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
      {projetsAvecCoords.map((projet) => {
        const badge = { label: "Actif", color: "#15803D", bg: "#DCFCE7" };
        return (
          <Marker key={projet.id} position={[projet.latitude, projet.longitude]} icon={icon}>
            <Popup>
              <div className="map-popup">
                <span className="map-popup-title">{projet.nom}</span>

                <div className="map-popup-row">
                   {projet.localisation}
                </div>
                <div className="map-popup-row">
                   {projet.nombre_panneaux} panneaux
                </div>
                <div className="map-popup-row">
                   Tous les {projet.frequence_nettoyage} jours
                </div>

                <span
                  className="map-popup-badge"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  ● {badge.label}
                </span>

                <button
                  className="map-popup-btn"
                  onClick={() => navigate(`/projets/${projet.id}`)}
                >
                  Voir les détails
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}