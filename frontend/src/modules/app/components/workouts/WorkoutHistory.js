import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutHistory.module.css";
import LoadingMessage from "../common/LoadingMessage";
import CommentBubble from "../common/CommentBubble";
import CommentModal from "../common/CommentModal";
import { commentWorkout } from "../../../../backend/workoutCommentService";
import StatisticMetrics from "../common/statistics/Metrics";
import MuscleGroupChart from "../common/statistics/MuscleGroupChart";
import {
    formatDuration,
    transformMuscleGroupData,
} from "../common/statistics/utils/formatters";
import { likeWorkout, unlikeWorkout } from "../../../../backend/workoutLikeService";
import HeartLike from "../common/HeartLike";
import PropTypes from "prop-types";


// ---------- Helpers puros ----------

const MODE_LABELS = {
    list: "Lista",
    calendar: "Calendario",
    stats: "Estadísticas",
};

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"];

function sortWorkoutsByDate(workouts) {
    return [...workouts].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime),
    );
}

function calculateDuration(startTime, endTime) {
    if (!endTime) return null;

    const diffMinutes = Math.floor(
        (new Date(endTime) - new Date(startTime)) / 60000,
    );
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
}

function getCalendarDays(year, month) {
    const first = new Date(year, month, 1).getDay();
    const start = first === 0 ? 6 : first - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < start; i += 1) {
        days.push({ key: `empty-${year}-${month}-${i}`, day: null });
    }

    for (let d = 1; d <= totalDays; d += 1) {
        days.push({ key: `day-${year}-${month}-${d}`, day: d });
    }

    return days;
}

