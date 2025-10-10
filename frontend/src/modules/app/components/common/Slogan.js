import React from "react";
import styles from "./Slogan.module.css";

const Slogan = ({ className = "" }) => {
  return (
    <p className={`${styles['slogan-texto']} ${className}`}>
      Entrenemos tus sueños, no tus excusas.</p>
  );
};

export default Slogan;
