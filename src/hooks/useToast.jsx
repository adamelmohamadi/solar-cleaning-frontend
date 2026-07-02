import { useCallback, useState } from "react";

export default function useToast() {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState("success");

  const showToast = useCallback((text, variant = "success") => {
    setMessage(text);
    setType(variant);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);

  const Toast = () =>
    message ? (
      <div className={`toast-toast ${type}`}>{message}</div>
    ) : null;

  return { showToast, Toast };
}