function workoutDateKey(dateString) {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function buildWorkoutsByDay(workouts) {
    return workouts.reduce((acc, w) => {
        const key = workoutDateKey(w.startTime);
        if (!acc[key]) acc[key] = [];
        acc[key].push(w);
        return acc;
    }, {});
}

function dayKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
    )}`;
}

function getWorkoutLink(workout) {
    if (!workout.endTime) return `/workouts/session/${workout.id}`;
    return `/workouts/${workout.id}?returnTo=history`;
}

// ---------- Subcomponentes de presentación ----------

function HistoryHeader({ viewMode, setViewMode, stats, onStatsSelected }) {
    return (
        <div className={styles["history-titulo-grande"]}>
            <h2>Historial de entrenamientos</h2>
            <div className={styles["button-mode"]}>
                {["list", "calendar", "stats"].map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        className={`${styles["start-button"]} ${
                            viewMode === mode ? styles.active : ""
                        }`}
                        onClick={() => {
                            setViewMode(mode);
                            if (mode === "stats" && !stats) onStatsSelected();
                        }}
                    >
                        {MODE_LABELS[mode]}
                    </button>
                ))}
            </div>
        </div>
    );
}

function EmptyMessage({ onGoRoutines }) {
    return (
        <div className={styles["empty-message"]}>
            <p>No has realizado ningún entrenamiento todavía.</p>
            <button
                type="button"
                className={styles["start-button"]}
                onClick={onGoRoutines}
            >
                Ver entrenamientos disponibles
            </button>
        </div>
    );
}

function WorkoutItem({ workout, currentUser, onToggleLike, onOpenComments }) {
    const isInProgress = !workout.endTime;
    const duration = calculateDuration(workout.startTime, workout.endTime);
    const link = getWorkoutLink(workout);
    const likes = workout.likes || [];
    const liked = likes.some((l) => l.userId === currentUser?.id);

    const likeCount = likes.length;
    const commentCount = (workout.comments || []).length;

    const formattedDate = new Date(workout.startTime).toLocaleDateString(
        "es-ES",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    return (
        <Link
            key={workout.id}
            to={link}
            className={`${styles["caja-workout"]} ${
                isInProgress ? styles["active-workout"] : ""
            }`}
        >
            <div className={styles["workout-info"]}>
                <div className={styles["workout-title-line"]}>
                    <h3>{workout.routineName}</h3>

                    <HeartLike
                        count={likeCount}
                        liked={liked}
                        onChange={(next) => onToggleLike(workout, next)}
                        size={22}
                    />

                    <CommentBubble
                        count={commentCount}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpenComments(workout);
                        }}
                    />
                </div>

                <p className={styles["workout-date"]}>{formattedDate}</p>
            </div>

            <div className={styles["workout-stats"]}>
        <span
            className={
                isInProgress ? styles["in-progress"] : styles["duration"]
            }
        >
          {isInProgress ? "En progreso" : duration}
        </span>
            </div>
        </Link>
    );
}

function WorkoutList({ workouts, currentUser, onToggleLike, onOpenComments }) {
    return (
        <div className={styles["lista-workouts"]}>
            {workouts.map((w) => (
                <WorkoutItem
                    key={w.id}
                    workout={w}
                    currentUser={currentUser}
                    onToggleLike={onToggleLike}
                    onOpenComments={onOpenComments}
                />
            ))}
        </div>
    );
}

function CalendarDayCell({ year, month, day, workoutsByDay }) {
    if (day === null) {
        return <div className={styles["calendario-dia-vacia"]} />;
    }

    const key = dayKey(year, month, day);
    const dayWorkouts = workoutsByDay[key] || [];

    return (
        <div className={styles["calendario-dia"]}>
            <div className={styles["calendario-dia-num"]}>{day}</div>
            {dayWorkouts.map((w) => (
                <Link
                    key={w.id}
                    to={getWorkoutLink(w)}
                    className={styles["calendario-workout"]}
                >
                    {w.routineName}
                </Link>
            ))}
        </div>
    );
}

function CalendarView({ workouts, currentMonth, setCurrentMonth, year }) {
    const days = getCalendarDays(year, currentMonth);
    const workoutsByDay = buildWorkoutsByDay(workouts);

    const monthLabel = new Date(year, currentMonth).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
    });

    const goPrevMonth = () => {
        setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
    };

    const goNextMonth = () => {
        setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
    };

    return (
        <div className={styles["calendario-container"]}>
            <div className={styles["calendario-header"]}>
                <button type="button" onClick={goPrevMonth}>
                    {"<"}
                </button>
                <span>{monthLabel}</span>
                <button type="button" onClick={goNextMonth}>
                    {">"}
                </button>
            </div>

            <div className={styles["calendario-weekdays"]}>
                {WEEK_DAYS.map((d) => (
                    <div key={d} className={styles["weekday"]}>
                        {d}
                    </div>
                ))}
            </div>

            <div className={styles["calendario-grid"]}>
                {days.map(({ key, day }) => (
                    <CalendarDayCell
                        key={key}
                        year={year}
                        month={currentMonth}
                        day={day}
                        workoutsByDay={workoutsByDay}
                    />
                ))}
            </div>
        </div>
    );
}

function StatsView({ stats, statsLoading, statsError, onRetry }) {
    if (statsLoading) {
        return <LoadingMessage text="Cargando estadísticas..." />;
    }

    if (statsError) {
        return (
            <div className={styles["error-message"]}>
                {statsError}
                <button
                    type="button"
                    onClick={onRetry}
                    className={styles["retry-button"]}
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles["empty-message"]}>
                <p>No hay datos de estadísticas disponibles</p>
            </div>
        );
    }

    return (
        <div className={styles["statistics-view"]}>
            <h3 className={styles["stats-title"]}>
                Estadísticas del último mes
            </h3>

            <StatisticMetrics
                lastMonthWorkouts={stats.lastMonthWorkouts}
                totalDuration={formatDuration(stats.totalDurationSeconds)}
                averageDuration={formatDuration(
                    Math.round(stats.averageDurationSeconds),
                )}
            />

            <MuscleGroupChart
                data={transformMuscleGroupData(stats.exercisesByMuscleGroup)}
            />
        </div>
    );
}

// ---------- Componente principal ----------

const WorkoutHistory = () => {
    const navigate = useNavigate();

    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);

    const [viewMode, setViewMode] = useState("list");
    const [currentMonth, setCurrentMonth] = useState(
        new Date().getMonth(),
    );

    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        tryLoginFromServiceToken(
            (user) => {
                setCurrentUser(user.user);
                loadWorkoutHistory();
            },
            () => navigate("/users/login"),
        );
    }, [navigate]);

    const loadWorkoutHistory = () => {
        setLoading(true);
        setError(null);

        workoutService.getWorkouts(
            (data) => {
                setWorkouts(sortWorkoutsByDate(data));
                setLoading(false);
            },
            (err) => {
                setError(err.globalError || "Error al cargar el historial");
                setLoading(false);
            },
        );
    };

    const loadStatistics = () => {
        setStatsLoading(true);
        setStatsError(null);

        workoutService.getLastMonthStats(
            (d) => {
                setStats(d);
                setStatsLoading(false);
            },
            (e) => {
                setStatsError(e.globalError || "Error al cargar estadísticas");
                setStatsLoading(false);
            },
        );
    };

    const handleToggleLike = (workout, next) => {
        const updateLikes = (w) => {
            if (w.id !== workout.id) return w;

            const currentLikes = w.likes || [];
            const updatedLikes = next
                ? [...currentLikes, { userId: currentUser.id }]
                : currentLikes.filter(l => l.userId !== currentUser.id);

            return { ...w, likes: updatedLikes };
        };

        setWorkouts(prev => prev.map(updateLikes));

        const action = next ? likeWorkout : unlikeWorkout;
        action(workout.id, () => {}, () => {});
    };

    const handleOpenComments = (workout) => {
        setSelectedWorkout(workout);
        setCommentModalOpen(true);
    };

    const handleCommentAdded = (added) => {
        setSelectedWorkout((prev) =>
            prev
                ? {
                    ...prev,
                    comments: [...(prev.comments || []), added],
                }
                : prev,
        );

        setWorkouts((prev) =>
            prev.map((w) =>
                w.id === selectedWorkout.id
                    ? {
                        ...w,
                        comments: [...(w.comments || []), added],
                    }
                    : w,
            ),
        );
    };

    if (loading) {
        return (
            <LoadingMessage text="Cargando historial de entrenamientos..." />
        );
    }

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["error-message"]}>
                    {error}
                    <button
                        type="button"
                        onClick={loadWorkoutHistory}
                        className={styles["retry-button"]}
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    let mainView;

    if (workouts.length === 0 && viewMode !== "stats") {
        mainView = (
            <EmptyMessage onGoRoutines={() => navigate("/routines")} />
        );
    } else if (viewMode === "list") {
        mainView = (
            <WorkoutList
                workouts={workouts}
                currentUser={currentUser}
                onToggleLike={handleToggleLike}
                onOpenComments={handleOpenComments}
            />
        );
    } else if (viewMode === "calendar") {
        mainView = (
            <CalendarView
                workouts={workouts}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                year={currentYear}
            />
        );
    } else {
        mainView = (
            <StatsView
                stats={stats}
                statsLoading={statsLoading}
                statsError={statsError}
                onRetry={loadStatistics}
            />
        );
    }

    return (
        <div className={styles.contenedor}>
            <HistoryHeader
                viewMode={viewMode}
                setViewMode={setViewMode}
                stats={stats}
                onStatsSelected={loadStatistics}
            />

            {mainView}

            {commentModalOpen && selectedWorkout && (
                <CommentModal
                    open={commentModalOpen}
                    onSend={(text) =>
                        commentWorkout(selectedWorkout.id, text, handleCommentAdded)
                    }
                    onClose={() => setCommentModalOpen(false)}
                    workoutId={selectedWorkout.id}
                    comments={selectedWorkout.comments || []}
                />
            )}
        </div>
    );
};

export default WorkoutHistory;

/* ---------- HistoryHeader ---------- */
HistoryHeader.propTypes = {
    viewMode: PropTypes.oneOf(["list", "calendar", "stats"]).isRequired,
    setViewMode: PropTypes.func.isRequired,
    stats: PropTypes.object,
    onStatsSelected: PropTypes.func.isRequired,
};

/* ---------- EmptyMessage ---------- */
EmptyMessage.propTypes = {
    onGoRoutines: PropTypes.func.isRequired,
};

/* ---------- WorkoutItem ---------- */
WorkoutItem.propTypes = {
    workout: PropTypes.shape({
        id: PropTypes.number.isRequired,
        routineName: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string,
        likes: PropTypes.arrayOf(
            PropTypes.shape({
                userId: PropTypes.number.isRequired
            })
        ),
        comments: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                userId: PropTypes.number,
                text: PropTypes.string,
                timestamp: PropTypes.string
            })
        )
    }).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.number
    }),
    onToggleLike: PropTypes.func.isRequired,
    onOpenComments: PropTypes.func.isRequired,
};

/* ---------- WorkoutList ---------- */
WorkoutList.propTypes = {
    workouts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
        })
    ).isRequired,
    currentUser: PropTypes.object,
    onToggleLike: PropTypes.func.isRequired,
    onOpenComments: PropTypes.func.isRequired,
};

/* ---------- CalendarDayCell ---------- */
CalendarDayCell.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    day: PropTypes.number,
    workoutsByDay: PropTypes.object.isRequired,
};

/* ---------- CalendarView ---------- */
CalendarView.propTypes = {
    workouts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            startTime: PropTypes.string.isRequired,
            endTime: PropTypes.string,
            routineName: PropTypes.string.isRequired
        })
    ).isRequired,
    currentMonth: PropTypes.number.isRequired,
    setCurrentMonth: PropTypes.func.isRequired,
    year: PropTypes.number.isRequired,
};

/* ---------- StatsView ---------- */
StatsView.propTypes = {
    stats: PropTypes.shape({
        lastMonthWorkouts: PropTypes.number,
        totalDurationSeconds: PropTypes.number,
        averageDurationSeconds: PropTypes.number,
        exercisesByMuscleGroup: PropTypes.object
    }),
    statsLoading: PropTypes.bool.isRequired,
    statsError: PropTypes.string,
    onRetry: PropTypes.func.isRequired,
};

/* ---------- WorkoutHistory (componente principal) ---------- */
WorkoutHistory.propTypes = {};