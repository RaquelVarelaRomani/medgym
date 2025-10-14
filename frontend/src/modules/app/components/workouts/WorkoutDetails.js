import React, { useEffect, useState } from "react";
import styles from "./WorkoutDetails.module.css";
import { useParams, useNavigate } from "react-router-dom";
import * as workoutService from "../../../../backend/workoutService";
import * as workoutExerciseService from "../../../../backend/workoutExerciseService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";

const WorkoutDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [routineExercises, setRoutineExercises] = useState([]);
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [expandedExercises, setExpandedExercises] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const toggleExercise = (exerciseId) => {
        setExpandedExercises(prev => ({
            ...prev,
            [exerciseId]: !prev[exerciseId]
        }));
    };

    const handleBack = () => {
        navigate("/workouts/history");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (startTime, endTime) => {
        if (!endTime) return "En progreso";

        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes} min`;
    };

    const loadWorkoutDetails = () => {
        setLoading(true);
        setError(null);

        // Load workout details
        workoutService.getWorkout(
            id,
            (workoutData) => {
                console.log("Workout details:", workoutData);
                setWorkout(workoutData);

                // Load routine exercises (just for the list)
                routineExerciseService.getRoutineExercises(
                    workoutData.routineId,
                    (routineExercisesData) => {
                        console.log("Routine exercises:", routineExercisesData);
                        const exercisesArray = routineExercisesData.content || routineExercisesData;
                        const sortedExercises = exercisesArray.sort((a, b) => a.position - b.position);
                        setRoutineExercises(sortedExercises);

                        // Load workout exercises (logged data)
                        workoutExerciseService.getWorkoutExercisesByWorkoutId(
                            id,
                            (workoutExerciseData) => {
                                console.log("Workout exercises:", workoutExerciseData);
                                setWorkoutExercises(workoutExerciseData || []);
                                setLoading(false);
                            },
                            (error) => {
                                console.warn("No workout exercises found:", error);
                                setWorkoutExercises([]);
                                setLoading(false);
                            }
                        );
                    },
                    (error) => {
                        console.error("Error loading routine exercises:", error);
                        setError("Error al cargar los ejercicios");
                        setLoading(false);
                    }
                );
            },
            (error) => {
                console.error("Error loading workout:", error);
                setError("Error al cargar el entrenamiento");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                loadWorkoutDetails();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [id, navigate]);

    // Helper function to get logged data for a specific routine exercise
    const getLoggedData = (routineExerciseId) => {
        return workoutExercises.filter(we => we.routineExerciseId === routineExerciseId);
    };

    if (loading) {
        return (
            <div className={styles['contenedor-workout-details']}>
                <div className={styles['loading-message']}>Cargando detalles del entrenamiento...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['contenedor-workout-details']}>
                <div className={styles['error-container']}>
                    <p className={styles['error-message']}>{error}</p>
                    <button onClick={handleBack} className={styles['retry-button']}>
                        Volver al historial
                    </button>
                </div>
            </div>
        );
    }

    if (!workout) return null;

    const isInProgress = !workout.endTime;

    return (
        <div className={styles['contenedor-workout-details']}>
            <div className={`${styles['caja-workout-details']} ${isInProgress ? styles['active-workout-details'] : ''}`}>
                <button className={styles['boton-atras']} onClick={handleBack}>
                    ←
                </button>

                <h1 className={styles['titulo-workout']}>
                    {workout.routineName}
                </h1>

                <div className={styles['workout-info']}>
                    <div className={styles['info-item']}>
                        <span className={styles['info-label']}>Fecha:</span>
                        <span className={styles['info-value']}>{formatDate(workout.startTime)}</span>
                    </div>
                    <div className={styles['info-item']}>
                        <span className={styles['info-label']}>Duración:</span>
                        <span className={styles['info-value']}>{calculateDuration(workout.startTime, workout.endTime)}</span>
                    </div>
                </div>
            </div>

            <div className={styles['lista-ejercicios']}>
                {routineExercises.length === 0 ? (
                    <p className={styles['no-exercises-message']}>No hay ejercicios registrados</p>
                ) : (
                    routineExercises.map((exercise, index) => {
                        const loggedSets = getLoggedData(exercise.id);
                        const hasLoggedData = loggedSets.length > 0;

                        return (
                            <div key={exercise.id} className={styles.ejercicio}>
                                <div
                                    className={styles['header-ejercicio']}
                                    onClick={() => toggleExercise(exercise.id)}
                                >
                                    <h3>
                                        {index + 1}. {exercise.exerciseName}
                                        {hasLoggedData && (
                                            <span className={styles['completed-tick']}>✓</span>
                                        )}
                                    </h3>
                                    <span className={`${styles.flecha} ${expandedExercises[exercise.id] ? styles.expandida : ''}`}>
                                        &#9660;
                                    </span>
                                </div>

                                {expandedExercises[exercise.id] && (
                                    <div className={styles['ejercicio-contenido']}>
                                        {hasLoggedData ? (
                                            <div className={styles['logged-sets']}>
                                                <h4>Series realizadas:</h4>
                                                <div className={styles['sets-grid']}>
                                                    {loggedSets.map((set, setIndex) => (
                                                        <div key={set.id} className={styles['set-item']}>
                                                            <span className={styles['set-number']}>Serie {setIndex + 1}</span>
                                                            <div className={styles['set-details']}>
                                                                {set.reps && (
                                                                    <span className={styles['set-stat']}>
                                                                        <strong>{set.reps}</strong> reps
                                                                    </span>
                                                                )}
                                                                {set.weight && (
                                                                    <span className={styles['set-stat']}>
                                                                        <strong>{set.weight}</strong> kg
                                                                    </span>
                                                                )}
                                                                {set.durationSeconds && (
                                                                    <span className={styles['set-stat']}>
                                                                        <strong>{set.durationSeconds}</strong> seg
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={styles['no-data-message']}>
                                                No se registraron datos para este ejercicio
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default WorkoutDetails;