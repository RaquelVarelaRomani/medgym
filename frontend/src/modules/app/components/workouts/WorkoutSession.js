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
import {getExerciseTypeText} from "../../util/enumConversor";

const WorkoutSession = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [workout, setWorkout] = useState(null);
    const [routineExercises, setRoutineExercises] = useState([]);
    const [loggedSets, setLoggedSets] = useState({});
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [setErrorMessage, setSetErrorMessage] = useState(null);
    const [notification, setNotification] = useState("");
    const [showIncompletePopup, setShowIncompletePopup] = useState(false);
    const [showAchievementPopup, setShowAchievementPopup] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

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
        workoutService.getWorkout(
            sessionId,
            (data) => {
                setWorkout(data);
                routineExerciseService.getRoutineExercises(
                    data.routineId,
                    (res) => {
                        const ordered = (res.content ?? res).sort(
                            (a, b) => a.position - b.position
                        );
                        setRoutineExercises(ordered);
                        setLoading(false);
                    },
                    () => {
                        setError("No se pudieron cargar los ejercicios.");
                        setLoading(false);
                    }
                );
            },
            () => {
                setError("No se pudo cargar el entrenamiento.");
                setLoading(false);
            }
        );
    }, [sessionId]);

    const handleChange = (id, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const handleAddSet = (routineExerciseId, exerciseType) => {
        const data = formData[routineExerciseId] || {};

        if (
            (exerciseType === "STRENGTH" && (!data.reps || !data.weight)) ||
            (exerciseType === "CARDIO" && !data.durationSeconds)
        ) {
            return;
        }

        workoutExerciseService.addWorkoutExercise(
            sessionId,
            exerciseType === "STRENGTH" ? Number(data.reps) : null,
            exerciseType === "STRENGTH" ? Number(data.weight) : null,
            exerciseType === "CARDIO" ? Number(data.durationSeconds) : null,
            routineExerciseId,
            () => {
                setSetErrorMessage(null);

                const newSet = {
                    setNumber: (loggedSets[routineExerciseId]?.length || 0) + 1,
                    ...data,
                    date: new Date().toLocaleTimeString(),
                };

                setLoggedSets((prev) => ({
                    ...prev,
                    [routineExerciseId]: [
                        ...(prev[routineExerciseId] || []),
                        newSet,
                    ],
                }));

                setFormData((prev) => ({
                    ...prev,
                    [routineExerciseId]: {},
                }));
            },
            () => {
                setSetErrorMessage("⚠️ Error al registrar la serie.");
            }
        );
    };

    const allExercisesCompleted = () =>
        routineExercises.every((ex) => loggedSets[ex.id]?.length > 0);

    const handleFinishWorkout = () => {
        workoutService.finishWorkout(
            sessionId,
            () => {
                const stats = Object.values(loggedSets).flat().reduce(
                    (acc, s) => {
                        if (s.durationSeconds) acc.totalSeconds += Number(s.durationSeconds);
                        if (s.reps) acc.totalReps += Number(s.reps);
                        return acc;
                    },
                    { totalSeconds: 0, totalReps: 0 }
                );

                onFinishWorkoutAchievements(
                    stats.totalSeconds,
                    stats.totalReps,
                    sessionId,
                    (a) => {
                        if (a?.length) {
                            setAchievements(a);
                            setShowAchievementPopup(true);
                        } else {
                            navigate("/workouts/history");
                        }
                    },
                    () => navigate("/workouts/history")
                );
            }
        );
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
                        {index + 1}. {ex.exerciseName} ({getExerciseTypeText(ex.exerciseType)})
                    </h3>

                    <div className={styles.inputs}>
                        {setErrorMessage && (
                            <div>{setErrorMessage}</div>
                        )}
                        {ex.exerciseType === "STRENGTH" && (
                            <>
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={formData[ex.id]?.reps || ""}
                                    onChange={(e) =>
                                        handleChange(ex.id, "reps", e.target.value)
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Peso (kg)"
                                    value={formData[ex.id]?.weight || ""}
                                    onChange={(e) =>
                                        handleChange(ex.id, "weight", e.target.value)
                                    }
                                />
                            </>
                        )}

                        {ex.exerciseType === "CARDIO" && (
                            <input
                                type="number"
                                placeholder="Duración (s)"
                                value={formData[ex.id]?.durationSeconds || ""}
                                onChange={(e) =>
                                    handleChange(ex.id, "durationSeconds", e.target.value)
                                }
                            />
                        )}

                        <button onClick={() => handleAddSet(ex.id, ex.exerciseType)}>
                            Añadir serie
                        </button>
                    </div>

                    {loggedSets[ex.id]?.length > 0 && (
                        <div className={styles.setContainer}>
                            <div className={styles.setHeader}>
                                <div className={styles.headerItem}>Serie</div>
                                {ex.exerciseType === "STRENGTH" && (
                                    <>
                                        <div className={styles.headerItem}>Reps</div>
                                        <div className={styles.headerItem}>Peso</div>
                                    </>
                                )}
                                {ex.exerciseType === "CARDIO" && (
                                    <div className={styles.headerItem}>Duración</div>
                                )}
                                <div className={styles.headerItem}>Hora</div>
                            </div>

                            {loggedSets[ex.id].map((s) => (
                                <div key={s.setNumber} className={styles.setRow}>
                                    <div className={styles.setBox}>Serie {s.setNumber}</div>
                                    {ex.exerciseType === "STRENGTH" && (
                                        <>
                                            <div className={styles.setBox}>{s.reps}</div>
                                            <div className={styles.setBox}>{s.weight}</div>
                                        </>
                                    )}
                                    {ex.exerciseType === "CARDIO" && (
                                        <div className={styles.setBox}>
                                            {s.durationSeconds}
                                        </div>
                                    )}
                                    <div className={styles.timeBox}>{s.date}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <button
                className={styles.finishButton}
                onClick={() =>
                    allExercisesCompleted()
                        ? handleFinishWorkout()
                        : setShowIncompletePopup(true)
                }
            >
                Finalizar entrenamiento
            </button>

            <ConfirmationPopup
                show={showIncompletePopup}
                text="Aún faltan ejercicios por registrar. ¿Deseas finalizar igualmente?"
                onOk={() => {
                    setShowIncompletePopup(false);
                    handleFinishWorkout();
                }}
                onCancel={() => setShowIncompletePopup(false)}
            />

            <AchievementPopup
                show={showAchievementPopup}
                achievements={
                    achievements.length
                        ? [achievements[currentAchievementIndex]]
                        : []
                }
                onOk={() => {
                    if (currentAchievementIndex < achievements.length - 1) {
                        setCurrentAchievementIndex((i) => i + 1);
                    } else {
                        navigate("/workouts/history");
                    }
                }}
            />
        </div>
    );
};

export default WorkoutSession;
