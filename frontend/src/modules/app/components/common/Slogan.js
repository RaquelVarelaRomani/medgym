import React from "react";
import "./Slogan.css";

const Slogan = ({ className = "" }) => {
  return (
    <p className={`slogan-texto ${className}`}>
      Entrenemos tus sueños, no tus excusas.</p>
  );
};

export default Slogan;
