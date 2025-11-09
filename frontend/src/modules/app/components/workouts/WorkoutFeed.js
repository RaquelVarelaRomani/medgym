import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import * as workoutLikeService from "../../../../backend/workoutLikeService";
import styles from "./WorkoutFeed.module.css";
import LoadingMessage from "../common/LoadingMessage";
import HeartLike from "../common/HeartLike";
import CommentBubble from "../common/CommentBubble";
import CommentModal from "../common/CommentModal";

const WorkoutFeed = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [likes, setLikes] = useState({});
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                loadWorkouts();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    const loadWorkouts = () => {
        setLoading(true);

        workoutService.getWorkoutsFromFollowing(
            (data) => {
                const sorted = data.sort(
                    (a, b) => new Date(b.startTime) - new Date(a.startTime)
                );
                setWorkouts(sorted);
                setLoading(false);
            },
            (errors) => {
                setError(errors.globalError || "Error al cargar los entrenamientos");
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

    if (loading) return <LoadingMessage text="Cargando feed de entrenamientos..." />;

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["error-message"]}>
                    {error}
                    <button onClick={loadWorkouts} className={styles["retry-button"]}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    const toggleLike = (id, next) => {
        setLikes(prev => ({ ...prev, [id]: next }));
    };

    return (
        <div className={styles.contenedor}>

            <div className={styles["history-titulo-grande"]}>
                <h2>Feed de entrenamientos</h2>
            </div>

            {workouts.length === 0 ? (
                <div className={styles["empty-message"]}>
                    <p>No has realizado ningún entrenamiento todavía.</p>
                    <button className={styles["start-button"]} onClick={() => navigate("/routines")}>
                        Ver entrenamientos disponibles
                    </button>
                </div>
            ) : (
                <div className={styles["lista-workouts"]}>
                    {workouts.map((workout) => {
                        const duration = calculateDuration(workout.startTime, workout.endTime);
                        const isInProgress = !workout.endTime;
                        const message = isInProgress
                            ? `${workout.userName} ${workout.userSurname} ha comenzado`
                            : `${workout.userName} ${workout.userSurname} ha terminado`;

                        const liked = !!likes[workout.id];

                        return (
                            <Link
                                to={isInProgress ? `/workouts/session/${workout.id}` : `/workouts/${workout.id}`}
                                key={workout.id}
                                className={`${styles["caja-workout"]} ${isInProgress ? styles["active-workout"] : ""}`}
                            >
                                <div className={styles["workout-info"]}>
                                    <div className={styles["workout-user-line"]}>
                                        <img
                                            src={`data:image/jpeg;base64,${workout.userProfilePicture}`}
                                            alt="Profile"
                                            className={styles["workout-user-avatar"]}
                                        />
                                        <span>{message}</span>
                                    </div>
                                    <div className={styles["workout-title-line"]}>
                                        <h3>{workout.routineName}</h3>
                                        <HeartLike
                                            liked={liked}
                                            onChange={(next) => toggleLike(workout.id, next)}
                                            size={22}
                                        />
                                        <CommentBubble
                                            count={(workout.comments || []).length}
                                            onClick={() => {
                                                setSelectedWorkout(workout);
                                                setCommentModalOpen(true);
                                            }}
                                        />
                                    </div>

                                    <p className={styles["workout-date"]}>{formatDate(workout.startTime)}</p>
                                </div>

                                <div className={styles["workout-stats"]}>
                <span className={isInProgress ? styles["in-progress"] : styles["duration"]}>
                    {isInProgress ? "En progreso" : duration}
                </span>
                                </div>

                            </Link>
                        );
                    })}
                </div>
            )}
            {commentModalOpen && (
                <CommentModal
                    open={commentModalOpen}
                    onClose={() => setCommentModalOpen(false)}
                    workoutId={selectedWorkout?.id}
                    comments={selectedWorkout?.comments || []}
                />
            )}

        </div>
    );
};

export default WorkoutFeed;
