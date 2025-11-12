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
import {commentWorkout} from "../../../../backend/workoutCommentService";
import {likeWorkout, unlikeWorkout} from "../../../../backend/workoutLikeService";

const WorkoutFeed = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
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

    return (
        <div className={styles.contenedor}>

            <div className={styles["history-titulo-grande"]}>
                <h2>Feed de entrenamientos</h2>
            </div>

            {workouts.length === 0 ? (
                <div className={styles["empty-message"]}>
                    <p>No se han encontrado entrenamientos.</p>
                </div>
            ) : (
                <div className={styles["lista-workouts"]}>
                    {workouts.map((workout) => {
                        const duration = calculateDuration(workout.startTime, workout.endTime);

                        return (
                            <Link
                                to={`/workouts/${workout.id}?returnTo=feed`}
                                key={workout.id}
                                className={styles["caja-workout"]}
                            >
                                <div className={styles["workout-info"]}>
                                    <div className={styles["workout-user-line"]}>
                                        <img
                                            src={`data:image/jpeg;base64,${workout.userProfilePicture}`}
                                            alt="Profile"
                                            className={styles["workout-user-avatar"]}
                                        />
                                        <span>{`${workout.userName} ${workout.userSurname} ha terminado`}</span>
                                    </div>
                                    <div className={styles["workout-title-line"]}>
                                        <h3>{workout.routineName}</h3>
                                        <HeartLike
                                            count={(workout.likes || []).length}
                                            liked={workout.likes.some(like => like.userId === currentUser?.id) || false}
                                            onChange={(next) => {
                                                if (next) {
                                                    setWorkouts(prev =>
                                                        prev.map(w =>
                                                            w.id === workout.id
                                                                ? {
                                                                    ...w,
                                                                    likes: [...w.likes, { userId: currentUser.id }]
                                                                }
                                                                : w
                                                        )
                                                    );
                                                    likeWorkout(
                                                        workout.id,
                                                        () => {
                                                        },
                                                        () => console.error("Error al marcar como favorito")
                                                    );
                                                } else {
                                                    setWorkouts(prev =>
                                                        prev.map(w =>
                                                            w.id === workout.id
                                                                ? {
                                                                    ...w,
                                                                    likes: w.likes.filter(like => like.userId !== currentUser.id)
                                                                }
                                                                : w
                                                        )
                                                    );
                                                    unlikeWorkout(
                                                        workout.id,
                                                        () => {
                                                        },
                                                        () => console.error("Error al desmarcar como favorito")
                                                    );
                                            }}}
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
                <span className={styles["duration"]}>
                    {duration}
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
                    onSend={(comment) => {
                        commentWorkout(
                            selectedWorkout.id,
                            comment,
                            (addedComment) => {
                                console.log("Added comment:", addedComment);
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
                            },
                            () => console.error("Error al enviar el comentario")
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

export default WorkoutFeed;
