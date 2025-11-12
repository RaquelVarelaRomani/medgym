import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutHistory.module.css";
import LoadingMessage from "../common/LoadingMessage";
import CommentBubble from "../common/CommentBubble";
import CommentModal from "../common/CommentModal";
import { commentWorkout } from "../../../../backend/workoutCommentService";
import StatisticMetrics from '../common/statistics/Metrics';
import MuscleGroupChart from '../common/statistics/MuscleGroupChart';
import { formatDuration, transformMuscleGroupData } from '../common/statistics/utils/formatters';

const WorkoutHistory = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

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
                const sortedWorkouts = data.sort((a, b) =>
                    new Date(b.startTime) - new Date(a.startTime)
                );
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
        if (!endTime) return null;
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
    };

    const getFirstDayOfMonth = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    const getDaysInMonth = () => new Date(currentYear, currentMonth + 1, 0).getDate();

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

    const loadStatistics = () => {
        setStatsLoading(true);
        setStatsError(null);
        workoutService.getLastMonthStats(
            (data) => {
                setStats(data);
                setStatsLoading(false);
            },
            (errors) => {
                console.error("Error loading statistics:", errors);
                setStatsError(errors.globalError || "Error al cargar estadísticas");
                setStatsLoading(false);
            }
        );
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
                        className={`${styles["start-button"]} ${viewMode === 'list' ? styles["active"] : ""}`}
                        onClick={() => setViewMode('list')}
                    >
                        Lista
                    </button>
                    <button
                        className={`${styles["start-button"]} ${viewMode === 'calendar' ? styles["active"] : ""}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        Calendario
                    </button>
                    <button
                        className={`${styles["start-button"]} ${viewMode === 'stats' ? styles["active"] : ""}`}
                        onClick={() => {
                            setViewMode('stats');
                            if (!stats) loadStatistics();
                        }}
                    >
                        Estadísticas
                    </button>
                </div>
            </div>

            {workouts.length === 0 && viewMode !== 'stats' ? (
                <div className={styles["empty-message"]}>
                    <p>No has realizado ningún entrenamiento todavía.</p>
                    <button className={styles["start-button"]} onClick={() => navigate("/routines")}>
                        Ver entrenamientos disponibles
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                <div className={styles["lista-workouts"]}>
                    {workouts.map((workout) => {
                        const duration = calculateDuration(workout.startTime, workout.endTime);
                        const isInProgress = !workout.endTime;

                        return (
                            <Link
                                to={
                                    isInProgress
                                        ? `/workouts/session/${workout.id}`
                                        : `/workouts/${workout.id}?returnTo=history`
                                }
                                key={workout.id}
                                className={`${styles["caja-workout"]} ${isInProgress ? styles["active-workout"] : ""}`}
                            >
                                <div className={styles["workout-info"]}>
                                    <div className={styles["workout-title-line"]}>
                                        <h3>{workout.routineName}</h3>
                                        <CommentBubble
                                            count={(workout.comments || []).length}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedWorkout(workout);
                                                setCommentModalOpen(true);
                                            }}
                                        />
                                    </div>
                                    <p className={styles["workout-date"]}>
                                        {formatDate(workout.startTime)}
                                    </p>
                                </div>
                                <div className={styles["workout-stats"]}>
                                    <span
                                        className={isInProgress ? styles["in-progress"] : styles["duration"]}
                                    >
                                        {isInProgress ? "En progreso" : duration}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : viewMode === 'calendar' ? (
                <div className={styles["calendario-container"]}>
                    <div className={styles["calendario-header"]}>
                        <button onClick={prevMonth}>{"<"}</button>
                        <span>{getMonthYearDisplay()}</span>
                        <button onClick={nextMonth}>{">"}</button>
                    </div>
                    <div className={styles["calendario-weekdays"]}>
                        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"].map((d) => (
                            <div key={d} className={styles["weekday"]}>{d}</div>
                        ))}
                    </div>
                    <div className={styles["calendario-grid"]}>
                        {(() => {
                            const firstDay = getFirstDayOfMonth();
                            const daysInMonth = getDaysInMonth();
                            const calendarDays = [];
                            for (let i = 0; i < firstDay; i++) calendarDays.push(null);
                            for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);
                            return calendarDays.map((day, index) => {
                                if (day === null) {
                                    return <div key={`empty-${index}`} className={styles["calendario-dia-vacia"]}></div>;
                                }
                                const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const workoutsForDay = workouts.filter((w) => w.startTime.split("T")[0] === dateString);
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
            ) : viewMode === 'stats' ? (
                statsLoading ? (
                    <LoadingMessage text="Cargando estadísticas..." />
                ) : statsError ? (
                    <div className={styles["error-message"]}>
                        {statsError}
                        <button onClick={loadStatistics} className={styles["retry-button"]}>
                            Intentar de nuevo
                        </button>
                    </div>
                ) : stats ? (
                    <div className={styles["statistics-view"]}>
                        <h3 className={styles["stats-title"]}>Estadísticas del último mes</h3>
                        <StatisticMetrics
                            lastMonthWorkouts={stats.lastMonthWorkouts}
                            totalDuration={formatDuration(stats.totalDurationSeconds)}
                            averageDuration={formatDuration(Math.round(stats.averageDurationSeconds))}
                        />
                        <MuscleGroupChart data={transformMuscleGroupData(stats.exercisesByMuscleGroup)} />
                    </div>
                ) : (
                    <div className={styles["empty-message"]}>
                        <p>No hay datos de estadísticas disponibles</p>
                    </div>
                )
            ) : null}

            {commentModalOpen && (
                <CommentModal
                    open={commentModalOpen}
                    onSend={(text) => {
                        commentWorkout(
                            selectedWorkout.id,
                            text,
                            (addedComment) => {
                                setSelectedWorkout(prev => ({
                                    ...prev,
                                    comments: [...(prev.comments || []), addedComment]
                                }));
                                setWorkouts(prev =>
                                    prev.map(w =>
                                        w.id === selectedWorkout.id
                                            ? { ...w, comments: [...(w.comments || []), addedComment] }
                                            : w
                                    )
                                );
                            }
                        );
                    }}
                    onClose={() => setCommentModalOpen(false)}
                    workoutId={selectedWorkout?.id}
                    comments={selectedWorkout?.comments || []}
                />
            )}
        </div>
    );
};

export default WorkoutHistory;
