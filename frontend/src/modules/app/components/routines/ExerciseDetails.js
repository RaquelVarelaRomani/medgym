import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ExerciseDetails.module.css";
import * as exerciseService from "../../../../backend/exerciseService";

const ExerciseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        exerciseService.getExercise(
        id,
        (data) => {
            setExercise(data);
            setLoading(false);
        },
        (error) => {
            console.error("Error cargando ejercicio:", error);
            setLoading(false);
        }
        );
    }, [id]);

    if (loading) return <div className={styles["contenedor-exercise-details"]}>Cargando...</div>;
    if (!exercise) return <div className={styles["contenedor-exercise-details"]}>Ejercicio no encontrado</div>;

    return (
        <div className={styles["contenedor-exercise-details"]}>
        <div className={styles["caja-exercise-details"]}>
            <button className={styles["boton-atras"]} onClick={() => navigate("/exercises")}>
            ←
            </button>

            <h2 className={styles["titulo-ejercicio"]}>{exercise.name}</h2>

            <div className={styles["info-ejercicio"]}>
            <div className={styles["detalles-ejercicio"]}>
                <p><strong>Descripción:</strong> {exercise.description}</p>
                <p><strong>Grupo muscular:</strong> {exercise.muscleGroup || "No especificado"}</p>
                <p><strong>Equipamiento:</strong> {exercise.equipment || "No especificado"}</p>
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
                    alt="Imagen por defecto"
                />
                )}
            </div>
            </div>
        </div>
        </div>
    );
};

export default ExerciseDetails;
