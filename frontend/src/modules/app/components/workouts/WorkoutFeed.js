import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as workoutService from "../../../../backend/workoutService";
import styles from "./WorkoutFeed.module.css";
import LoadingMessage from "../common/LoadingMessage";
import {getFollowedTrainers, getFollowers} from "../../../../backend/userFollowService"
import PropTypes from "prop-types";
import UserSearch from "../users/UserSearch";

/* --------- HELPERS PARA REDUCIR PROFUNDIDAD --------- */

function replaceWorkout(prevWorkouts, workoutId, updater) {
    return prevWorkouts.map(w => (w.id === workoutId ? updater(w) : w));
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

function WorkoutTitleLine({ workout, currentUser }) {

    return (
        <div className={styles["workout-title-line"]}>
            <h3>{workout.routineName}</h3>
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
    }).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.string
    }),
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

function WorkoutCard({ workout, currentUser }) {
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
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const userSearchComponent = useRef(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            ({ user }) => {
                setCurrentUser(user);
                loadWorkouts();
                getFollowers(
                    user.id,
                    (data) => setFollowers(data.length),
                    (error) => console.error(error)
                )
                getFollowedTrainers(
                    user.id,
                    (data) => setFollowing(data.length),
                    (error) => console.error(error)
                )
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

    const handleToggleUserSearch = () => {
        setShowUserSearch(prev => !prev);
    };

    return (
        <div className={styles.contenedor}>
            {!loading && (
                <div className={styles["profile-info"]}>

                    <div className={styles["follow-center"]}>
                        <button
                            type="button"
                            className={styles["follow-side"]}
                            onClick={() => navigate(`/users/followers/${currentUser.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    navigate(`/users/followers/${currentUser.id}`);
                                }
                            }}
                        >
                            Seguidores: {followers}
                        </button>

                        <button
                            type="button"
                            className={styles["follow-side"]}
                            onClick={() => navigate(`/users/following/${currentUser.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    navigate(`/users/following/${currentUser.id}`)};
                            }}
                        >
                            Siguiendo: {following}
                        </button>
                    </div>

                    <button
                        className={`${styles["search-button-filled"]} ${styles["search-absolute"]}`}
                        onClick={handleToggleUserSearch}
                    >
                        <img
                            src={process.env.PUBLIC_URL + "/assets/search-icon.svg"}
                            alt=""
                            className={styles["search-button-icon"]}
                        />{" "}
                        Buscar usuarios
                    </button>
                </div>
            )}
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
                        />
                    ))}
                </div>
            )}
            <UserSearch
                ref={userSearchComponent}
                isOpen={showUserSearch}
                onClose={() => setShowUserSearch(false)}
            />
        </div>
    );
};

export default WorkoutFeed;
