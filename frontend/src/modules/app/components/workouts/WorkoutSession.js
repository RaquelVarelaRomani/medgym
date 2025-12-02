import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./WorkoutSession.module.css";
import * as workoutService from "../../../../backend/workoutService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import * as workoutExerciseService from "../../../../backend/workoutExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import { onFinishWorkoutAchievements } from "../../../../backend/achievementService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import AchievementPopup from "../common/popup/AchievementPopup";

const WorkoutSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [routineExercises, setRoutineExercises] = useState([]);
  const [loggedSets, setLoggedSets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState("");
  const [showIncompletePopup, setShowIncompletePopup] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);

 
  useEffect(() => {
    tryLoginFromServiceToken(
      (authUser) => {
        if (authUser.user.role !== "CLIENT") {
          navigate("/routines"); 
        }
      },
      () => navigate("/users/login")
    );
  }, [navigate]);


    useEffect(() => {
        setLoading(true);
        workoutService.getWorkout(
            sessionId,
            handleWorkoutSuccess,
            handleWorkoutError
        );
    }, [sessionId]);

    function handleWorkoutSuccess(workoutData) {
        setWorkout(workoutData);
        loadRoutineExercises(workoutData.routineId);
    }

    function handleWorkoutError() {
        setError("No se pudo cargar el entrenamiento.");
        setLoading(false);
    }

    function loadRoutineExercises(routineId) {
        routineExerciseService.getRoutineExercises(
            routineId,
            handleRoutineExercisesSuccess,
            handleRoutineExercisesError
        );
    }

    function handleRoutineExercisesSuccess(data) {
        const ordered = (data.content ?? data).sort(
            (a, b) => a.position - b.position
        );
        setRoutineExercises(ordered);
        setLoading(false);
    }

    function handleRoutineExercisesError() {
        setError("No se pudieron cargar los ejercicios.");
        setLoading(false);
    }

    const handleChange = (routineExerciseId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [routineExerciseId]: {
        ...prev[routineExerciseId],
        [field]: value,
      },
    }));
  };

  const handleAddSet = (routineExerciseId) => {
    const { reps, weight, durationSeconds } = formData[routineExerciseId] || {};
    if (!reps && !weight && !durationSeconds) return;

    workoutExerciseService.addWorkoutExercise(
      sessionId,
      reps ? Number(reps) : null,
      weight ? Number(weight) : null,
      durationSeconds ? Number(durationSeconds) : null,
      routineExerciseId,
      () => {
          const newSet = {
              setNumber: (loggedSets[routineExerciseId]?.length || 0) + 1,
              reps,
              weight,
              durationSeconds,
              date: new Date().toLocaleTimeString(),
          };
          setLoggedSets((prev) => ({
          ...prev,
          [routineExerciseId]: [...(prev[routineExerciseId] || []), newSet],
        }));
        setFormData((prev) => ({
          ...prev,
          [routineExerciseId]: { reps: "", weight: "", durationSeconds: "" },
        }));
      },
      (err) => {
        showNotification("⚠️ Error al registrar la serie.");
      }
    );
  };

  
  const allExercisesCompleted = () => {
    return routineExercises.every((ex) => loggedSets[ex.id]?.length > 0);
  };

  const calculateWorkoutStats = () => {
    let totalSeconds = 0;
    let totalReps = 0;
    Object.values(loggedSets).forEach((sets) => {
      sets.forEach((set) => {
        if (set.durationSeconds) totalSeconds += Number(set.durationSeconds);
        if (set.reps) totalReps += Number(set.reps);
      });
    });
    return { totalSeconds, totalReps };
  };

  
  const handleFinishAttempt = () => {
    if (!allExercisesCompleted()) {
      setShowIncompletePopup(true); // mostrar popup
    } else {
      handleFinishWorkout(); // todos completos
    }
  };

  const handleFinishWorkout = () => {
    workoutService.finishWorkout(
      sessionId,
      () => {
        showNotification("🏁 Entrenamiento finalizado");
        const { totalSeconds, totalReps } = calculateWorkoutStats();
        onFinishWorkoutAchievements(
          totalSeconds,
          totalReps,
          (newAchievements) => {
            if (newAchievements && newAchievements.length > 0) {
              setNewAchievements(newAchievements);
              setShowAchievementPopup(true);
            } else {
              setTimeout(() => navigate("/workouts/history"), 1000);
            }
          },
          () => {
            setTimeout(() => navigate("/workouts/history"), 1000);
          }
        );
      },
      () => showNotification("⚠️ Error al finalizar el entrenamiento")
    );
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  
  if (loading) {
    return (
      <div className={styles.contenedor}>
        <div className={styles["loading-message"]}>
          Cargando entrenamiento...
        </div>
      </div>
    );
  }

  if (error) return <div className={styles.error}>{error}</div>;


  return (
    <div className={styles.container}>
      {notification && <div className={styles.notification}>{notification}</div>}

      <h1>{workout?.routineName}</h1>

      {routineExercises.map((ex, index) => (
        <div key={ex.id} className={styles.exerciseCard}>
          <h3>
            {index + 1}. {ex.exerciseName}
          </h3>
          <p>{ex.description}</p>

          <div className={styles.inputs}>
            <input
              type="number"
              placeholder="Reps"
              min="0"
              value={formData[ex.id]?.reps || ""}
              onChange={(e) =>
                handleChange(
                  ex.id,
                  "reps",
                  e.target.value === ""
                    ? ""
                    : Math.max(0, Number(e.target.value))
                )
              }
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              min="0"
              value={formData[ex.id]?.weight || ""}
              onChange={(e) =>
                handleChange(
                  ex.id,
                  "weight",
                  e.target.value === ""
                    ? ""
                    : Math.max(0, Number(e.target.value))
                )
              }
            />
            <input
              type="number"
              placeholder="Duración (s)"
              min="0"
              value={formData[ex.id]?.durationSeconds || ""}
              onChange={(e) =>
                handleChange(
                  ex.id,
                  "durationSeconds",
                  e.target.value === ""
                    ? ""
                    : Math.max(0, Number(e.target.value))
                )
              }
            />

            <button onClick={() => handleAddSet(ex.id)}>Añadir serie</button>
          </div>

          {/* ver las series registradas */}
          {loggedSets[ex.id]?.length > 0 && (
            <div className={styles.setContainer}>
              <div className={styles.setHeader}>
                <div className={styles.headerItem}>Serie</div>
                <div className={styles.headerItem}>Reps</div>
                <div className={styles.headerItem}>Peso (kg)</div>
                <div className={styles.headerItem}>Duración (s)</div>
                <div className={styles.headerItem}>Hora</div>
              </div>

                {loggedSets[ex.id].map((s) => (
                    <div key={s.id} className={styles.setRow}>
                        <div className={styles.setBox}>Serie {s.setNumber}</div>

                        <div className={s.reps ? styles.setBox : styles.setPlaceholder}>
                            {s.reps || ""}
                        </div>

                        <div className={s.weight ? styles.setBox : styles.setPlaceholder}>
                            {s.weight || ""}
                        </div>

                        <div className={s.durationSeconds ? styles.setBox : styles.setPlaceholder}>
                            {s.durationSeconds || ""}
                        </div>

                        <div className={styles.timeBox}>{s.date}</div>
                    </div>
                ))}

            </div>
          )}
        </div>
      ))}

      
      <button className={styles.finishButton} onClick={handleFinishAttempt}>
        Finalizar entrenamiento
      </button>

      
      <ConfirmationPopup
        text="Aún faltan ejercicios por registrar. ¿Deseas finalizar igualmente?"
        show={showIncompletePopup}
        onOk={() => {
          setShowIncompletePopup(false);
          handleFinishWorkout();
        }}
        onCancel={() => setShowIncompletePopup(false)}
      />

      <AchievementPopup
        show={showAchievementPopup}
        achievements={newAchievements}
        onOk={() => {
          setShowAchievementPopup(false);
          setNewAchievements([]);
          setTimeout(() => navigate("/workouts/history"), 1000);
        }}
      />
    </div>
  );
};

export default WorkoutSession;
