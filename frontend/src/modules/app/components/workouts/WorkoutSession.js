import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./WorkoutSession.module.css";
import * as workoutService from "../../../../backend/workoutService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import * as workoutExerciseService from "../../../../backend/workoutExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";

const WorkoutSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [routineExercises, setRoutineExercises] = useState([]);
  const [loggedSets, setLoggedSets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState("");

  //1) Verificamos usuario autenticado y que sea CLIENT
  useEffect(() => {
    tryLoginFromServiceToken(
      (authUser) => {
        if (authUser.user.role !== "CLIENT") {
          navigate("/routines"); // 🔒 redirigimos si no es cliente
        } else {
          setCurrentUser(authUser.user);
        }
      },
      () => navigate("/users/login")
    );
  }, [navigate]);

  //Cargamos los datos del entrenamiento y ejercicios
  useEffect(() => {
    setLoading(true);
    workoutService.getWorkout(
      sessionId,
      (workoutData) => {
        setWorkout(workoutData);
        routineExerciseService.getRoutineExercises(
          workoutData.routineId,
          (data) => {
            const ordered = (data.content ?? data).sort((a, b) => a.position - b.position);
            setRoutineExercises(ordered);
            setLoading(false);
          },
          (error) => {
            setError("No se pudieron cargar los ejercicios.");
            setLoading(false);
          }
        );
      },
      (err) => {
        setError("No se pudo cargar el entrenamiento.");
        setLoading(false);
      }
    );
  }, [sessionId]);

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
        //Guardamos la serie nueva que se vea
        const newSet = { reps, weight, durationSeconds, date: new Date().toLocaleTimeString() };
        setLoggedSets((prev) => ({
          ...prev,
          [routineExerciseId]: [...(prev[routineExerciseId] || []), newSet],
        }));
        setFormData((prev) => ({
          ...prev,
          [routineExerciseId]: { reps: "", weight: "", durationSeconds: "" },
        }));
      },
      (err) => { //pongo esto por si ocurre algún error (sale encima de rutina ...)
        showNotification("⚠️ Error al registrar la serie.");
      }
    );
  };

  const handleFinishWorkout = () => {
    workoutService.finishWorkout(
      sessionId,
      () => {
        showNotification("🏁 Entrenamiento finalizado");
        setTimeout(() => navigate("/workouts/history"), 1000);
      },
      () => showNotification("⚠️ Error al finalizar el entrenamiento")
    );
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  //CARGANDO ENTRENAMIENTO en la propia pantalla
  if (loading) {
  return (
    <div className={styles.contenedor}>
      <div className={styles["loading-message"]}>
        Cargando entrenamiento...
      </div>
    </div>
  );
}


  if (error)
    return <div className={styles.error}>{error}</div>;

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
              onChange={(e) => handleChange(ex.id, "reps", e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              min="0"
              value={formData[ex.id]?.weight || ""}
              onChange={(e) => handleChange(ex.id, "weight", e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
            />
            <input
              type="number"
              placeholder="Duración (s)"
              min="0"
              value={formData[ex.id]?.durationSeconds || ""}
              onChange={(e) => handleChange(ex.id, "durationSeconds", e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
            />

            <button onClick={() => handleAddSet(ex.id)}>Añadir serie</button>
          </div>

          {/*ver las series registradas*/}
          {loggedSets[ex.id]?.length > 0 && (
            <div className={styles.setContainer}>
              <div className={styles.setHeader}>
                <div className={styles.headerItem}>Serie</div>
                <div className={styles.headerItem}>Reps</div>
                <div className={styles.headerItem}>Peso (kg)</div>
                <div className={styles.headerItem}>Duración (s)</div>
                <div className={styles.headerItem}>Hora</div>
              </div>

              {loggedSets[ex.id].map((s, i) => (
                <div key={i} className={styles.setRow}>
                  <div className={styles.setBox}>Serie {i + 1}</div>
                  {/*Reps*/}
                  <div className={s.reps ? styles.setBox : styles.setPlaceholder}>
                    {s.reps ? s.reps : ""}
                  </div>
                  {/*Peso*/}
                  <div className={s.weight ? styles.setBox : styles.setPlaceholder}>
                    {s.weight ? s.weight : ""}
                  </div>
                  {/*Duración*/}
                  <div className={s.durationSeconds ? styles.setBox : styles.setPlaceholder}>
                    {s.durationSeconds ? s.durationSeconds : ""}
                  </div>
                  <div className={styles.timeBox}>{s.date}</div>
                </div>
              ))}
            </div>
          )}





        </div>
      ))}

      <button className={styles.finishButton} onClick={handleFinishWorkout}>
        Finalizar entrenamiento
      </button>
    </div>
  );
};

export default WorkoutSession;
