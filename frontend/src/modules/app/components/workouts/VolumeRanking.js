import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import LoadingMessage from "../common/LoadingMessage";
import PropTypes from "prop-types";
import styles from "./VolumeRanking.module.css";

const VolumeRankingPage = () => {
    const navigate = useNavigate();
    const { routineId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [completedRoutines, setCompletedRoutines] = useState([]);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rankingLoading, setRankingLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            ({ user }) => {
                setCurrentUser(user);
                loadCompletedRoutines(user.id);
            },
            () => navigate("/users/login")
        );
    }, [navigate]);

    useEffect(() => {
        if (routineId && completedRoutines.length > 0 && !selectedRoutine) {
            const routine = completedRoutines.find(r => r.id === Number.parseInt(routineId));
            if (routine) {
                handleRoutineClick(routine);
            }
        }
    }, [routineId, completedRoutines, selectedRoutine]);

    const loadCompletedRoutines = (userId) => {
        setLoading(true);

        workoutService.getWorkoutsByUser(
            userId,
            (data) => {
                const uniqueRoutines = extractUniqueRoutines(data);
                setCompletedRoutines(uniqueRoutines);
                setLoading(false);
            },
            (errors) => {
                setError(errors.message || "Error al cargar las rutinas completadas");
                setLoading(false);
            }
        );
    };

    const extractUniqueRoutines = (workouts) => {
        const routineMap = new Map();

        workouts.forEach(workout => {
            if (workout.routineId && !routineMap.has(workout.routineId)) {
                routineMap.set(workout.routineId, {
                    id: workout.routineId,
                    name: workout.routineName,
                    completedCount: 1
                });
            } else if (workout.routineId) {
                const routine = routineMap.get(workout.routineId);
                routine.completedCount++;
            }
        });

        return Array.from(routineMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    };

    const handleRoutineClick = (routine) => {
        setSelectedRoutine(routine);
        setRankingLoading(true);

        workoutService.getVolumeRankingForRoutine(
            routine.id,
            (data) => {
                setRanking(data);
                setRankingLoading(false);
            },
            (errors) => {
                setError(errors.message || "Error al cargar el ranking");
                setRankingLoading(false);
            }
        );
    };

    const handleBack = () => {
        navigate('/workouts/rankings');
        setSelectedRoutine(null);
        setRanking([]);
        setError(null);
    };

    if (loading) {
        return <LoadingMessage text="Cargando rutinas completadas..." />;
    }

    if (error && !selectedRoutine) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["error-message"]}>
                    {error}
                    <button onClick={() => loadCompletedRoutines(currentUser.id)} className={styles["retry-button"]}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.contenedor}>
            <div className={styles["history-titulo-grande"]}>
                <h2>Rankings por volumen</h2>
            </div>

            {!selectedRoutine ? (
                <RoutinesList
                    routines={completedRoutines}
                    onRoutineClick={handleRoutineClick}
                />
            ) : (
                <VolumeRankingView
                    routine={selectedRoutine}
                    ranking={ranking}
                    currentUser={currentUser}
                    loading={rankingLoading}
                    error={error}
                    onBack={handleBack}
                />
            )}
        </div>
    );
};

/* --------- ROUTINE LIST COMPONENT --------- */

const RoutinesList = ({ routines, onRoutineClick }) => {
    if (routines.length === 0) {
        return (
            <div className={styles["empty-message"]}>
                <p>No has completado ninguna rutina todavía.</p>
                <p>Completa una rutina para ver tu ranking.</p>
            </div>
        );
    }

    return (
        <div className={styles["routines-list"]}>
            <p className={styles["instructions"]}>
                Selecciona una rutina para ver el ranking de volumen total
            </p>
            {routines.map(routine => (
                <div
                    key={routine.id}
                    className={styles["routine-card"]}
                    onClick={() => onRoutineClick(routine)}
                    aria-hidden="true"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onRoutineClick(routine);
                        }
                    }}
                >
                    <h3>{routine.name}</h3>
                    <p className={styles["completed-count"]}>
                        Completada {routine.completedCount} {routine.completedCount === 1 ? 'vez' : 'veces'}
                    </p>
                </div>
            ))}
        </div>
    );
};

