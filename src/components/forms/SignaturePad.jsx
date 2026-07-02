import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ onSave }) {
  const sigRef = useRef(null);
  const [vide, setVide] = useState(true);

  const handleClear = () => {
    sigRef.current.clear();
    setVide(true);
  };

  const handleEnd = () => {
    setVide(sigRef.current.isEmpty());
  };

  const handleValider = () => {
    if (sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="signature-pad-wrap">
      <div className="signature-pad-canvas">
        <SignatureCanvas
          ref={sigRef}
          penColor="#102015"
          canvasProps={{ className: "signature-canvas" }}
          onEnd={handleEnd}
        />
      </div>
      <div className="signature-pad-actions">
        <button type="button" className="text-button" onClick={handleClear}>
          Effacer
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={handleValider}
          disabled={vide}
        >
          Valider la signature
        </button>
      </div>
    </div>
  );
}