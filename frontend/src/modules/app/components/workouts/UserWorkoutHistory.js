import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutHistory.module.css";
import LoadingMessage from "../common/LoadingMessage";

const UserWorkoutHistory = ({id}) => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [isList, setIsList] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
        workoutService.getWorkoutsByUser(
            id,
            (data) => {
                console.log("Workouts loaded:", data);
                const sortedWorkouts = data.sort((a, b) =>
                    new Date(b.startTime) - new Date(a.startTime)
                ); // recent ones first
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
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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

    const handleWorkoutClick = (workout) => {
        if (!workout.endTime) {
            navigate(`/workouts/session/${workout.id}`);
        } else {
            navigate(`/workouts/${workout.id}`);
        }
    };

    const getFirstDayOfMonth = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    const getDaysInMonth = () => {
        return new Date(currentYear, currentMonth + 1, 0).getDate();
    };

    const getMonthYearDisplay = () => {
        const formatted = new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    if (loading) return <LoadingMessage text="Cargando historial de entrenamientos..." />;

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["error-message"]}>
                    {error}
                    <button onClick={loadWorkoutHistory} className={styles["retry-button"]}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.contenedor}>
            <div className={styles["history-titulo-grande"]}>
                <h2>Historial de entrenamientos</h2>
                <div className={styles["button-mode"]}>
                    <button
                        className={`${styles["start-button"]} ${isList ? styles["active"] : ""}`}
                        onClick={() => setIsList(true)}
                    >
                        Lista
                    </button>
                    <button
                        className={`${styles["start-button"]} ${!isList ? styles["active"] : ""}`}
                        onClick={() => setIsList(false)}
                    >
                        Calendario
                    </button>
                </div>
            </div>

            {workouts.length === 0 ? (
                <div className={styles["empty-message"]}>
                    <p>No has realizado ningún entrenamiento todavía.</p>
                    <button className={styles["start-button"]} onClick={() => navigate("/routines")}>
                        Ver entrenamientos disponibles
                    </button>
                </div>
            ) : isList ? (
                <div className={styles["lista-workouts"]}>
                    {workouts.map((workout) => {
                        const duration = calculateDuration(workout.startTime, workout.endTime);
                        const isInProgress = !workout.endTime;

                        return (
                            <Link
                                to={
                                    isInProgress
                                        ? `/workouts/session/${workout.id}`
                                        : `/workouts/${workout.id}`
                                }
                                key={workout.id}
                                className={`${styles["caja-workout"]} ${
                                    isInProgress ? styles["active-workout"] : ""
                                }`}
                            >
                                <div className={styles["workout-info"]}>
                                    <h3>{workout.routineName}</h3>
                                    <p className={styles["workout-date"]}>
                                        {formatDate(workout.startTime)}
                                    </p>
                                </div>
                                <div className={styles["workout-stats"]}>
                                    <span
                                        className={
                                            isInProgress
                                                ? styles["in-progress"]
                                                : styles["duration"]
                                        }
                                    >
                                        {isInProgress ? "En progreso" : duration}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className={styles["calendario-container"]}>
                    <div className={styles["calendario-header"]}>
                        <button onClick={prevMonth}>{"<"}</button>
                        <span>{getMonthYearDisplay()}</span>
                        <button onClick={nextMonth}>{">"}</button>
                    </div>

                    <div className={styles["calendario-weekdays"]}>
                        <div className={styles["weekday"]}>Lun</div>
                        <div className={styles["weekday"]}>Mar</div>
                        <div className={styles["weekday"]}>Mié</div>
                        <div className={styles["weekday"]}>Jue</div>
                        <div className={styles["weekday"]}>Vie</div>
                        <div className={styles["weekday"]}>Sab</div>
                        <div className={styles["weekday"]}>Dom</div>
                    </div>

                    <div className={styles["calendario-grid"]}>
                        {(() => {
                            const firstDay = getFirstDayOfMonth();
                            const daysInMonth = getDaysInMonth();
                            const calendarDays = [];

                            for (let i = 0; i < firstDay; i++) {
                                calendarDays.push(null);
                            }

                            for (let day = 1; day <= daysInMonth; day++) {
                                calendarDays.push(day);
                            }

                            return calendarDays.map((day, index) => {
                                if (day === null) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className={styles["calendario-dia-vacia"]}
                                        ></div>
                                    );
                                }

                                const dateString = `${currentYear}-${String(
                                    currentMonth + 1
                                ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                                const workoutsForDay = workouts.filter((w) => {
                                    let workoutDateStr = w.startTime.split("T")[0];
                                    return workoutDateStr === dateString;
                                });

                                return (
                                    <div key={day} className={styles["calendario-dia"]}>
                                        <div className={styles["calendario-dia-num"]}>{day}</div>
                                        {workoutsForDay.map((w) => {
                                            const isInProgress = !w.endTime;
                                            return (
                                                <Link
                                                    key={w.id}
                                                    to={
                                                        isInProgress
                                                            ? `/workouts/session/${w.id}`
                                                            : `/workouts/${w.id}`
                                                    }
                                                    className={styles["calendario-workout"]}
                                                >
                                                    {w.routineName}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserWorkoutHistory;
