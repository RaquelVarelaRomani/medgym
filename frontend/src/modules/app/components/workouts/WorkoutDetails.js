// WorkoutDetails.js
import React, { useEffect, useState } from "react";
import styles from "./WorkoutDetails.module.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as workoutService from "../../../../backend/workoutService";
import * as workoutExerciseService from "../../../../backend/workoutExerciseService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import LoadingMessage from "../common/LoadingMessage";
import PropTypes from "prop-types";

const WorkoutDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const returnTo = query.get("returnTo") || "/";

    const [workout, setWorkout] = useState(null);
    const [routineExercises, setRoutineExercises] = useState([]);
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [expandedExercises, setExpandedExercises] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleExercise = (id) =>
        setExpandedExercises(prev => ({ ...prev, [id]: !prev[id] }));

    const handleBack = () => navigate("/workouts/" + returnTo);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const duration = (start, end) => {
        if (!end) return "En progreso";
        const diff = new Date(end) - new Date(start);
        const mins = Math.floor(diff / 60000);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}min` : `${m} min`;
    };

    const loadWorkoutExercises = (workoutId, onFinish) => {
        workoutExerciseService.getWorkoutExercisesByWorkoutId(
            workoutId,
            (data) => {
                setWorkoutExercises(data || []);
                onFinish();
            },
            () => {
                setWorkoutExercises([]);
                onFinish();
            }
        );
    };

    const loadRoutineExercises = (routineId, onFinish) => {
        routineExerciseService.getRoutineExercises(
            routineId,
            (data) => {
                const arr = data.content || data;
                setRoutineExercises([...arr].sort((a, b) => a.position - b.position));
                onFinish();
            },
            () => {
                setError("Error al cargar los ejercicios");
                onFinish();
            }
        );
    };

    const loadWorkout = () => {
        const handleWorkoutLoadError = () => {
            setError("Error al cargar el entrenamiento");
            setLoading(false);
        };

        const finishLoading = () => setLoading(false);

        const handleRoutineLoaded = () => {
            loadWorkoutExercises(id, finishLoading);
        };

        const handleWorkoutLoaded = (w) => {
            setWorkout(w);
            loadRoutineExercises(w.routineId, handleRoutineLoaded);
        };

        workoutService.getWorkout(id, handleWorkoutLoaded, handleWorkoutLoadError);
    };

    useEffect(() => {
        tryLoginFromServiceToken(
            () => loadWorkout(),
            () => navigate("/users/login")
        );
    }, [id, navigate]);

    const logged = (id) =>
        workoutExercises.filter((x) => x.routineExerciseId === id);

    if (loading) return <LoadingMessage text="Cargando detalles del entrenamiento..." />;
    if (error)
        return (
            <div className={styles["contenedor-workout-details"]}>
                <div className={styles["error-container"]}>
                    <p className={styles["error-message"]}>{error}</p>
                    <button onClick={handleBack} className={styles["retry-button"]}>
                        Volver al historial
                    </button>
                </div>
            </div>
        );
    if (!workout) return null;

    return (
        <div className={styles["contenedor-workout-details"]}>
            <WorkoutHeader
                workout={workout}
                handleBack={handleBack}
                formatDate={formatDate}
                duration={duration}
            />

            <ExerciseList
                routineExercises={routineExercises}
                expandedExercises={expandedExercises}
                toggleExercise={toggleExercise}
                logged={logged}
            />
        </div>
    );
};

export default WorkoutDetails;


// ------------------ COMPONENTES EXTRAIDOS ------------------

const WorkoutHeader = ({ workout, handleBack, formatDate, duration }) => (
    <div className={styles["caja-workout-details"]}>
        <button className={styles["boton-atras"]} onClick={handleBack}>
            ←
        </button>
        <h1 className={styles["titulo-workout"]}>{workout.routineName}</h1>

        <div className={styles["workout-info"]}>
            <HeaderRow label="Fecha:" value={formatDate(workout.startTime)} />
            <HeaderRow
                label="Duración:"
                value={duration(workout.startTime, workout.endTime)}
            />
        </div>
    </div>
);

const HeaderRow = ({ label, value }) => (
    <div className={styles["info-item"]}>
        <span className={styles["info-label"]}>{label}</span>
        <span className={styles["info-value"]}>{value}</span>
    </div>
);

const ExerciseList = ({
                          routineExercises,
                          expandedExercises,
                          toggleExercise,
                          logged,
                      }) => (
    <div className={styles["lista-ejercicios"]}>
        {routineExercises.length === 0 ? (
            <p className={styles["no-exercises-message"]}>
                No hay ejercicios registrados
            </p>
        ) : (
            routineExercises.map((ex, idx) => (
                <ExerciseItem
                    key={ex.id}
                    exercise={ex}
                    index={idx}
                    expanded={expandedExercises[ex.id]}
                    toggleExercise={toggleExercise}
                    loggedSets={logged(ex.id)}
                />
            ))
        )}
    </div>
);

const ExerciseItem = ({ exercise, index, expanded, toggleExercise, loggedSets }) => {
    const hasData = loggedSets.length > 0;

    return (
        <div className={styles.ejercicio}>
            <button
                type="button"
                className={styles["header-ejercicio"]}
                onClick={() => toggleExercise(exercise.id)}
            >
                <h3>
                    {index + 1}. {exercise.exerciseName}
                    {hasData && <span className={styles["completed-tick"]}>✓</span>}
                </h3>

                <span className={`${styles.flecha} ${expanded ? styles.expandida : ""}`}>
                    ▼
                </span>
            </button>

            {expanded && (
                <ExerciseContent hasData={hasData} loggedSets={loggedSets} />
            )}
        </div>
    );
};

const ExerciseContent = ({ hasData, loggedSets }) =>
    hasData ? (
        <div className={styles["ejercicio-contenido"]}>
            <div className={styles["logged-sets"]}>
                <h4>Series realizadas:</h4>

                <div className={styles["sets-grid"]}>
                    {loggedSets.map((set, i) => (
                        <SetItem key={set.id} set={set} index={i} />
                    ))}
                </div>
            </div>
        </div>
    ) : (
        <p className={styles["no-data-message"]}>
            No se registraron datos para este ejercicio
        </p>
    );

const SetItem = ({ set, index }) => (
    <div className={styles["set-item"]}>
        <span className={styles["set-number"]}>Serie {index + 1}</span>
        <div className={styles["set-details"]}>
            {set.reps && (
                <span className={styles["set-stat"]}>
                    <strong>{set.reps}</strong> reps
                </span>
            )}
            {set.weight && (
                <span className={styles["set-stat"]}>
                    <strong>{set.weight}</strong> kg
                </span>
            )}
            {set.durationSeconds && (
                <span className={styles["set-stat"]}>
                    <strong>{set.durationSeconds}</strong> seg
                </span>
            )}
        </div>
    </div>
);

WorkoutHeader.propTypes = {
    workout: PropTypes.shape({
        routineName: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string,
    }).isRequired,
    handleBack: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    duration: PropTypes.func.isRequired,
};

HeaderRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

ExerciseList.propTypes = {
    routineExercises: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            exerciseName: PropTypes.string,
            position: PropTypes.number,
        })
    ).isRequired,
    expandedExercises: PropTypes.object.isRequired,
    toggleExercise: PropTypes.func.isRequired,
    logged: PropTypes.func.isRequired,
};

ExerciseItem.propTypes = {
    exercise: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        exerciseName: PropTypes.string.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    expanded: PropTypes.bool,
    toggleExercise: PropTypes.func.isRequired,
    loggedSets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            reps: PropTypes.number,
            weight: PropTypes.number,
            durationSeconds: PropTypes.number,
            routineExerciseId: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]).isRequired,
        })
    ).isRequired,
};

ExerciseContent.propTypes = {
    hasData: PropTypes.bool.isRequired,
    loggedSets: PropTypes.array.isRequired,
};

SetItem.propTypes = {
    set: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        reps: PropTypes.number,
        weight: PropTypes.number,
        durationSeconds: PropTypes.number,
    }).isRequired,
    index: PropTypes.number.isRequired,
};