import React, { useState } from "react";
// OJO! Importa estilos definidos en CSS
import "./RoutineDetails.css";
import { Link } from "react-router-dom";
//TUVE QUE AÑADIR ESTA PORQUE -> useParams lee los parametros de la URL (routiens/:id)
//useNavigate -> funcion para cambiar de ruta (necesitamos para la foto de perfil)
import { useParams, useNavigate } from "react-router-dom";

const RoutineDetails = () => {
  const navigate = useNavigate();
  const [expandedExercises, setExpandedExercises] = useState({});

  //datos de ejemplo mientras no se conecta al backend. BORRAR LUEGO!
  const routine = {
    id: 3,
    name: "Entrenamiento n° 3",
    description: "Ejemplo de descripción del entrenamiento n°3.",
    exercises: [
      {
        id: 1,
        title: "Título ejercicio1",
        description: "Ejemplo de descripción del ejercicio n°1.",
      },
      {
        id: 2,
        title: "Título ejercicio2",
        description: "Ejemplo de descripción del ejercicio n°2.",
      },
    ]
  };

  //expandir/colapsar ejercicios
  const toggleExercise = (exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleBack = () => {
    navigate("/routines"); //comprobar ruta
  };

  return (
      <div className="contenedor-routine-details">
        <div className="caja-routine-details">
          <button className="boton-atras" onClick={handleBack}>
            ←
          </button>

          <h1 className="titulo-rutina">{routine.name}</h1>

          <div className="descripcion-rutina">
            <p>{routine.description}</p>
          </div>
        </div>

          <div className="lista-ejercicios">
            {routine.exercises.map((exercise) => (
                <div key={exercise.id} className="ejercicio">
                  <div
                      className="header-ejercicio"
                      onClick={() => toggleExercise(exercise.id)}
                  >
                    <h3>{exercise.title}</h3>
                    <span className={`flecha ${expandedExercises[exercise.id] ? 'expandida' : ''}`}>
                  &#9660; {/* flecha para desplegar */}
                </span>
                  </div>

                  {expandedExercises[exercise.id] && (
                      <div className="ejercicio-contenido">
                        <p className="descripcion-ejercicio">{exercise.description}</p>
                      </div>
                  )}
                </div>
            ))}
          </div>
        </div>
  );
};
export default RoutineDetails;