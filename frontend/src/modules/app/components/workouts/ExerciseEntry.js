import React, { useState } from "react";
import styles from "./ExerciseEntry.module.css";
import * as workoutService from "../../../../backend/workoutService";

const ExerciseEntry = ({ exercise, sessionId, index }) => {
  const [sets, setSets] = useState([]);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [time, setTime] = useState("");

  const addSet = () => {
    workoutService.addWorkoutActivity(
      sessionId,
      exercise.id,
      reps,
      weight,
      time,
      (savedSet) => {
        setSets([...sets, savedSet]);
        setReps("");
        setWeight("");
        setTime("");
      },
      (err) => {
        console.error("Error adding set:", err);
        alert("Error al registrar la serie.");
      }
    );
  };

  return (
    <div className={styles.exerciseCard}>
      <h3>{index}. {exercise.name}</h3>
      <p>{exercise.description}</p>

      <div className={styles.inputRow}>
        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <input
          type="number"
          placeholder="Peso (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="number"
          placeholder="Tiempo (s)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={addSet}>Añadir</button>
      </div>

      <ul className={styles.setList}>
        {sets.map((s, i) => (
          <li key={i}>
            Serie {i + 1}: {s.reps ? `${s.reps} reps` : ""} {s.weight ? `· ${s.weight} kg` : ""}
            {s.time ? ` · ${s.time}s` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseEntry;
