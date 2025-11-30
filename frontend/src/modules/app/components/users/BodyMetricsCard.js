import React, { useState } from "react";
import styles from "./BodyMetricsCard.module.css";
import Popup from "../common/popup/Popup";
import { updateBodyMetrics, clearBodyMetrics } from "../../../../backend/userService";
import PropTypes  from "prop-types";

const BodyMetricsCard = ({
  userId,
  initialWeightKg,
  initialHeightCm,
  initialGender,
  initialBmi,
  onSaved,
  onClose,
}) => {
  const [weightKg, setWeightKg] = useState(initialWeightKg ?? "");
  const [heightCm, setHeightCm] = useState(initialHeightCm ?? "");
  const [gender, setGender] = useState(initialGender ?? "");
  const [bmi, setBmi] = useState(initialBmi ?? null);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleCalculateBmi = () => {
    const w = parseFloat(weightKg);
    const hCm = parseFloat(heightCm);
    if (!w || !hCm || hCm <= 0) {
      setError("Para calcular el IMC, introduce peso (kg) y altura (cm) válidos.");
      return;
    }
    const h = hCm / 100;
    const value = w / (h * h);
    setBmi(Number(value.toFixed(2)));
    setError("");
  };

  const handleClearMetrics = () => {
    clearBodyMetrics(
      userId,
      () => {
        setWeightKg("");
        setHeightCm("");
        setGender("");
        setBmi(null);
        setPopupMessage("Métricas eliminadas");
        setShowPopup(true);
        onSaved?.({ weightKg: null, heightCm: null, gender: null, bmi: null });
      },
      (err) => {
        console.error("Error al eliminar métricas:", err);
        setError("No se pudieron eliminar las métricas corporales.");
      }
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    const hasAnyMetric = !!weightKg || !!heightCm || !!gender;
    if (!hasAnyMetric) {
      handleClearMetrics();
      return;
    }

    updateBodyMetrics(
      userId,
      {
        weightKg: weightKg === "" ? null : parseFloat(weightKg),
        heightCm: heightCm === "" ? null : parseFloat(heightCm),
        gender: gender || null,
      },
      () => {
        setPopupMessage("Métricas guardadas");
        setShowPopup(true);
        onSaved?.({
          weightKg: weightKg === "" ? null : parseFloat(weightKg),
          heightCm: heightCm === "" ? null : parseFloat(heightCm),
          gender: gender || null,
          bmi,
        });
      },
      (err) => {
        console.error("Error al actualizar métricas:", err);
        setError("No se pudieron guardar las métricas corporales.");
      }
    );
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSave}>
        <h3 className={styles.title}>Métricas corporales</h3>

        {error && <p className={styles.error}>{error}</p>}

        <label htmlFor="weightKg">Peso (kg)</label>
        <input
          type="number"
          id="weightKg"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={weightKg}
          placeholder="Ej. 72.5"
          onChange={(e) => setWeightKg(e.target.value)}
        />

        <label htmlFor="heightCm">Altura (cm)</label>
        <input
          type="number"
          id="heightCm"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={heightCm}
          placeholder="Ej. 175"
          onChange={(e) => setHeightCm(e.target.value)}
        />

        <label htmlFor="gender">Género</label>
        <select
          id="gender"
          className={styles.select}
          value={gender || ""}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">— Sin especificar —</option>
          <option value="MALE">Hombre</option>
          <option value="FEMALE">Mujer</option>
          <option value="OTHER">Otro</option>
          <option value="UNSPECIFIED">No especificar</option>
        </select>

        <div className={styles.row}>
          <button type="button" className={styles.calcBtn} onClick={handleCalculateBmi}>
            Calcular IMC
          </button>
          <button type="button" className={styles.clearBtn} onClick={handleClearMetrics}>
            Eliminar métricas
          </button>
        </div>

        <div className={styles.bmiLine}>
          <strong>IMC: </strong>
          <span>{bmi != null ? bmi : "—"}</span>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>Guardar</button>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cerrar</button>
        </div>
      </form>

      <Popup
        text={popupMessage}
        show={showPopup}
        onOk={() => {
          setShowPopup(false);
          onClose?.();
        }}
      />
    </div>
  );
};

export default BodyMetricsCard;

BodyMetricsCard.propTypes = {
  userId: PropTypes.string.isRequired,
  initialWeightKg: PropTypes.number,
  initialHeightCm: PropTypes.number,
  initialGender: PropTypes.string,
  initialBmi: PropTypes.number,
  onSaved: PropTypes.func,
  onClose: PropTypes.func,
};