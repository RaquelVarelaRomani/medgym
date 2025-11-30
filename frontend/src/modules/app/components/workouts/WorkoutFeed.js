import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutFeed.module.css";
import LoadingMessage from "../common/LoadingMessage";
import HeartLike from "../common/HeartLike";
import CommentBubble from "../common/CommentBubble";
import CommentModal from "../common/CommentModal";
import { commentWorkout } from "../../../../backend/workoutCommentService";
import { likeWorkout, unlikeWorkout } from "../../../../backend/workoutLikeService";
import PropTypes from "prop-types";

/* --------- HELPERS PARA REDUCIR PROFUNDIDAD --------- */

function removeUserLike(likes, userId) {
    return likes.filter(like => like.userId !== userId);
}

function replaceWorkout(prevWorkouts, workoutId, updater) {
    return prevWorkouts.map(w => (w.id === workoutId ? updater(w) : w));
}

function appendCommentToWorkout(prev, workoutId, addedComment) {
    return prev.map(w =>
        w.id === workoutId
            ? { ...w, comments: [...(w.comments || []), addedComment] }
            : w
    );
}

function sortByStartTimeDesc(arr) {
    return arr.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

/* ---------- SUBCOMPONENTES ---------- */

function WorkoutHeader({ workout }) {
    return (
        <div className={styles["workout-user-line"]}>
            <img
                src={`data:image/jpeg;base64,${workout.userProfilePicture}`}
                alt="Profile"
                className={styles["workout-user-avatar"]}
            />
            <span>{`${workout.userName} ${workout.userSurname} ha terminado`}</span>
        </div>
    );
}

WorkoutHeader.propTypes = {
    workout: PropTypes.shape({
        userProfilePicture: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        userSurname: PropTypes.string.isRequired,
    }).isRequired,
};

function WorkoutTitleLine({ workout, currentUser, onLike, onComment }) {
    const liked = workout.likes.some(like => like.userId === currentUser?.id);

    return (
        <div className={styles["workout-title-line"]}>
            <h3>{workout.routineName}</h3>

            <HeartLike
                count={workout.likes.length}
                liked={liked}
                onChange={onLike}
                size={22}
            />

            <CommentBubble
                count={(workout.comments || []).length}
                onClick={onComment}
            />
        </div>
    );
}

WorkoutTitleLine.propTypes = {
    workout: PropTypes.shape({
        routineName: PropTypes.string.isRequired,
        likes: PropTypes.arrayOf(
            PropTypes.shape({
                userId: PropTypes.string.isRequired
            })
        ).isRequired,
        comments: PropTypes.array
    }).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.string
    }),
    onLike: PropTypes.func.isRequired,
    onComment: PropTypes.func.isRequired
};

function WorkoutStats({ duration }) {
    return (
        <div className={styles["workout-stats"]}>
            <span className={styles["duration"]}>{duration}</span>
        </div>
    );
}

WorkoutStats.propTypes = {
    duration: PropTypes.string
};

function WorkoutCard({ workout, currentUser, navigate, onLike, onComment }) {
    const duration =
        workout.endTime ? formatDuration(workout.startTime, workout.endTime) : null;

    return (
        <Link
            to={`/workouts/${workout.id}?returnTo=feed`}
            className={styles["caja-workout"]}
        >
            <div className={styles["workout-info"]}>
                <WorkoutHeader workout={workout} />

                <WorkoutTitleLine
                    workout={workout}
                    currentUser={currentUser}
                    onLike={onLike}
                    onComment={onComment}
                />

                <p className={styles["workout-date"]}>
                    {formatDate(workout.startTime)}
                </p>
            </div>

            <WorkoutStats duration={duration} />
        </Link>
    );
}

WorkoutCard.propTypes = {
    workout: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    onLike: PropTypes.func.isRequired,
    onComment: PropTypes.func.isRequired
};

/* ---------- FORMATTERS ---------- */

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);

    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
}

/* ---------- COMPONENTE PRINCIPAL ---------- */

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
            ({ user }) => {
                setCurrentUser(user);
                loadWorkouts();
            },
            () => navigate("/users/login")
        );
    }, [navigate]);

    const loadWorkouts = () => {
        setLoading(true);

        workoutService.getWorkoutsFromFollowing(
            data => {
                setWorkouts(sortByStartTimeDesc(data));
                setLoading(false);
            },
            errors => {
                setError(errors.globalError || "Error al cargar los entrenamientos");
                setLoading(false);
            }
        );
    };

    const handleLike = (workout, next) => {
        const updateLikes = w => ({
            ...w,
            likes: removeUserLike(w.likes, currentUser.id)
        });

        setWorkouts(prev => replaceWorkout(prev, workout.id, updateLikes));

        const api = next ? likeWorkout : unlikeWorkout;
        api(
            workout.id,
            () => {},
            () => console.error(next ? "Error al marcar favorito" : "Error al desmarcar favorito")
        );
    };

    if (loading)
        return <LoadingMessage text="Cargando feed de entrenamientos..." />;

    if (error)
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
                    {workouts.map(workout => (
                        <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            currentUser={currentUser}
                            navigate={navigate}
                            onLike={(next) => handleLike(workout, next)}
                            onComment={() => {
                                setSelectedWorkout(workout);
                                setCommentModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {commentModalOpen && (
                <CommentModal
                    open={commentModalOpen}
                    onSend={(comment) => {
                        commentWorkout(
                            selectedWorkout.id,
                            comment,
                            addedComment => {
                                setSelectedWorkout(prev => ({
                                    ...prev,
                                    comments: [...(prev.comments || []), addedComment]
                                }));

                                setWorkouts(prev =>
                                    appendCommentToWorkout(prev, selectedWorkout.id, addedComment)
                                );
                            },
                            () => console.error("Error al enviar comentario")
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
