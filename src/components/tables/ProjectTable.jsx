const getStatutClass = (statut) => {
  switch (statut) {
    case "EN_COURS": return "status-badge status-success";
    case "TERMINE": return "status-badge status-success";
    case "EN_RETARD": return "status-badge status-warning";
    case "PLANIFIE": return "status-badge status-muted";
    default: return "status-badge status-muted";
  }
};

const getStatutLabel = (statut) => {
  switch (statut) {
    case "EN_COURS": return "En cours";
    case "TERMINE": return "Terminé";
    case "EN_RETARD": return "En retard";
    case "PLANIFIE": return "Planifié";
    default: return statut || "—";
  }
};

export default function ProjectTable({ projects, onView, onEdit, onDelete, estAdmin }) {
  return (
    <div className="table-card">
      <div className="table-header">
        <h2>Projets actifs</h2>
        <span>{projects.length} éléments</span>
      </div>

      {/* Vue tableau desktop */}
      <div className="table-scroll mobile-hide">
        <table className="project-table">
          <thead>
            <tr>
              <th>Projet</th>
              <th>Localisation</th>
              <th>Panneaux</th>
              <th>Fréquence</th>
              <th>Statut</th>
              {estAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td
                  style={{ fontWeight: 500, cursor: "pointer", color: "#15803D" }}
                  onClick={() => onView(project.id)}
                >
                  {project.nom}
                </td>
                <td>{project.localisation}</td>
                <td>{project.nombre_panneaux}</td>
                <td>{project.frequence_nettoyage} jours</td>
                <td>
                  <span className={getStatutClass(project.statut)}>
                    {getStatutLabel(project.statut)}
                  </span>
                </td>
                {estAdmin && (
                  <td>
                    <button className="text-button" onClick={() => onEdit(project.id)}>Modifier</button>
                    <button className="text-button danger" onClick={() => onDelete(project.id)}>Supprimer</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue cartes mobile */}
      <div className="mobile-card-list mobile-only">
        {projects.map((project) => (
          <div key={project.id} className="mobile-card">
            <span
              className="mobile-card-title"
              style={{ color: "#15803D", cursor: "pointer" }}
              onClick={() => onView(project.id)}
            >
              {project.nom}
            </span>
            <div className="mobile-card-row">
              <span>Localisation</span>
              <span>{project.localisation}</span>
            </div>
            <div className="mobile-card-row">
              <span>Panneaux</span>
              <span>{project.nombre_panneaux}</span>
            </div>
            <div className="mobile-card-row">
              <span>Fréquence</span>
              <span>{project.frequence_nettoyage} jours</span>
            </div>
            <div className="mobile-card-row">
              <span>Statut</span>
              <span className={getStatutClass(project.statut)}>
                {getStatutLabel(project.statut)}
              </span>
            </div>
            {estAdmin && (
              <div className="mobile-card-actions">
                <button className="text-button" onClick={() => onEdit(project.id)}>Modifier</button>
                <button className="text-button danger" onClick={() => onDelete(project.id)}>Supprimer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}