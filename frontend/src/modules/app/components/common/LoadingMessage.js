import React from "react";
import styles from "./LoadingMessage.module.css";

const LoadingMessage = ({ text = "Cargando..." }) => {
  return (
    <div className={styles.contenedor}>
      <div className={styles["loading-message"]}>{text}</div>
    </div>
  );
};

export default LoadingMessage;
