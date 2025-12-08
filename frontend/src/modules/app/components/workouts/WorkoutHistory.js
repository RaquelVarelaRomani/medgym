import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutHistory.module.css";
import LoadingMessage from "../common/LoadingMessage";
import StatisticMetrics from "../common/statistics/Metrics";
import MuscleGroupChart from "../common/statistics/MuscleGroupChart";
import {
    formatDuration,
    transformMuscleGroupData,
} from "../common/statistics/utils/formatters";
import PropTypes from "prop-types";

/* ============================================================
   HELPERS
   ============================================================ */

const MODE_LABELS = {
    list: "Lista",
    calendar: "Calendario",
    stats: "Estadísticas",
};

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"];

function sortWorkoutsByDate(workouts) {
    return [...workouts].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );
}

function calculateDuration(startTime, endTime) {
    if (!endTime) return null;

    const diffMinutes =
        (new Date(endTime) - new Date(startTime)) / 60000;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.floor(diffMinutes % 60);

    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
}

function getCalendarDays(year, month) {
    const firstDayWeek = new Date(year, month, 1).getDay();
    const startOffset = firstDayWeek === 0 ? 6 : firstDayWeek - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const result = [];

    for (let i = 0; i < startOffset; i++) {
        result.push({ key: `empty-${year}-${month}-${i}`, day: null });
    }

    for (let d = 1; d <= totalDays; d++) {
        result.push({ key: `day-${year}-${month}-${d}`, day: d });
    }

    return result;
}

