import { Search, Bell, LogOut, X, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recupererNotifications } from "../../services/serviceNotification";
import { rechercherGlobal } from "../../services/serviceRecherche";

export default function Navbar({ onMenuClick }) {
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();
  const [nbNotifs, setNbNotifs] = useState(0);
  const [query, setQuery] = useState("");
  const [resultats, setResultats] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recherching, setRecherching] = useState(false);
  const searchRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await recupererNotifications();
        setNbNotifs(data.en_retard + data.a_venir);
      } catch {
        setNbNotifs(0);
      }
    };
    charger();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResultats(null);
      setShowDropdown(false);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setRecherching(true);
      try {
        const data = await rechercherGlobal(query);
        setResultats(data);
        setShowDropdown(true);
      } catch {
        setResultats(null);
      } finally {
        setRecherching(false);
      }
    }, 350);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (path) => {
    setQuery("");
    setShowDropdown(false);
    navigate(path);
  };

  const initiales = utilisateur
    ? (utilisateur.first_name?.[0] || utilisateur.username?.[0] || "U").toUpperCase()
    : "U";

  const nomAffiche = utilisateur?.first_name
    ? `${utilisateur.first_name} ${utilisateur.last_name || ""}`.trim()
    : utilisateur?.username || "Utilisateur";

  const totalResultats = (resultats?.projets?.length || 0) + (resultats?.nettoyages?.length || 0);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6 lg:py-4">
      <div className="flex items-center gap-3 flex-1">
        {/* Bouton hamburger mobile */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-sm" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => resultats && setShowDropdown(true)}
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-8 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {showDropdown && (
            <div className="search-dropdown">
              {recherching ? (
                <div className="search-dropdown-empty">Recherche en cours...</div>
              ) : totalResultats === 0 ? (
                <div className="search-dropdown-empty">Aucun résultat pour "{query}"</div>
              ) : (
                <>
                  {resultats?.projets?.length > 0 && (
                    <div className="search-dropdown-section">
                      <span className="search-dropdown-label">Projets</span>
                      {resultats.projets.map((p) => (
                        <button
                          key={p.id}
                          className="search-dropdown-item"
                          onClick={() => handleSelect(`/projets/${p.id}`)}
                        >
                          <span className="search-item-title">{p.nom}</span>
                          <span className="search-item-sub">{p.localisation}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {resultats?.nettoyages?.length > 0 && (
                    <div className="search-dropdown-section">
                      <span className="search-dropdown-label">Nettoyages</span>
                      {resultats.nettoyages.map((n) => (
                        <button
                          key={n.id}
                          className="search-dropdown-item"
                          onClick={() => handleSelect(`/nettoyages/${n.id}/modifier`)}
                        >
                          <span className="search-item-title">{n.projet_nom || "—"}</span>
                          <span className="search-item-sub">{n.date_prevue} · {n.statut}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {nbNotifs > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {nbNotifs > 99 ? "99+" : nbNotifs}
            </span>
          )}
        </button>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/profil")}
          title="Mon profil"
        >
          <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initiales}
          </div>
          <span className="hidden lg:block text-sm font-medium text-foreground">{nomAffiche}</span>
        </div>

        <button
          onClick={logout}
          title="Se déconnecter"
          className="flex items-center gap-2 rounded-lg px-2 py-2 lg:px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:block">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}