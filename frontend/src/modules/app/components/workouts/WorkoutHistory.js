import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {tryLoginFromServiceToken} from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutHistory.module.css";
import LoadingMessage from "../common/LoadingMessage";


const WorkoutHistory = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                loadWorkoutHistory();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    const loadWorkoutHistory = () => {
        setLoading(true);
        workoutService.getWorkouts(
            (data) => {
                console.log("Workouts loaded:", data);
                const sortedWorkouts = data.sort((a, b) =>
                    new Date(b.startTime) - new Date(a.startTime)
                ); //recent ones first
                setWorkouts(sortedWorkouts);
                setLoading(false);
            },
            (errors) => {
                console.error("Error loading workout history:", errors);
                setError(errors.globalError || "Error al cargar el historial");
                setLoading(false);
            }
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (startTime, endTime) => {
        if (!endTime) return null; // Return null instead of "En progreso"

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

    if (loading) return <LoadingMessage text="Cargando historial de entrenamientos..." />;

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles['error-message']}>
                    {error}
                    <button onClick={loadWorkoutHistory} className={styles['retry-button']}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.contenedor}>
            <div className={styles['history-titulo-grande']}>
                <h2>Historial de entrenamientos</h2>
            </div>

            {workouts.length === 0 ? (
                <div className={styles['empty-message']}>
                    <p>No has realizado ningún entrenamiento todavía.</p>
                    <button
                        className={styles['start-button']}
                        onClick={() => navigate("/routines")}
                    >
                        Ver entrenamientos disponibles
                    </button>
                </div>
            ) : (
                <div className={styles['lista-workouts']}>
                    {workouts.map((workout) => {
                        const duration = calculateDuration(workout.startTime, workout.endTime);
                        const isInProgress = !workout.endTime;

                        return (
                            <Link
                                to={`/workouts/${workout.id}`}
                                key={workout.id}
                                className={`${styles['caja-workout']} ${isInProgress ? styles['active-workout'] : ''}`}
                            >
                                <div className={styles['workout-info']}>
                                    <h3>{workout.routineName}</h3>
                                    <p className={styles['workout-date']}>
                                        {formatDate(workout.startTime)}
                                    </p>
                                </div>
                                <div className={styles['workout-stats']}>
                                <span className={isInProgress ? styles['in-progress'] : styles['duration']}>
                                    {isInProgress ? "En progreso" : duration}
                                </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


export default WorkoutHistory;