function workoutDateKey(dateString) {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;
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
        "0"
    )}`;
}

function getWorkoutLink(workout) {
    return workout.endTime
        ? `/workouts/${workout.id}?returnTo=history`
        : `/workouts/session/${workout.id}`;
}

function getMonthsForComparison() {
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    const twoAgoDate = new Date(now.getFullYear(), now.getMonth() - 2);

    return {
        current: {
            month: lastMonthDate.getMonth() + 1,
            year: lastMonthDate.getFullYear(),
        },
        previous: {
            month: twoAgoDate.getMonth() + 1,
            year: twoAgoDate.getFullYear(),
        },
    };
}

/* ============================================================
   SUBCOMPONENTES
   ============================================================ */

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

function WorkoutItem({ workout }) {
    const isInProgress = !workout.endTime;

    const formattedDate = new Date(workout.startTime).toLocaleDateString(
        "es-ES",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

    return (
        <Link
            to={getWorkoutLink(workout)}
            className={`${styles["caja-workout"]} ${
                isInProgress ? styles["active-workout"] : ""
            }`}
        >
            <div className={styles["workout-info"]}>
                <div className={styles["workout-title-line"]}>
                    <h3>{workout.routineName}</h3>
                </div>
                <p className={styles["workout-date"]}>{formattedDate}</p>
            </div>

            <div className={styles["workout-stats"]}>
                <span
                    className={
                        isInProgress ? styles["in-progress"] : styles["duration"]
                    }
                >
                    {isInProgress
                        ? "En progreso"
                        : calculateDuration(workout.startTime, workout.endTime)}
                </span>
            </div>
        </Link>
    );
}

function WorkoutList({ workouts }) {
    return (
        <div className={styles["lista-workouts"]}>
            {workouts.map((w) => (
                <WorkoutItem key={w.id} workout={w} />
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

    return (
        <div className={styles["calendario-container"]}>
            <div className={styles["calendario-header"]}>
                <button onClick={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))}>
                    {"<"}
                </button>
                <span>
                    {new Date(year, currentMonth).toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                    })}
                </span>
                <button onClick={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))}>
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

function StatsView({ stats, comparisonStats, statsLoading, statsError, onRetry }) {
    if (statsLoading) {
        return <LoadingMessage text="Cargando estadísticas..." />;
    }

    if (statsError) {
        return (
            <div className={styles["error-message"]}>
                {statsError}
                <button className={styles["retry-button"]} onClick={onRetry}>
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

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - 1);
    const lastMonthName = targetDate.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className={styles["statistics-view"]}>
            <h3 className={styles["stats-title"]}>Estadísticas de {lastMonthName}</h3>

            <StatisticMetrics
                lastMonthWorkouts={stats.lastMonthWorkouts}
                totalDuration={formatDuration(stats.totalDurationSeconds)}
                averageDuration={formatDuration(Math.round(stats.averageDurationSeconds))}
            />

            <MuscleGroupChart
                data={transformMuscleGroupData(stats.exercisesByMuscleGroup)}
                comparisonData={
                    comparisonStats
                        ? transformMuscleGroupData(comparisonStats.exercisesByMuscleGroup)
                        : null
                }
                lastMonthLabel="Este mes"
                previousMonthLabel="Mes anterior"
            />
        </div>
    );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

const WorkoutHistory = () => {
    const navigate = useNavigate();

    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [viewMode, setViewMode] = useState("list");
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

    const [stats, setStats] = useState(null);
    const [comparisonStats, setComparisonStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    const year = new Date().getFullYear();

    useEffect(() => {
        tryLoginFromServiceToken(
            () => {
                loadWorkoutHistory();
            },
            () => navigate("/users/login")
        );
    }, [navigate]);

    const loadWorkoutHistory = () => {
        setLoading(true);
        workoutService.getWorkouts(
            (data) => {
                setWorkouts(sortWorkoutsByDate(data));
                setLoading(false);
            },
            (err) => {
                setError(err.globalError || "Error al cargar el historial");
                setLoading(false);
            }
        );
    };

    const loadStatistics = () => {
        setStatsLoading(true);
        setStatsError(null);
        const { current, previous } = getMonthsForComparison();

        workoutService.getStatsForMonth(
            current.month,
            current.year,
            (d) => {
                setStats(d);
                workoutService.getStatsForMonth(
                    previous.month,
                    previous.year,
                    (d2) => {
                        setComparisonStats(d2);
                        setStatsLoading(false);
                    },
                    () => {
                        setComparisonStats(null);
                        setStatsLoading(false);
                    }
                );
            },
            (e) => {
                setStatsError(e.globalError || "Error al cargar estadísticas");
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
                    <button className={styles["retry-button"]} onClick={loadWorkoutHistory}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    let mainView;

    if (workouts.length === 0 && viewMode !== "stats") {
        mainView = <EmptyMessage onGoRoutines={() => navigate("/routines")} />;
    } else if (viewMode === "list") {
        mainView = <WorkoutList workouts={workouts} />;
    } else if (viewMode === "calendar") {
        mainView = (
            <CalendarView
                workouts={workouts}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                year={year}
            />
        );
    } else {
        mainView = (
            <StatsView
                stats={stats}
                comparisonStats={comparisonStats}
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
        </div>
    );
};

export default WorkoutHistory;

/* ============================================================
   PROP TYPES (TODOS, CORRECTOS, SIN DUPLICADOS)
   ============================================================ */

HistoryHeader.propTypes = {
    viewMode: PropTypes.oneOf(["list", "calendar", "stats"]).isRequired,
    setViewMode: PropTypes.func.isRequired,
    stats: PropTypes.shape({
        lastMonthWorkouts: PropTypes.number,
        totalDurationSeconds: PropTypes.number,
        averageDurationSeconds: PropTypes.number,
        exercisesByMuscleGroup: PropTypes.object,
    }),
    onStatsSelected: PropTypes.func.isRequired,
};

EmptyMessage.propTypes = {
    onGoRoutines: PropTypes.func.isRequired,
};

WorkoutItem.propTypes = {
    workout: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        routineName: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string,
    }).isRequired,
};

WorkoutList.propTypes = {
    workouts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            routineName: PropTypes.string.isRequired,
            startTime: PropTypes.string.isRequired,
            endTime: PropTypes.string,
        })
    ).isRequired,
};

CalendarDayCell.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    day: PropTypes.number,
    workoutsByDay: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                routineName: PropTypes.string.isRequired,
                startTime: PropTypes.string,
                endTime: PropTypes.string,
            })
        )
    ).isRequired,
};

CalendarView.propTypes = {
    workouts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            routineName: PropTypes.string.isRequired,
            startTime: PropTypes.string.isRequired,
            endTime: PropTypes.string,
        })
    ).isRequired,
    currentMonth: PropTypes.number.isRequired,
    setCurrentMonth: PropTypes.func.isRequired,
    year: PropTypes.number.isRequired,
};

StatsView.propTypes = {
    stats: PropTypes.shape({
        lastMonthWorkouts: PropTypes.number.isRequired,
        totalDurationSeconds: PropTypes.number.isRequired,
        averageDurationSeconds: PropTypes.number.isRequired,
        exercisesByMuscleGroup: PropTypes.objectOf(PropTypes.number).isRequired,
    }),
    comparisonStats: PropTypes.shape({
        lastMonthWorkouts: PropTypes.number.isRequired,
        totalDurationSeconds: PropTypes.number.isRequired,
        averageDurationSeconds: PropTypes.number.isRequired,
        exercisesByMuscleGroup: PropTypes.objectOf(PropTypes.number).isRequired,
    }),
    statsLoading: PropTypes.bool.isRequired,
    statsError: PropTypes.string,
    onRetry: PropTypes.func.isRequired,
};

WorkoutHistory.propTypes = {};
