// WorkoutDetails.js
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import styles from "./WorkoutDetails.module.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as workoutService from "../../../../backend/workoutService";
import * as workoutExerciseService from "../../../../backend/workoutExerciseService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import LoadingMessage from "../common/LoadingMessage";
import PropTypes from "prop-types";
import HeartLike from "../common/HeartLike";
import {likeWorkout, unlikeWorkout} from "../../../../backend/workoutLikeService";
import AchievementPopup from "../common/popup/AchievementPopup";
import {commentWorkout} from "../../../../backend/workoutCommentService";

const WorkoutDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const returnTo = query.get("returnTo") || "/";

    const [workout, setWorkout] = useState(null);
    const [routineExercises, setRoutineExercises] = useState([]);
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [expandedExercises, setExpandedExercises] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showAchievementPopup, setShowAchievementPopup] = useState(false);
    const [newAchievements, setNewAchievements] = useState([]);
    const [newComment, setNewComment] = useState("");
    const commentsRef = useRef(null);
    const lastCommentRef = useRef(null);

    const toggleExercise = (id) =>
        setExpandedExercises(prev => ({ ...prev, [id]: !prev[id] }));

    const handleBack = () => navigate("/workouts/" + returnTo);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const duration = (start, end) => {
        if (!end) return "En progreso";
        const diff = new Date(end) - new Date(start);
        const mins = Math.floor(diff / 60000);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}min` : `${m} min`;
    };

    const loadWorkoutExercises = (workoutId, onFinish) => {
        workoutExerciseService.getWorkoutExercisesByWorkoutId(
            workoutId,
            (data) => {
                setWorkoutExercises(data || []);
                onFinish();
            },
            () => {
                setWorkoutExercises([]);
                onFinish();
            }
        );
    };

    const loadRoutineExercises = (routineId, onFinish) => {
        routineExerciseService.getRoutineExercises(
            routineId,
            (data) => {
                const arr = data.content || data;
                setRoutineExercises([...arr].sort((a, b) => a.position - b.position));
                onFinish();
            },
            () => {
                setError("Error al cargar los ejercicios");
                onFinish();
            }
        );
    };

    const loadWorkout = () => {
        const handleWorkoutLoadError = () => {
            setError("Error al cargar el entrenamiento");
            setLoading(false);
        };

        const finishLoading = () => setLoading(false);

        const handleRoutineLoaded = () => {
            loadWorkoutExercises(id, finishLoading);
        };

        const handleWorkoutLoaded = (w) => {
            setWorkout(w);
            loadRoutineExercises(w.routineId, handleRoutineLoaded);
        };

        workoutService.getWorkout(id, handleWorkoutLoaded, handleWorkoutLoadError);
    };

    const scrollToBottom = () => {
        // preferimos scrollIntoView sobre el último elemento cuando exista
        if (lastCommentRef.current) {
            lastCommentRef.current.scrollIntoView({ block: "end", behavior: "auto" });
            return;
        }
        if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        tryLoginFromServiceToken(
            ({user}) => {
                setCurrentUser(user);
                loadWorkout();
            },
            () => navigate("/users/login")
        );
    }, [id, navigate]);

    useLayoutEffect(() => {
        scrollToBottom();

        if (!commentsRef.current) return;

        // observa cambios de tamaño del contenedor (imágenes, fuentes, etc.)
        const ro = new ResizeObserver(() => {
            scrollToBottom();
        });
        ro.observe(commentsRef.current);

        return () => ro.disconnect();
    }, [workout?.comments]);

    const logged = (id) =>
        workoutExercises.filter((x) => x.routineExerciseId === id);

    const triggerWithAchievements = (apiFn, args, optimisticUpdate, finalUpdate) => {
        if (optimisticUpdate) optimisticUpdate();

        apiFn(
            ...args,
            (response) => {
                // achievements puede venir en distintas formas
                const ach =
                    response?.newAchievements ||
                    response?.achievements ||
                    (Array.isArray(response) ? response : []);

                if (finalUpdate) finalUpdate(response);

                if (ach && ach.length > 0) {
                    setNewAchievements(ach);
                    setShowAchievementPopup(true);
                }
            },
            (err) => console.error(err)
        );
    };

    const handleLike = (currentUser, workout, next) => {
        triggerWithAchievements(
            next ? likeWorkout : unlikeWorkout,
            [workout.id],
            () => {
                setWorkout(prev => ({
                    ...prev,
                    likes: next
                        ? [...prev.likes, { userId: currentUser.id }]
                        : prev.likes.filter(l => l.userId !== currentUser.id)
                }));
            },
            () => {}
        );
    };

    const handleSendComment = () => {
        const text = newComment;

        triggerWithAchievements(
            commentWorkout,
            [workout.id, text],

            // optimistic
            () => {
                setWorkout(prev => ({
                    ...prev,
                    comments: [
                        ...(prev.comments || []),
                        { id: "__temp__", text, pending: true }
                    ]
                }));
                setNewComment("");
            },

            (response) => {
                setWorkout(prev => ({
                    ...prev,
                    comments: prev.comments
                        .filter(c => c.id !== "__temp__")
                        .concat(response)
                }));
            }

        );
    };

    if (loading) return <LoadingMessage text="Cargando detalles del entrenamiento..." />;
    if (error)
        return (
            <div className={styles["contenedor-workout-details"]}>
                <div className={styles["error-container"]}>
                    <p className={styles["error-message"]}>{error}</p>
                    <button onClick={handleBack} className={styles["retry-button"]}>
                        Volver al historial
                    </button>
                </div>
            </div>
        );
    if (!workout) return null;

    return (
        <div className={styles["contenedor-workout-details"]}>
            <WorkoutHeader
                currentUser={currentUser}
                handleLike={handleLike}
                workout={workout}
                handleBack={handleBack}
                formatDate={formatDate}
                duration={duration}
            />

            <ExerciseList
                routineExercises={routineExercises}
                expandedExercises={expandedExercises}
                toggleExercise={toggleExercise}
                logged={logged}
            />

            <AchievementPopup
                show={showAchievementPopup}
                achievements={newAchievements}
                onOk={() => setShowAchievementPopup(false)}
            />

            {/* ------------------ CAJA DE COMENTARIOS (reemplazar) ------------------ */}
            <div className={styles.commentsBox}>
                <h3 className={styles.commentsTitle}>Comentarios ({workout.comments? workout.comments.length : "-"})</h3>

                <div ref={commentsRef} className={styles.commentsList}>
                    {(workout.comments || []).length === 0 ? (
                        <div className={styles.noComments}>No hay comentarios aún</div>
                    ) : (
                        (workout.comments || []).map(c => (
                            <div key={c.id} className={styles.commentItem}>
                                <img
                                    src={`data:image/jpeg;base64,${c.userProfilePicture}`}
                                    className={styles.commentAvatar}
                                    alt=""
                                    onLoad={() => {
                                        // asegura que, cuando la img se cargue y cambie altura, scrollemos
                                        setTimeout(scrollToBottom, 0);
                                    }}
                                />

                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeader}>
              <span className={styles.commentAuthor}>
                {c.userName} {c.userSurname}
              </span>
                                        <span className={styles.commentDate}>
                {new Date(c.date).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
              </span>
                                    </div>

                                    <div className={styles.commentText}>{c.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.commentInputBox}>
    <textarea
        className={styles.commentTextarea}
        placeholder="Añadir comentario..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
    />

                    <button
                        className={styles.sendCommentButton}
                        disabled={newComment.trim().length === 0}
                        onClick={handleSendComment}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutDetails;

// ------------------ COMPONENTES EXTRAIDOS ------------------

const WorkoutHeader = ({ currentUser, handleLike, workout, handleBack, formatDate, duration }) => (
    <div className={styles["caja-workout-details"]}>
        <button className={styles["boton-atras"]} onClick={handleBack}>
            ←
        </button>
        <div className={styles.headerRow}>
            <h1 className={styles["titulo-workout"]}>{workout.routineName}</h1>

            <div className={styles.headerRowIcons}>
                <HeartLike
                    count={workout.likes ? workout.likes.length : "-"}
                    liked={workout.likes ? workout.likes.some(l => l.userId === currentUser?.id) : false}
                    onChange={next => handleLike(currentUser, workout, next)}
                    size={30}
                />
            </div>
        </div>
        <div className={styles["workout-info"]}>
            <HeaderRow label="Fecha:" value={formatDate(workout.startTime)} />
            <HeaderRow
                label="Duración:"
                value={duration(workout.startTime, workout.endTime)}
            />
        </div>
    </div>
);

const HeaderRow = ({ label, value }) => (
    <div className={styles["info-item"]}>
        <span className={styles["info-label"]}>{label}</span>
        <span className={styles["info-value"]}>{value}</span>
    </div>
);

const ExerciseList = ({
                          routineExercises,
                          expandedExercises,
                          toggleExercise,
                          logged,
                      }) => (
    <div className={styles["lista-ejercicios"]}>
        {routineExercises.length === 0 ? (
            <p className={styles["no-exercises-message"]}>
                No hay ejercicios registrados
            </p>
        ) : (
            routineExercises.map((ex, idx) => (
                <ExerciseItem
                    key={ex.id}
                    exercise={ex}
                    index={idx}
                    expanded={expandedExercises[ex.id]}
                    toggleExercise={toggleExercise}
                    loggedSets={logged(ex.id)}
                />
            ))
        )}
    </div>
);

const ExerciseItem = ({ exercise, index, expanded, toggleExercise, loggedSets }) => {
    const hasData = loggedSets.length > 0;

    return (
        <div className={styles.ejercicio}>
            <button
                type="button"
                className={styles["header-ejercicio"]}
                onClick={() => toggleExercise(exercise.id)}
            >
                <h3>
                    {index + 1}. {exercise.exerciseName}
                    {hasData && <span className={styles["completed-tick"]}>✓</span>}
                </h3>

                <span className={`${styles.flecha} ${expanded ? styles.expandida : ""}`}>
                    ▼
                </span>
            </button>

            {expanded && (
                <ExerciseContent hasData={hasData} loggedSets={loggedSets} />
            )}
        </div>
    );
};

const ExerciseContent = ({ hasData, loggedSets }) =>
    hasData ? (
        <div className={styles["ejercicio-contenido"]}>
            <div className={styles["logged-sets"]}>
                <h4>Series realizadas:</h4>

                <div className={styles["sets-grid"]}>
                    {loggedSets.map((set, i) => (
                        <SetItem key={set.id} set={set} index={i} />
                    ))}
                </div>
            </div>
        </div>
    ) : (
        <p className={styles["no-data-message"]}>
            No se registraron datos para este ejercicio
        </p>
    );

const SetItem = ({ set, index }) => (
    <div className={styles["set-item"]}>
        <span className={styles["set-number"]}>Serie {index + 1}</span>
        <div className={styles["set-details"]}>
            {set.reps && (
                <span className={styles["set-stat"]}>
                    <strong>{set.reps}</strong> reps
                </span>
            )}
            {set.weight && (
                <span className={styles["set-stat"]}>
                    <strong>{set.weight}</strong> kg
                </span>
            )}
            {set.durationSeconds && (
                <span className={styles["set-stat"]}>
                    <strong>{set.durationSeconds}</strong> seg
                </span>
            )}
        </div>
    </div>
);

WorkoutHeader.propTypes = {
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    handleLike: PropTypes.func.isRequired,
    workout: PropTypes.shape({
        routineName: PropTypes.string.isRequired,
        startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
        endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
        likes: PropTypes.arrayOf(
            PropTypes.shape({
                userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
            })
        ).isRequired
    }).isRequired,
    handleBack: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    duration: PropTypes.func.isRequired
};

HeaderRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired
};

ExerciseList.propTypes = {
    routineExercises: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            exerciseName: PropTypes.string.isRequired,
            position: PropTypes.number
        })
    ).isRequired,
    expandedExercises: PropTypes.object.isRequired,
    toggleExercise: PropTypes.func.isRequired,
    logged: PropTypes.func.isRequired
};

ExerciseItem.propTypes = {
    exercise: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        exerciseName: PropTypes.string.isRequired
    }).isRequired,
    index: PropTypes.number.isRequired,
    expanded: PropTypes.bool,
    toggleExercise: PropTypes.func.isRequired,
    loggedSets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            reps: PropTypes.number,
            weight: PropTypes.number,
            durationSeconds: PropTypes.number
        })
    ).isRequired
};

ExerciseContent.propTypes = {
    hasData: PropTypes.bool.isRequired,
    loggedSets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            reps: PropTypes.number,
            weight: PropTypes.number,
            durationSeconds: PropTypes.number
        })
    ).isRequired
};

SetItem.propTypes = {
    set: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        reps: PropTypes.number,
        weight: PropTypes.number,
        durationSeconds: PropTypes.number
    }).isRequired,
    index: PropTypes.number.isRequired
};
