import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connexion, recupererUtilisateurConnecte } from "../services/serviceAuthentification";
import { useAuth } from "../context/AuthContext";
import useToast from "../hooks/useToast";
import logo from "../assets/USElogo.png";

export default function Connexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast, Toast } = useToast();

  const validate = () => {
    const errs = { username: "", password: "" };
    let valide = true;

    if (!username.trim()) {
      errs.username = "Le nom d'utilisateur est requis.";
      valide = false;
    } else if (username.length < 3) {
      errs.username = "Minimum 3 caractères.";
      valide = false;
    }

    if (!password) {
      errs.password = "Le mot de passe est requis.";
      valide = false;
    } else if (password.length < 6) {
      errs.password = "Minimum 6 caractères.";
      valide = false;
    }

    setErrors(errs);
    return valide;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await connexion(username, password);
      const userData = await recupererUtilisateurConnecte();
      login(userData);
      navigate("/");
    }catch (erreur) {
  const status = erreur.response?.status;
  if (status === 401 || status === 400) {
    setErrors({
      username: "",
      password: "Nom d'utilisateur ou mot de passe incorrect.",
    });
  } else {
    showToast("Erreur de connexion, réessayez.", "error");
  }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="Unisystem Energy" style={{ height: 48, width: "auto", objectFit: "contain" }} />
          <div>
            <h1>Unisystem Energy</h1>
            <p>Connexion au portail de nettoyage</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Nom d'utilisateur</label>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: "" }));
              }}
              placeholder="Entrez votre nom d'utilisateur"
              autoComplete="username"
              style={errors.username ? { borderColor: "#DC2626" } : {}}
            />
            {errors.username && <span className="input-error">{errors.username}</span>}
          </div>

          <div className="form-row">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              style={errors.password ? { borderColor: "#DC2626" } : {}}
            />
            {errors.password && <span className="input-error">{errors.password}</span>}
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <Toast />
      </section>
    </div>
  );
}