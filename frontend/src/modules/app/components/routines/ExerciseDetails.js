import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ExerciseDetails.module.css";
import * as exerciseService from "../../../../backend/exerciseService";
import LoadingMessage from "../common/LoadingMessage";
import { getEquipmentText, getMuscleGroupsText } from "../../util/enumConversor";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import { getRanking } from "../../../../backend/exerciseMaxWeightService";
import ExerciseRanking from "../common/ExerciseRanking";

const ExerciseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const [ranking, setRanking] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);

    // CARGA EJERCICIO
    useEffect(() => {
        setLoading(true);
        exerciseService.getExercise(
            id,
            data => {
                setExercise(data);
                setLoading(false);
            },
            error => {
                console.error("Error cargando ejercicio:", error);
                setLoading(false);
            }
        );
    }, [id]);

    // LOGIN + RANKING
    useEffect(() => {
        if (!exercise) return;

        tryLoginFromServiceToken(
            ({ user }) => {
                setCurrentUser(user);

                getRanking(
                    exercise.id,
                    data => {
                        setRanking(data);
                        setRankingLoading(false);
                    },
                    err => {
                        console.error("Error cargando ranking:", err);
                        setRankingLoading(false);
                    }
                );
            },
            () => {
                navigate("/users/login");
            }
        );
    }, [exercise, navigate]);

    if (loading) return <LoadingMessage text="Cargando ejercicio..." />;

    if (!exercise)
        return (
            <div className={styles["contenedor-exercise-details"]}>
                Ejercicio no encontrado
            </div>
        );

    return (
        <div className={styles["contenedor-exercise-details"]}>
            <div className={styles["caja-exercise-details"]}>
                <button
                    className={styles["boton-atras"]}
                    onClick={() => navigate("/exercises")}
                >
                    ←
                </button>

                <h2 className={styles["titulo-ejercicio"]}>{exercise.name}</h2>

                {exercise.status === "BLOCKED" && (
                    <h3 className={styles["titulo-bloqueado"]}>EJERCICIO BLOQUEADO</h3>
                )}

                <div className={styles["info-ejercicio"]}>
                    <div className={styles["detalles-ejercicio"]}>
                        <p><strong>Descripción:</strong> {exercise.description}</p>
                        <p><strong>Grupo muscular:</strong> {getMuscleGroupsText(exercise.muscleGroup)}</p>
                        <p><strong>Equipamiento:</strong> {getEquipmentText(exercise.equipment)}</p>
                    </div>

                    <div className={styles["imagen-ejercicio"]}>
                        {exercise.image ? (
                            <img
                                src={`data:image/jpeg;base64,${exercise.image}`}
                                alt={exercise.name}
                            />
                        ) : (
                            <img
                                src={process.env.PUBLIC_URL + "/assets/default-exercise.jpg"}
                                alt="default"
                            />
                        )}
                    </div>
                </div>

                {/* RANKING */}
                <div className={styles.rankingBox}>
                    <h3 className={styles.rankingTitle}>Ranking peso máximo</h3>

                    {rankingLoading ? (
                        <LoadingMessage text="Cargando ranking..." />
                    ) : (
                        <ExerciseRanking ranking={ranking} currentUser={currentUser} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetails;
