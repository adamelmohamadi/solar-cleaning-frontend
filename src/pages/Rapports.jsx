import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { recupererRapports } from "../services/serivceRapport";
import Loader from "../components/ui/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "../assets/logo_base64.txt?raw";

const formatTaux = (taux) => `${taux}%`;

const exporterPDF = (data) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("fr-FR");

  doc.addImage(`data:image/png;base64,${logoBase64.trim()}`, "PNG", 14, 10, 30, 15);

  doc.setFontSize(16);
  doc.setTextColor(21, 128, 61);
  doc.text("Unisystem Energy", 48, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Rapport de nettoyage des panneaux solaires", 48, 25);
  doc.text(`Généré le ${today}`, 48, 31);

  doc.setDrawColor(225, 232, 220);
  doc.line(14, 37, 196, 37);

  doc.setFontSize(11);
  doc.setTextColor(16, 32, 21);
  doc.text("Indicateurs clés", 14, 46);

  autoTable(doc, {
    startY: 50,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Taux d'avancement global", formatTaux(data.kpis.taux_avancement)],
      ["Nettoyages terminés", String(data.kpis.termines)],
      ["Nettoyages en retard", String(data.kpis.en_retard)],
      ["Réalisés ce mois", String(data.kpis.ce_mois)],
    ],
    theme: "grid",
    headStyles: { fillColor: [21, 128, 61], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: { 1: { halign: "center" } },
  });

  doc.setFontSize(11);
  doc.setTextColor(16, 32, 21);
  doc.text("Avancement par projet", 14, doc.lastAutoTable.finalY + 12);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [["Projet", "Localisation", "Terminés", "Total", "Taux"]],
    body: data.avancement_projets.map((p) => [
      p.nom, p.localisation, String(p.termines), String(p.total), `${p.taux}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [21, 128, 61], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: { 4: { halign: "center" } },
  });

  if (data.retards.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(16, 32, 21);
    doc.text("Nettoyages en retard", 14, doc.lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Projet", "Date prévue", "Commentaire"]],
      body: data.retards.map((r) => [r.projet, r.date_prevue, r.commentaire]),
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
    });
  }

  if (data.historique.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(16, 32, 21);
    doc.text("Historique des nettoyages réalisés", 14, doc.lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Projet", "Date prévue", "Date réalisée", "Commentaire"]],
      body: data.historique.map((h) => [h.projet, h.date_prevue, h.date_realisee, h.commentaire]),
      theme: "grid",
      headStyles: { fillColor: [21, 128, 61], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
    });
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} / ${pageCount} — Unisystem Energy`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`rapport-nettoyage-${today.replace(/\//g, "-")}.pdf`);
};

export default function Rapports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const result = await recupererRapports();
        setData(result);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <p className="page-label">Rapports</p>
          <h2>Historique et analyses</h2>
        </div>
        {data && (
          <button className="primary-button" onClick={() => exporterPDF(data)}>
            Exporter en PDF
          </button>
        )}
      </div>

      {loading ? <Loader /> : !data ? (
        <p style={{ color: "#5B6B5C" }}>Impossible de charger les rapports.</p>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Taux d'avancement</span>
              <span className="kpi-value kpi-success">{formatTaux(data.kpis.taux_avancement)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Nettoyages terminés</span>
              <span className="kpi-value">{data.kpis.termines}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">En retard</span>
              <span className="kpi-value kpi-danger">{data.kpis.en_retard}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Réalisés ce mois</span>
              <span className="kpi-value kpi-warning">{data.kpis.ce_mois}</span>
            </div>
          </div>

          <div className="rapports-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>

            {/* Avancement par projet */}
            <div className="table-card">
              <div className="table-header">
                <h2>Avancement par projet</h2>
              </div>
              {data.avancement_projets.length === 0 ? (
                <p style={{ padding: "1rem 1.25rem", color: "#5B6B5C", fontSize: 14 }}>Aucun projet.</p>
              ) : (
                <>
                  <table className="project-table mobile-hide">
                    <thead>
                      <tr>
                        <th>Projet</th>
                        <th>Terminés</th>
                        <th>Total</th>
                        <th>Taux</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.avancement_projets.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500 }}>{p.nom}</td>
                          <td>{p.termines}</td>
                          <td>{p.total}</td>
                          <td>
                            <div className="progress-bar-wrap">
                              <div className="progress-bar-fill" style={{ width: `${p.taux}%` }} />
                            </div>
                            <span style={{ fontSize: 12, color: "#5B6B5C" }}>{p.taux}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mobile-card-list mobile-only">
                    {data.avancement_projets.map((p) => (
                      <div key={p.id} className="mobile-card">
                        <span className="mobile-card-title">{p.nom}</span>
                        <div className="mobile-card-row">
                          <span>Terminés</span>
                          <span>{p.termines} / {p.total}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span>Taux</span>
                          <span style={{ color: "#15803D", fontWeight: 500 }}>{p.taux}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Nettoyages en retard */}
            <div className="table-card">
              <div className="table-header">
                <h2>Nettoyages en retard</h2>
                <span>{data.retards.length} éléments</span>
              </div>
              {data.retards.length === 0 ? (
                <p style={{ padding: "1rem 1.25rem", color: "#5B6B5C", fontSize: 14 }}>Aucun retard.</p>
              ) : (
                <>
                  <table className="project-table mobile-hide">
                    <thead>
                      <tr>
                        <th>Projet</th>
                        <th>Date prévue</th>
                        <th>Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.retards.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 500 }}>{r.projet}</td>
                          <td style={{ color: "#DC2626" }}>{r.date_prevue}</td>
                          <td style={{ color: "#5B6B5C" }}>{r.commentaire}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mobile-card-list mobile-only">
                    {data.retards.map((r) => (
                      <div key={r.id} className="mobile-card">
                        <span className="mobile-card-title">{r.projet}</span>
                        <div className="mobile-card-row">
                          <span>Date prévue</span>
                          <span style={{ color: "#DC2626" }}>{r.date_prevue}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span>Commentaire</span>
                          <span>{r.commentaire}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="table-card">
            <div className="table-header">
              <h2>Historique des nettoyages réalisés</h2>
              <span>{data.historique.length} éléments</span>
            </div>
            {data.historique.length === 0 ? (
              <p style={{ padding: "1rem 1.25rem", color: "#5B6B5C", fontSize: 14 }}>
                Aucun nettoyage terminé pour le moment.
              </p>
            ) : (
              <>
                <div className="table-scroll mobile-hide">
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th>Projet</th>
                        <th>Date prévue</th>
                        <th>Date réalisée</th>
                        <th>Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.historique.map((h) => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 500 }}>{h.projet}</td>
                          <td>{h.date_prevue}</td>
                          <td style={{ color: "#15803D" }}>{h.date_realisee}</td>
                          <td style={{ color: "#5B6B5C" }}>{h.commentaire}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mobile-card-list mobile-only">
                  {data.historique.map((h) => (
                    <div key={h.id} className="mobile-card">
                      <span className="mobile-card-title">{h.projet}</span>
                      <div className="mobile-card-row">
                        <span>Date prévue</span>
                        <span>{h.date_prevue}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span>Date réalisée</span>
                        <span style={{ color: "#15803D" }}>{h.date_realisee}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span>Commentaire</span>
                        <span>{h.commentaire}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}