RoutinesList.propTypes = {
    routines: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            completedCount: PropTypes.number.isRequired
        })
    ).isRequired,
    onRoutineClick: PropTypes.func.isRequired
};

/* --------- VOLUME RANKING VIEW COMPONENT --------- */

const VolumeRankingView = ({ routine, ranking, currentUser, loading, error, onBack }) => {
    if (loading) {
        return (
            <div className={styles["ranking-view"]}>
                <button onClick={onBack} className={styles["back-button"]}>
                    ←
                </button>
                <LoadingMessage text="Cargando ranking..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles["ranking-view"]}>
                <button onClick={onBack} className={styles["back-button"]}>
                    ←
                </button>
                <div className={styles["error-message"]}>
                    {error}
                </div>
            </div>
        );
    }

    const currentUserRank = ranking.findIndex(entry => entry.userId === currentUser?.id) + 1;

    return (
        <div className={styles["ranking-view"]}>
            <button onClick={onBack} className={styles["back-button"]}>
                ←
            </button>

            <div className={styles["routine-header"]}>
                <h3>{routine.name}</h3>
                {currentUserRank > 0 && (
                    <p className={styles["user-position"]}>
                        Tu posición: #{currentUserRank}
                    </p>
                )}
            </div>

            {ranking.length === 0 ? (
                <div className={styles["empty-message"]}>
                    <p>No hay datos de volumen para esta rutina.</p>
                    <p>Tú o las personas que sigues aún no han completado esta rutina.</p>
                </div>
            ) : (
                <div className={styles["ranking-list"]}>
                    {ranking.map((entry, index) => (
                        <RankingEntry
                            key={entry.workoutId}
                            entry={entry}
                            position={index + 1}
                            isCurrentUser={entry.userId === currentUser?.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

VolumeRankingView.propTypes = {
    routine: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
    ranking: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.number.isRequired,
            userName: PropTypes.string.isRequired,
            userSurname: PropTypes.string.isRequired,
            workoutId: PropTypes.number.isRequired,
            startTime: PropTypes.string.isRequired,
            totalVolume: PropTypes.number.isRequired
        })
    ).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.number.isRequired
    }),
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onBack: PropTypes.func.isRequired
};

/* --------- RANKING ENTRY COMPONENT --------- */

const RankingEntry = ({ entry, position, isCurrentUser }) => {
    const getMedalEmoji = (pos) => {
        if (pos === 1) return "🥇";
        if (pos === 2) return "🥈";
        if (pos === 3) return "🥉";
        return `#${pos}`;
    };

    return (
        <div className={`${styles["ranking-entry"]} ${isCurrentUser ? styles["current-user"] : ""}`}>
            <div className={styles["position"]}>
                {getMedalEmoji(position)}
            </div>

            <div className={styles["user-info"]}>
                <span className={styles["user-name"]}>
                    {entry.userName} {entry.userSurname}
                    {isCurrentUser && <span className={styles["you-badge"]}> (Tú)</span>}
                </span>
                <span className={styles["workout-date"]}>
                    {formatDate(entry.startTime)}
                </span>
            </div>

            <div className={styles["volume"]}>
                <span className={styles["volume-value"]}>{entry.totalVolume}</span>
                <span className={styles["volume-unit"]}>kg</span>
            </div>
        </div>
    );
};

RankingEntry.propTypes = {
    entry: PropTypes.shape({
        userName: PropTypes.string.isRequired,
        userSurname: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        totalVolume: PropTypes.number.isRequired,
        userId: PropTypes.number.isRequired
    }).isRequired,
    position: PropTypes.number.isRequired,
    isCurrentUser: PropTypes.bool.isRequired
};

/* --------- HELPERS --------- */

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

export default VolumeRankingPage;