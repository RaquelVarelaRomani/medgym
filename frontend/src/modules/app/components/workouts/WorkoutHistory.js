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
import { likeWorkout, unlikeWorkout } from "../../../../backend/workoutLikeService";
import HeartLike from "../common/HeartLike";

const WorkoutHistory = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("list");
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            user => {
                setCurrentUser(user.user);
                loadWorkoutHistory();
            },
            () => navigate("/users/login")
        );
    }, [navigate]);

    const loadWorkoutHistory = () => {
        setLoading(true);
        workoutService.getWorkouts(
            data => {
                setWorkouts([...data].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
                setLoading(false);
            },
            err => {
                setError(err.globalError || "Error al cargar el historial");
                setLoading(false);
            }
        );
    };

    const calculateDuration = (s, e) => {
        if (!e) return null;
        const m = Math.floor((new Date(e) - new Date(s)) / 60000);
        const h = Math.floor(m / 60);
        return h > 0 ? `${h}h ${m % 60}min` : `${m} min`;
    };

    const getCalendarDays = () => {
        const first = new Date(currentYear, currentMonth, 1).getDay();
        const start = first === 0 ? 6 : first - 1;
        const total = new Date(currentYear, currentMonth + 1, 0).getDate();

        const days = [];

        for (let i = 0; i < start; i++) {
            days.push({ key: `empty-${currentYear}-${currentMonth}-${i}`, day: null });
        }

        for (let d = 1; d <= total; d++) {
            days.push({ key: `day-${currentYear}-${currentMonth}-${d}`, day: d });
        }

        return days;
    };

    const loadStatistics = () => {
        setStatsLoading(true);
        workoutService.getLastMonthStats(
            d => {
                setStats(d);
                setStatsLoading(false);
            },
            e => {
                setStatsError(e.globalError || "Error al cargar estadísticas");
                setStatsLoading(false);
            }
        );
    };

    const renderHeader = () => (
        <div className={styles["history-titulo-grande"]}>
            <h2>Historial de entrenamientos</h2>
            <div className={styles["button-mode"]}>
                {["list", "calendar", "stats"].map(mode => (
                    <button
                        key={mode}
                        className={`${styles["start-button"]} ${viewMode === mode ? styles["active"] : ""}`}
                        onClick={() => {
                            setViewMode(mode);
                            if (mode === "stats" && !stats) loadStatistics();
                        }}
                    >
                        {mode === "list" ? "Lista" : mode === "calendar" ? "Calendario" : "Estadísticas"}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderEmptyMessage = () => (
        <div className={styles["empty-message"]}>
            <p>No has realizado ningún entrenamiento todavía.</p>
            <button className={styles["start-button"]} onClick={() => navigate("/routines")}>
                Ver entrenamientos disponibles
            </button>
        </div>
    );

    const renderWorkoutItem = workout => {
        const isInProgress = !workout.endTime;
        const duration = calculateDuration(workout.startTime, workout.endTime);

        return (
            <Link
                key={workout.id}
                to={isInProgress ? `/workouts/session/${workout.id}` : `/workouts/${workout.id}?returnTo=history`}
                className={`${styles["caja-workout"]} ${isInProgress ? styles["active-workout"] : ""}`}
            >
                <div className={styles["workout-info"]}>
                    <div className={styles["workout-title-line"]}>
                        <h3>{workout.routineName}</h3>

                        <HeartLike
                            count={(workout.likes || []).length}
                            liked={workout.likes?.some(l => l.userId === currentUser?.id) || false}
                            onChange={next => {
                                setWorkouts(prev =>
                                    prev.map(w =>
                                        w.id === workout.id
                                            ? {
                                                ...w,
                                                likes: next
                                                    ? [...w.likes, { userId: currentUser.id }]
                                                    : w.likes.filter(l => l.userId !== currentUser.id)
                                            }
                                            : w
                                    )
                                );

                                next
                                    ? likeWorkout(workout.id, () => {}, () => {})
                                    : unlikeWorkout(workout.id, () => {}, () => {});
                            }}
                            size={22}
                        />

                        <CommentBubble
                            count={(workout.comments || []).length}
                            onClick={e => {
                                e.stopPropagation();
                                setSelectedWorkout(workout);
                                setCommentModalOpen(true);
                            }}
                        />
                    </div>

                    <p className={styles["workout-date"]}>
                        {new Date(workout.startTime).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                </div>

                <div className={styles["workout-stats"]}>
                    <span className={isInProgress ? styles["in-progress"] : styles["duration"]}>
                        {isInProgress ? "En progreso" : duration}
                    </span>
                </div>
            </Link>
        );
    };

    const renderListView = () => (
        <div className={styles["lista-workouts"]}>
            {workouts.map(renderWorkoutItem)}
        </div>
    );

    const renderCalendarView = () => (
        <div className={styles["calendario-container"]}>
            <div className={styles["calendario-header"]}>
                <button onClick={() => setCurrentMonth(m => (m === 0 ? 11 : m - 1))}>{"<"}</button>
                <span>
                    {new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric"
                    })}
                </span>
                <button onClick={() => setCurrentMonth(m => (m === 11 ? 0 : m + 1))}>{">"}</button>
            </div>

            <div className={styles["calendario-weekdays"]}>
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"].map(d => (
                    <div key={d} className={styles["weekday"]}>
                        {d}
                    </div>
                ))}
            </div>

            <div className={styles["calendario-grid"]}>
                {getCalendarDays().map(({ key, day }) =>
                    day === null ? (
                        <div key={key} className={styles["calendario-dia-vacia"]}></div>
                    ) : (
                        <div key={key} className={styles["calendario-dia"]}>
                            <div className={styles["calendario-dia-num"]}>{day}</div>

                            {workouts
                                .filter(w => w.startTime.split("T")[0] ===
                                    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                                )
                                .map(w => (
                                    <Link
                                        key={w.id}
                                        to={!w.endTime ? `/workouts/session/${w.id}` : `/workouts/${w.id}`}
                                        className={styles["calendario-workout"]}
                                    >
                                        {w.routineName}
                                    </Link>
                                ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );

    const renderStatsView = () => {
        if (statsLoading) return <LoadingMessage text="Cargando estadísticas..." />;
        if (statsError)
            return (
                <div className={styles["error-message"]}>
                    {statsError}
                    <button onClick={loadStatistics} className={styles["retry-button"]}>
                        Intentar de nuevo
                    </button>
                </div>
            );
        if (!stats)
            return (
                <div className={styles["empty-message"]}>
                    <p>No hay datos de estadísticas disponibles</p>
                </div>
            );

        return (
            <div className={styles["statistics-view"]}>
                <h3 className={styles["stats-title"]}>Estadísticas del último mes</h3>
                <StatisticMetrics
                    lastMonthWorkouts={stats.lastMonthWorkouts}
                    totalDuration={formatDuration(stats.totalDurationSeconds)}
                    averageDuration={formatDuration(Math.round(stats.averageDurationSeconds))}
                />
                <MuscleGroupChart data={transformMuscleGroupData(stats.exercisesByMuscleGroup)} />
            </div>
        );
    };

    const renderCommentModal = () =>
        commentModalOpen && (
            <CommentModal
                open={commentModalOpen}
                onSend={text =>
                    commentWorkout(selectedWorkout.id, text, added => {
                        setSelectedWorkout(p => ({ ...p, comments: [...(p.comments || []), added] }));
                        setWorkouts(prev =>
                            prev.map(w =>
                                w.id === selectedWorkout.id
                                    ? { ...w, comments: [...(w.comments || []), added] }
                                    : w
                            )
                        );
                    })
                }
                onClose={() => setCommentModalOpen(false)}
                workoutId={selectedWorkout?.id}
                comments={selectedWorkout?.comments || []}
            />
        );

    if (loading) return <LoadingMessage text="Cargando historial de entrenamientos..." />;

    if (error)
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

    return (
        <div className={styles.contenedor}>
            {renderHeader()}

            {workouts.length === 0 && viewMode !== "stats"
                ? renderEmptyMessage()
                : viewMode === "list"
                    ? renderListView()
                    : viewMode === "calendar"
                        ? renderCalendarView()
                        : renderStatsView()}

            {renderCommentModal()}
        </div>
    );
};

export default WorkoutHistory;
