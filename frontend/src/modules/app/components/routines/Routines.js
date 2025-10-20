// src/modules/app/components/routines/Routines.js
import React, { useEffect, useRef, useState } from "react";
import styles from "./Routines.module.css";
import { Link, useNavigate } from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import {
  followTrainer,
  unfollowTrainer,
  getFollowedTrainers,
} from "../../../../backend/userFollowService";
import * as workoutService from "../../../../backend/workoutService";

const Routines = () => {
  const navigate = useNavigate();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null); 
  const [showActiveWorkoutPopup, setShowActiveWorkoutPopup] = useState(false); 
  const [filters, setFilters] = useState({
    difficulty: "",
    muscleGroup: "",
    trainerId: "",
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const filterRefs = useRef({});
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [trainerToUnfollow, setTrainerToUnfollow] = useState(null);
  const [availableMuscleGroups] = useState([
    "Bíceps",
    "Core",
    "Espalda",
    "Full body",
    "Hombros",
    "Pectorales",
    "Piernas",
    "Tríceps",
  ]);

  useEffect(() => {
    tryLoginFromServiceToken(
      (authenticatedUser) => {
        const user = authenticatedUser.user;
        setCurrentUser(user);
        loadAllTrainers();
        loadRoutines();
        if (user.role === "CLIENT") {
          loadFollowing(user.id);
          checkActiveWorkout(); 
        }
      },
      () => {
        console.error("Token inválido o expirado");
        navigate("/users/login");
      }
    );
  }, [navigate]);

  
  const checkActiveWorkout = () => {
    workoutService.getWorkouts(
      (data) => {
        const active = data.find((w) => !w.endTime);
        if (active) setActiveWorkout(active);
      },
      (error) => console.error("Error comprobando entrenamientos activos", error)
    );
  };

  const loadFollowing = (userId) => {
    getFollowedTrainers(
      userId,
      (data) => {
        const trainerIds = data.map((f) => f.trainerId);
        setFollowing(trainerIds);
      },
      (err) => console.error("Error cargando follows", err)
    );
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        openDropdown &&
        filterRefs.current[openDropdown] &&
        !filterRefs.current[openDropdown].contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [openDropdown]);

  const loadAllTrainers = () => {
    routineService.getAllRoutines(
      (data) => {
        const trainers = data
          .filter((r) => r.trainerId && r.trainerName)
          .map((r) => ({
            id: r.trainerId,
            name: `${r.trainerName || ""} ${r.trainerSurname || ""}`.trim(),
          }))
          .filter((t, i, self) => i === self.findIndex((x) => x.id === t.id));
        setAvailableTrainers(trainers);
      },
      (errors) => console.error("Error loading trainers:", errors)
    );
  };

  const loadRoutines = () => {
    setLoading(true);
    const hasFilters =
      filters.difficulty || filters.muscleGroup || filters.trainerId;

    const handleSuccess = (data) => {
      setRoutines(data);
      setLoading(false);
    };

    const handleError = (errors) => {
      console.error("Error loading routines:", errors);
      setError(errors.globalError || "Error al cargar los entrenamientos");
      setLoading(false);
    };

    if (hasFilters) {
      routineService.getFilteredRoutines(
        filters.muscleGroup || null,
        filters.difficulty || null,
        filters.trainerId || null,
        handleSuccess,
        handleError
      );
    } else {
      routineService.getAllRoutines(handleSuccess, handleError);
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case "BEGINNER":
        return "Principiante";
      case "INTERMEDIATE":
        return "Intermedia";
      case "ADVANCED":
        return "Avanzada";
      default:
        return difficulty;
    }
  };

  const handleFollowToggle = (trainerId) => {
    if (following.includes(trainerId)) {
      setTrainerToUnfollow(trainerId);
    } else {
      followTrainer(
        trainerId,
        () => setFollowing((prev) => [...prev, trainerId]),
        () => console.error("Error al seguir entrenador")
      );
    }
  };

  const isTrainer = () => currentUser?.role === "TRAINER";
  const isAdmin = () => currentUser?.role === "ADMIN";
  const isClient = () => currentUser?.role === "CLIENT";
  const isRoutineCreator = (routine) =>
    currentUser && routine.trainerId === currentUser.id;

  const handleEdit = (e, routineId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/routines/edit/${routineId}`);
  };

  const handleDelete = (routineId) => {
    routineService.deleteRoutine(
      routineId,
      () => {
        setRoutines((prev) => prev.filter((r) => r.id !== routineId));
        window.dispatchEvent(new CustomEvent("routineDeleted"));
      },
      (error) => {
        console.error("Error deleting routine:", error);
        alert("No se pudo eliminar la rutina. Intenta de nuevo.");
      }
    );
  };

  const handleAddRoutine = () => navigate("/routines/new");

 
  const handleStartWorkout = (e, routineId) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeWorkout) {
      setShowActiveWorkoutPopup(true);
      return;
    }

    workoutService.startWorkout(
      routineId,
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

  if (loading)
    return (
      <div className={styles.contenedor}>
        <div className={styles["loading-message"]}>
          Cargando entrenamientos...
        </div>
      </div>
    );

  if (error)
    return (
      <div className={styles.contenedor}>
        <div className={styles["error-message"]}>
          {error}
          <button onClick={loadRoutines} className={styles["retry-button"]}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );

  return (
    <div className={styles.contenedor}>
      <div className={styles["routines-header"]}>
        <h2>Entrenamientos</h2>
        <button
          className={styles["filter-toggle-button"]}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtrar
        </button>
      </div>

      <div className={styles["lista-rutinas"]}>
        {routines.length === 0 ? (
          <div className={styles["no-results"]}>
            No se encontraron rutinas con los filtros seleccionados.
          </div>
        ) : (
          routines.map((routine) => (
            <Link
              to={`/routines/${routine.id}`}
              key={routine.id}
              className={styles["caja-rutina"]}
            >
              <div className={styles["header-rutina"]}>
                <h3 className={styles["routine-title"]}>
                  {routine.name}
                  {routine.visibility === "PRIVATE" &&
                    (isRoutineCreator(routine) || isAdmin()) && (
                      <span className={styles["private-badge"]}>🔒 Privado</span>
                    )}
                </h3>

                {isClient() && (
                  <button
                    className={styles["boton-empezar-redondo"]}
                    onClick={(e) => handleStartWorkout(e, routine.id)}
                  >
                    Empezar
                  </button>
                )}
              </div>

              <div className={styles["trainer-info"]}>
                <p className={styles["trainer-name"]}>
                  Generado por{" "}
                  {`${routine.trainerName ?? ""} ${
                    routine.trainerSurname ?? ""
                  }`.trim() || "Entrenador desconocido"}
                </p>

                {isClient() && routine.trainerId && (
                  <button
                    className={`${styles["filter-toggle-button"]} ${styles["follow-btn"]}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFollowToggle(routine.trainerId);
                    }}
                  >
                    {following.includes(routine.trainerId)
                      ? "Dejar de seguir al creador"
                      : "Seguir al creador"}
                  </button>
                )}
              </div>

              {routine.difficulty && (
                <span
                  className={`${styles["routine-difficulty"]} ${
                    styles[routine.difficulty.toLowerCase()]
                  }`}
                >
                  {getDifficultyText(routine.difficulty)}
                </span>
              )}

              {((isTrainer() && isRoutineCreator(routine)) || isAdmin()) && (
                <div>
                  <button
                    className={styles["boton-editar"]}
                    onClick={(e) => handleEdit(e, routine.id)}
                  >
                    Editar
                  </button>
                  <button
                    className={styles["boton-eliminar"]}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRoutineToDelete(routine.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {(isTrainer() || isAdmin()) && (
        <button className={styles["boton-crear"]} onClick={handleAddRoutine}>
          +
        </button>
      )}

     
      <ConfirmationPopup
        text="Seguro que quieres eliminar esta rutina?"
        show={routineToDelete !== null}
        onOk={() => {
          if (routineToDelete) handleDelete(routineToDelete);
          setRoutineToDelete(null);
        }}
        onCancel={() => setRoutineToDelete(null)}
      />

      
      <ConfirmationPopup
        show={showActiveWorkoutPopup}
        text="Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?"
        okText="Ir al entrenamiento activo"
        cancelText="Cancelar"
        onOk={() => {
          setShowActiveWorkoutPopup(false);
          if (activeWorkout) navigate(`/workouts/session/${activeWorkout.id}`);
        }}
        onCancel={() => setShowActiveWorkoutPopup(false)}
      />

      <ConfirmationPopup
        text="¿Seguro que quieres dejar de seguir a este entrenador?"
        show={trainerToUnfollow !== null}
        onOk={() => {
          if (trainerToUnfollow) {
            unfollowTrainer(
              trainerToUnfollow,
              () =>
                setFollowing((prev) =>
                  prev.filter((id) => id !== trainerToUnfollow)
                ),
              () => console.error("Error al dejar de seguir entrenador")
            );
          }
          setTrainerToUnfollow(null);
        }}
        onCancel={() => setTrainerToUnfollow(null)}
      />
    </div>
  );
};

export default Routines;
