import React, { useState, useEffect } from "react";
// OJO! Importa estilos definidos en CSS
import styles from "./Exercises.module.css";
import { Link, useNavigate} from "react-router-dom";
import {tryLoginFromServiceToken} from "../../../../backend/userService";
import * as exerciseService from "../../../../backend/exerciseService";
import ConfirmationPopup from "../common/ConfirmationPopup";

//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


// Definición componente funcional (el que React renderiza como pantalla)
const Exercises = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);
    const [exerciseToReject, setExerciseToReject] = useState(null);
    const [viewMode, setViewMode] = useState("approved");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                fetchExercises();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    useEffect(() => {
        fetchExercises();
    }, [viewMode]);

    //CAMBIAR: ARRAY ESTATICO PORQUE LUEGO HAY QUE CONECTAR CON EL BACKEND
    const fetchExercises = () => {
        setLoading(true);

        if (viewMode === "pending" && isAdmin()) {
            exerciseService.getPendingExercises(
                (data) => {
                    const mappedExercises = data.map(exercise => ({
                        id: exercise.id,
                        titulo: exercise.name,
                        descripcion: exercise.description,
                        status: exercise.status
                    }));
                    setExercises(mappedExercises);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching pending exercises:", error);
                    setLoading(false);
                }
            );
        } else {
            exerciseService.getAllExercises(
                (data) => {
                    const filteredExercises = data.filter(exercise =>
                        exercise.status === "APPROVED"
                    );

                    const mappedExercises = filteredExercises.map(exercise => ({
                        id: exercise.id,
                        titulo: exercise.name,
                        descripcion: exercise.description,
                        status: exercise.status
                    }));

                    setExercises(mappedExercises);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching exercises:", error);
                    setLoading(false);
                }
            );
        }
    };

    const isAdmin = () => {
        if (!currentUser) return false;
        return currentUser.role === 'ADMIN';
    };

    const canAddExercise = () => {
        return currentUser.role === 'ADMIN' || currentUser.role === 'TRAINER';
    }


    const handleDelete = (exerciseId) => {
        exerciseService.deleteExercise(
            exerciseId,
            () => {
                console.log("Exercise deleted successfully");
                fetchExercises(); // Refresh the list
            },
            (error) => {
                console.error("Error deleting exercise:", error);
            }
        );
    };


    const handleApprove = (e, exerciseId) => {
        e.preventDefault();
        e.stopPropagation();

        exerciseService.updateExerciseStatus(
            exerciseId,
            "APPROVED",
            () => {
                console.log("Exercise approved successfully");
                fetchExercises(); // Refresh the list
            },
            (error) => {
                console.error("Error approving exercise:", error);
            }
        );
    };

    const handleReject = (exerciseId) => {
        console.log("handleReject called with:", exerciseId, "Type:", typeof exerciseId);

        exerciseService.updateExerciseStatus(
            exerciseId,
            "REJECTED",
            () => {
                console.log("Exercise rejected successfully");
                fetchExercises();
            },
            (error) => {
                console.error("Error rejecting exercise:", error);
            }
        );
    };

    const handleAddExercise = () => {
    //pag de crear exercises
    navigate("/exercises/new");
    };

    if (loading) {
        return <div className={styles.contenedor}>Cargando...</div>;
    }

  // return = lo que hay que renderizar en pantalla
    return (
        <div className={styles.contenedor}>
            {isAdmin() && (
                <div className={styles['view-toggle-buttons']}>
                    <button
                        className={`${styles['toggle-button']} ${viewMode === 'approved' ? styles.active : ''}`}
                        onClick={() => setViewMode('approved')}
                    >
                        Ejercicios Aprobados
                    </button>
                    <button
                        className={`${styles['toggle-button']} ${viewMode === 'pending' ? styles.active : ''}`}
                        onClick={() => setViewMode('pending')}
                    >
                        Ejercicios Pendientes
                    </button>
                </div>
            )}

            <div className={styles['lista-ejercicios']}>
                {exercises.map((exercise) => (
                    <Link
                        to={`/exercises/${exercise.id}`}
                        key={exercise.id}
                        className={styles['caja-ejercicio']}
                    >
                        <h3>{exercise.titulo}</h3>
                        <p>{exercise.descripcion}</p>

                        {viewMode === "approved" && (isAdmin()) && (
                            <button
                                className={styles['boton-eliminar']}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExerciseToDelete(exercise.id);
                                }}
                            >
                                Eliminar
                            </button>
                        )}

                        {viewMode === "pending" && isAdmin() && (
                            <div className={styles['approval-buttons']}>
                                <button
                                    className={styles['boton-aprobar']}
                                    onClick={(e) => handleApprove(e, exercise.id)}
                                >
                                Aprobar
                                </button>
                                <button
                                    className={styles['boton-rechazar']}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExerciseToReject(exercise.id);
                                    }}
                                >
                                    Rechazar
                                </button>
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {canAddExercise && (
                <button className={styles['boton-crear']} onClick={handleAddExercise}>
                    +
                </button>
            )}

            <ConfirmationPopup
                text="¿Seguro que quieres eliminar este ejercicio?"
                show={exerciseToDelete !== null}
                onOk={() => {
                    if (exerciseToDelete) {
                        handleDelete(exerciseToDelete);
                    }
                    setExerciseToDelete(null);
                }}
                onCancel={() => setExerciseToDelete(null)}
            />

            <ConfirmationPopup
                text="¿Seguro que quieres rechazar este ejercicio?"
                show={exerciseToReject !== null}
                onOk={() => {
                    if (exerciseToReject) {
                        handleReject(exerciseToReject);
                    }
                    setExerciseToReject(null);
                }}
                onCancel={() => setExerciseToReject(null)}
            />
        </div>
    );
};

export default Exercises;

