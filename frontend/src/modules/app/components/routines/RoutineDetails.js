import React, {useEffect, useState} from "react";
// OJO! Importa estilos definidos en CSS
import "./RoutineDetails.css";
import { Link } from "react-router-dom";
//TUVE QUE AÑADIR ESTA PORQUE -> useParams lee los parametros de la URL (routiens/:id)
//useNavigate -> funcion para cambiar de ruta (necesitamos para la foto de perfil)
import { useParams, useNavigate } from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import {getAuthenticatedUser, getServiceToken} from "../../../../backend/appFetch";

const RoutineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication
  useEffect(() => {
      const token = getServiceToken();
      if (!token) {
          navigate("/users/login");
          return;
      }
  }, [navigate]);

  //expandir/colapsar ejercicios
  const toggleExercise = (exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleBack = () => {
    navigate("/routines");
  };

    const loadRoutine = () => {
        setLoading(true);
        setError(null);

        routineService.getRoutine(
            id,
            (routineData) => {
                console.log("Routine info:", routineData);

                const routineObj = routineData.content
                    ? routineData.content[0]
                    : routineData;

                setRoutine(routineObj);

                routineExerciseService.getRoutineExercises(
                    id,
                    (routineExercisesPage) => {
                        console.log("Routine exercises:", routineExercisesPage);

                        const exercisesArray = routineExercisesPage.content
                            ? routineExercisesPage.content
                            : routineExercisesPage;

                        const sortedExercises = exercisesArray.sort((a, b) => a.position - b.position);

                        setExercises(sortedExercises);
                        setLoading(false);
                    },
                    (exerciseErrors) => {
                        console.error("Error loading exercises:", exerciseErrors);
                        setError("Error al cargar los ejercicios");
                        setLoading(false);
                    }
                );
            },
            (routineErrors) => {
                console.error("Error loading routine:", routineErrors);
                setError("Error al cargar la rutina");
                setLoading(false);
            }
        );
    };


    useEffect(() => {
        loadRoutine();
    }, [id]);

    if (loading) return <div className="contenedor-routine-details">Cargando rutina…</div>;
    if (error)
        return (
            <div className="contenedor-routine-details">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );

    if (!routine) return null;

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
            {exercises.map((exercise, index) => (
                <div key={exercise.id} className="ejercicio">
                  <div
                      className="header-ejercicio"
                      onClick={() => toggleExercise(exercise.id)}
                  >
                    <h3>{index + 1}. {exercise.exerciseName}</h3>
                    <span className={`flecha ${expandedExercises[exercise.id] ? 'expandida' : ''}`}>
                  &#9660; {/* flecha para desplegar */}
                </span>
                  </div>

                  {expandedExercises[exercise.id] && (
                      <div className="ejercicio-contenido">
                        <p className="descripcion-ejercicio">{exercise.exerciseDescription}</p>
                      </div>
                  )}
                </div>
            ))}
          </div>
        </div>
  );
};
export default RoutineDetails;