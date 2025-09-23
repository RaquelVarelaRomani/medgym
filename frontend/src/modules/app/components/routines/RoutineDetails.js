import React, { useState } from "react";
// OJO! Importa estilos definidos en CSS
import "./RoutineDetails.css";
import { Link } from "react-router-dom";
//TUVE QUE AÑADIR ESTA PORQUE -> useParams lee los parametros de la URL (routiens/:id)
//useNavigate -> funcion para cambiar de ruta (necesitamos para la foto de perfil)
import { useParams, useNavigate } from "react-router-dom";
const RoutineDetails = () => {
  return (
    <div>
      <h2>Detalles de la rutina</h2>
      <p>Aquí los detalles</p>
    </div>
  );
};

export default RoutineDetails;