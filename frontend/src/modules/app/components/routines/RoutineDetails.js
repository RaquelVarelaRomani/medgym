import React, {useEffect, useState} from "react";
// OJO! Importa estilos definidos en CSS
import styles from "./RoutineDetails.module.css";
import stylesRoutine from "./Routines.module.css";
//TUVE QUE AÑADIR ESTA PORQUE -> useParams lee los parametros de la URL (routiens/:id)
//useNavigate -> funcion para cambiar de ruta (necesitamos para la foto de perfil)
import { useParams, useNavigate } from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import LoadingMessage from "../common/LoadingMessage";


const RoutineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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

  const isClient = () => {
    if (!currentUser) return true;
    return currentUser.role === 'CLIENT';
  };
  const isTrainer = () => {
    if (!currentUser) return false;
    return currentUser.role === 'TRAINER';
  };
  const isAdmin = () => {
    if (!currentUser) return false;
    return currentUser.role === 'ADMIN';
  };

  const isRoutineCreator = (routine) => {
    if (!currentUser || !routine.trainerId) return false;
    return currentUser.id === routine.trainerId;
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
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                loadRoutine();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [id, navigate]);

    if (loading) return <LoadingMessage text="Cargando rutina..." />;
    if (error)
        return (
            <div className={styles['contenedor-routine-details']}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );

    if (!routine) return null;

  return (
      <div className={styles['contenedor-routine-details']}>
        <div className={styles['caja-routine-details']}>
          <button className={styles['boton-atras']} onClick={handleBack}>
            ←
          </button>

          <h1 className={styles['titulo-rutina']}>
            {routine.name}
            {routine.visibility === "PRIVATE" && (isRoutineCreator(routine) || isAdmin()) && (
              <span className={stylesRoutine['private-badge']}>🔒 Privado</span>
            )}
          </h1>

          <div className={styles['descripcion-rutina']}>
            <p>{routine.description}</p>
          </div>
        </div>

          <div className={styles['lista-ejercicios']}>
            {exercises.map((exercise, index) => (
                <div key={exercise.id} className={styles.ejercicio}>
                  <div
                      className={styles['header-ejercicio']}
                      onClick={() => toggleExercise(exercise.id)}
                  >
                    <h3>{index + 1}. {exercise.exerciseName}</h3>
                    <span className={`${styles.flecha} ${expandedExercises[exercise.id] ? styles.expandida : ''}`}>
                  &#9660; {/* flecha para desplegar */}
                </span>
                  </div>

                  {expandedExercises[exercise.id] && (
                      <div className={styles['ejercicio-contenido']}>
                        <p className={styles['descripcion-ejercicio']}>{exercise.exerciseDescription}</p>
                      </div>
                  )}
                </div>
            ))}
          </div>
        </div>
  );
};
export default RoutineDetails;
