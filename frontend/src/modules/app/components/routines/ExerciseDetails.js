import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ExerciseDetails.module.css";
import * as exerciseService from "../../../../backend/exerciseService";
import LoadingMessage from "../common/LoadingMessage";
import { getEquipmentText, getMuscleGroupsText } from "../../util/enumConversor";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import { getRanking } from "../../../../backend/exerciseMaxWeightService";
import ExerciseRanking from "../common/ExerciseRanking";
import { h3 } from "framer-motion/client";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

const ExerciseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [ranking, setRanking] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);

    // CARGA EJERCICIO
    useEffect(() => {
        setLoading(true);
        exerciseService.getExercise(
            id,
            data => {
                setExercise(data);
                loadExerciseStats();
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
        loadExerciseStats();

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

    const loadExerciseStats = () => {
        exerciseService.getExerciseStats(
            id,
            handleStatsLoaded,
            (error) => console.error("Error cargando estadísticas:", error)
        );
    };

    const handleStatsLoaded = (data) => {
        const formatted = data.map(s => ({
            ...s,
            originalDate: s.date,
            date: new Date(s.date).toLocaleDateString()
        }));
        setStats(formatted);
        setLoading(false);
    };

    const handleError = (error) => {
        console.error("Error cargando ejercicio:", error);
        setLoading(false);
    };

    if (loading) return <LoadingMessage text="Cargando ejercicio..." />;

    if (!exercise)
        return (
            <div className={styles["contenedor-exercise-details"]}>
                Ejercicio no encontrado
            </div>
        );

    const metric = exercise.equipment && exercise.equipment !== "NONE" ? "kg" : "reps";

    const filteredStats = stats.filter(s => {
        const d = new Date(s.originalDate);
        return (
            d.getMonth() === currentMonth.getMonth() &&
            d.getFullYear() === currentMonth.getFullYear()
        );
    });

    const goPrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

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
            {stats.length > 0 && (
            <div className={styles["stats-container"]}>
                <h3 className={styles["stats-title"]}>Evolución del ejercicio</h3>

                    <div className={styles.monthSelector}>
                        <button className={styles.monthButton} onClick={goPrevMonth}>{'<'}</button>

                        <span className={styles.monthLabel}>
                            {currentMonth.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                        </span>

                        <button className={styles.monthButton} onClick={goNextMonth}>{'>'}</button>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={filteredStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                                label={{
                                    value: metric,
                                    angle: -90,
                                    position: "insideLeft",
                                    fill: "#fff",
                                    dy: 30
                                }}
                            />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#ff7b00" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>

                    {filteredStats.length === 0 && (
                        <p className={styles["no-data"]}>
                            No hay datos para este mes.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExerciseDetails;
