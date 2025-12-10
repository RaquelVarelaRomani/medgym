import React, {useEffect, useState} from "react";
import styles from "./RoutineDetails.module.css";
import stylesRoutine from "./Routines.module.css";
import { useParams, useNavigate } from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import LoadingMessage from "../common/LoadingMessage";
import * as workoutService from "../../../../backend/workoutService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import {getEquipmentText, getMuscleGroupsText} from "../../util/enumConversor";


const RoutineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showActiveWorkoutPopup, setShowActiveWorkoutPopup] = useState(false);
  const isTrainer = () => currentUser?.role === "TRAINER";

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
  const isAdmin = () => {
    if (!currentUser) return false;
    return currentUser.role === 'ADMIN';
  };

  const isRoutineCreator = (routine) => {
    if (!currentUser || !routine.trainerId) return false;
    return currentUser.id === routine.trainerId;
  };

  const canEditRoutine = (routine) =>
      isAdmin() || (isTrainer() && isRoutineCreator(routine));

  const handleEditRoutine = () => {
      navigate(`/routines/edit/${routine.id}`);
  };


    const loadRoutineExercises = (routineId) => {
        const onSuccess = (routineExercisesPage) => {
            console.log("Routine exercises:", routineExercisesPage);

            const exercisesArray = routineExercisesPage.content
                ? routineExercisesPage.content
                : routineExercisesPage;

            const sortedExercises = exercisesArray.sort(
                (a, b) => a.position - b.position
            );

            setExercises(sortedExercises);
            setLoading(false);
        };

        const onError = (exerciseErrors) => {
            console.error("Error loading exercises:", exerciseErrors);
            setError("Error al cargar los ejercicios");
            setLoading(false);
        };

        routineExerciseService.getRoutineExercises(
            routineId,
            onSuccess,
            onError
        );
    };

    const loadRoutine = () => {
        setLoading(true);
        setError(null);

        const onRoutineSuccess = (routineData) => {
            console.log("Routine info:", routineData);

            const routineObj = routineData.content
                ? routineData.content[0]
                : routineData;

            setRoutine(routineObj);
            loadRoutineExercises(id);
        };

        const onRoutineError = (routineErrors) => {
            console.error("Error loading routine:", routineErrors);
            setError("Error al cargar la rutina");
            setLoading(false);
        };

        routineService.getRoutine(id, onRoutineSuccess, onRoutineError);
    };

    const checkActiveWorkout = () => {
    workoutService.getWorkouts(
      (data) => {
        const active = data.find((w) => !w.endTime);
        if (active) setActiveWorkout(active);
      },
      (error) => console.error("Error comprobando entrenamientos activos", error)
    );
  };

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                loadRoutine();
                if (authenticatedUser.user.role === "CLIENT") checkActiveWorkout();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [id, navigate]);

    
    const handleStartWorkout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeWorkout) {
      // Mostrar popup si ya hay uno activo
      setShowActiveWorkoutPopup(true);
      return;
    }
    workoutService.startWorkout(
      routine.id,
      (workoutData) => {
        console.log("Workout iniciado:", workoutData);
        navigate(`/workouts/session/${workoutData.id}`);
      },
      (error) => {
        console.error("Error al iniciar entrenamiento:", error);
        alert("No se pudo iniciar el entrenamiento. Inténtelo de nuevo.");
      }
    );
  };

    if (loading) return <LoadingMessage text="Cargando rutina..." />;
    if (error)
        return (
            <div className={styles['contenedor-routine-details']}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );

    if (!routine) return null;

  const trainerFullName =
      `${routine.trainerName ?? ""} ${routine.trainerSurname ?? ""}`.trim() ||
      "Entrenador desconocido";

   return (
    <div className={styles["contenedor-routine-details"]}>
      <div className={styles["caja-routine-details"]}>
        <button className={styles["boton-atras"]} onClick={handleBack}>
          ←
        </button>

        <div className={styles["titulo-con-boton"]}>
          <h1 className={styles["titulo-rutina"]}>
            {routine.name}
            {routine.visibility === "PRIVATE" &&
              (isRoutineCreator(routine) || isAdmin()) && (
                <span className={stylesRoutine["private-badge"]}>
                  🔒 Privado
                </span>
              )}
          </h1>

          <div className={styles["acciones-rutina"]}>
            {isClient() && (
              <button
                className={stylesRoutine["boton-empezar-redondo"]}
                onClick={handleStartWorkout}
              >
                Empezar
              </button>
            )}

            {canEditRoutine(routine) && (
              <button
                type="button"
                className={stylesRoutine["boton-editar"]}
                onClick={handleEditRoutine}
              >
                Editar
              </button>
            )}
          </div>
         </div>

        <div className={styles["trainer-line"]}>
          Generado por <strong>{trainerFullName}</strong>
        </div>

        <div className={styles["descripcion-rutina"]}>
          <p>{routine.description}</p>
        </div>
      </div>

      <div className={styles["lista-ejercicios"]}>
        {exercises.map((exercise, index) => (
          <div key={exercise.id} className={styles.ejercicio}>
              <button
                  type="button"
                  className={styles["header-ejercicio"]}
                  onClick={() => toggleExercise(exercise.id)}
              >
                  <h3>
                      {index + 1}. {exercise.exerciseName}
                  </h3>

                  {exercise.blocked && (
                      <button
                          type="button"
                          className={styles["warning-badge"]}
                          onClick={(e) => e.stopPropagation()}
                          title={
                              isAdmin()
                                  ? "Has bloqueado este ejercicio."
                                  : "¡Atención! Este ejercicio ha sido bloqueado. Por favor, realízalo con precaución o consulta a tu entrenador."
                          }
                      >
                          <span aria-hidden className={styles["warning-icon"]}>⚠️</span>
                          <span className={styles["warning-text"]}>
                              {isAdmin()
                                    ? "Has bloqueado este ejercicio."
                                    : "¡Atención! Este ejercicio ha sido bloqueado. Por favor, realízalo con precaución o consulta a tu entrenador."}
                          </span>
                      </button>
                  )}

                  <span
                      className={`${styles.flecha} ${
                          expandedExercises[exercise.id] ? styles.expandida : ""
                      }`}
                  >
                      ▼
                  </span>
              </button>
              {expandedExercises[exercise.id] && (
              <div className={styles["ejercicio-contenido"]}>
                <div className={styles["detalles-ejercicio"]}>
                  <p><strong>Descripción:</strong> {exercise.exerciseDescription}</p>
                  <p><strong>Grupo muscular:</strong> {getMuscleGroupsText(exercise.muscleGroup) || "No especificado"}</p>
                  <p><strong>Equipamiento:</strong> {getEquipmentText(exercise.equipment) || "No especificado"}</p>
                </div>

                <div className={styles["imagen-ejercicio"]}>
                  {exercise.image ? (
                    <img
                      src={
                        exercise.image.startsWith("data:")
                          ? exercise.image
                          : `data:image/jpeg;base64,${exercise.image}`
                      }
                      alt={exercise.exerciseName}
                    />
                  ) : (
                    <img
                      src={process.env.PUBLIC_URL + "/assets/default-exercise.jpg"}
                      alt="Imagen por defecto"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmationPopup
        show={showActiveWorkoutPopup}
        text="Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?"
        okText="Ir al entrenamiento activo"
        cancelText="Cancelar"
        onOk={() => {
          setShowActiveWorkoutPopup(false);
          if (activeWorkout)
            navigate(`/workouts/session/${activeWorkout.id}`);
        }}
        onCancel={() => setShowActiveWorkoutPopup(false)}
      />
    </div>
  );
};

export default RoutineDetails;