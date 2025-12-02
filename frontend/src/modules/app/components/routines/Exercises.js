import React, { useState, useEffect } from "react";
import styles from "./Exercises.module.css";
import { Link, useNavigate } from "react-router-dom";
import {becomePremium, tryLoginFromServiceToken} from "../../../../backend/userService";
import * as exerciseService from "../../../../backend/exerciseService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import Popup from "../common/popup/Popup";
import LoadingMessage from "../common/LoadingMessage";
import { p } from "framer-motion/client";
import GoPremiumPopup from "../common/popup/GoPremiumPopup";


const Exercises = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);
    const [exerciseToReject, setExerciseToReject] = useState(null);
    const [viewMode, setViewMode] = useState("approved");
    const [loading, setLoading] = useState(true);
    const [deleteError, setDeleteError] = useState(null);
    const [showGoPremiumPopup, setShowGoPremiumPopup] = useState(false);


    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                fetchExercises(authenticatedUser.user);
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    useEffect(() => {
        if (currentUser) fetchExercises(currentUser);
    }, [viewMode, currentUser]);

    const isAdmin = (user = currentUser) => user?.role === "ADMIN";

    //Determina si un usuario puede editar o eliminar un ejercicio
    const canEditOrDelete = (exercise) => {
        if (!currentUser) return false;
        if (currentUser.role === "ADMIN") return true;
        if (currentUser.role === "TRAINER") {
            const creatorId = exercise.creatorId ?? exercise.creator?.id;
            return creatorId === currentUser.id;
        }
        return false;
    };

    //Cargar ejercicios
    const fetchExercises = (user) => {
        setLoading(true);

        const mapExercise = (exercise) => ({
            id: exercise.id,
            titulo: exercise.name,
            descripcion: exercise.description,
            status: exercise.status,
            creatorId: exercise.creatorId ?? exercise.creator?.id ?? null,
        });

        if (viewMode === "pending" && isAdmin(user)) {
            exerciseService.getPendingExercises(
                (data) => {
                    setExercises(data.map(mapExercise));
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
                    const filtered = data.filter((e) => e.status === "APPROVED" || e.status === "BLOCKED");
                    setExercises(filtered.map(mapExercise));
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching exercises:", error);
                    setLoading(false);
                }
            );
        }
    };

    const handleDelete = (exerciseId) => {
        exerciseService.updateExerciseStatus(
            exerciseId,
            () => {
                console.log("✅ Exercise deleted successfully");
                fetchExercises(currentUser);
            },
            (error) => {
                console.error("Error al eliminar el ejercicio.", error);
                const backendMessage =
                    error?.message ||
                    error?.response?.data?.message ||
                    "No se pudo eliminar el ejercicio.";
                setDeleteError(backendMessage);
            }
        );
    };

    const handleBlock = (e, exerciseId, status) => {
        e.preventDefault();
        e.stopPropagation();
        if(status === "BLOCKED"){
            exerciseService.updateExerciseStatus(
                exerciseId,
                "APPROVED",
                () => {
                    console.log("Exercise approved successfully");
                    fetchExercises(currentUser);
                },
                (error) => console.error("Error approving exercise:", error)
            );
        } else {
            exerciseService.updateExerciseStatus(
                exerciseId,
                "BLOCKED",
                () => {
                    console.log("Exercise approved successfully");
                    fetchExercises(currentUser);
                },
                (error) => console.error("Error approving exercise:", error)
            );           
        }

    };

    const handleEdit = (exerciseId) => {
        navigate(`/exercises/edit/${exerciseId}`);
    };

    const handleApprove = (e, exerciseId) => {
        e.preventDefault();
        e.stopPropagation();
        exerciseService.updateExerciseStatus(
            exerciseId,
            "APPROVED",
            () => {
                console.log("Exercise approved successfully");
                fetchExercises(currentUser);
            },
            (error) => console.error("Error approving exercise:", error)
        );
    };

    const handleReject = (exerciseId) => {
        exerciseService.updateExerciseStatus(
            exerciseId,
            "REJECTED",
            () => {
                console.log("Exercise rejected successfully");
                fetchExercises(currentUser);
            },
            (error) => console.error("Error rejecting exercise:", error)
        );
    };

    const handleAddExercise = () => {
        if (currentUser.role === "TRAINER" && !currentUser.trainerPremium) {
            setShowGoPremiumPopup(true);
            return;
        }

        navigate("/exercises/new");
    };

    if (loading) return <LoadingMessage text="Cargando ejercicios..." />;
    return (
        <div className={styles.contenedor}>
            {isAdmin() && (
                <div className={styles["view-toggle-buttons"]}>
                    <button
                        className={`${styles["toggle-button"]} ${
                            viewMode === "approved"? styles.active : ""
                        }`}
                        onClick={() => setViewMode("approved")}
                    >
                        Ejercicios Aprobados
                    </button>
                    <button
                        className={`${styles["toggle-button"]} ${
                            viewMode === "pending" ? styles.active : ""
                        }`}
                        onClick={() => setViewMode("pending")}
                    >
                        Ejercicios Pendientes
                    </button>
                </div>
            )}

            <div className={styles["lista-ejercicios"]}>
                {exercises.map((exercise) => (
                    <Link
                        to={`/exercises/${exercise.id}`}
                        key={exercise.id}
                        className={styles["caja-ejercicio"]}
                    >
                        <h3>
                            {exercise.titulo}
                            {exercise.status === "BLOCKED" && (
                                <span className={styles["blocked-badge"]}>Bloqueado</span>
                            )}
                        </h3>
                        <p>{exercise.descripcion}</p>

                        {viewMode === "approved" && canEditOrDelete(exercise) && (
                            <div className={styles["action-buttons"]}>
                                <button
                                    className={styles["boton-editar"]}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEdit(exercise.id);
                                    }}
                                >
                                    Editar
                                </button>

                                <button
                                    className={styles["boton-eliminar"]}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExerciseToDelete(exercise.id);
                                    }}
                                >
                                    Eliminar
                                </button>
                                {isAdmin() && 
                                    <button
                                        className={styles["boton-eliminar"]}
                                        onClick={(e) => {
                                            handleBlock(e, exercise.id, exercise.status)
                                        }}
                                    >
                                        {exercise.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}
                                    </button>                                
                                }
                            </div>
                        )}

                        {viewMode === "pending" && isAdmin() && (
                            <div className={styles["approval-buttons"]}>
                                <button
                                    className={styles["boton-aprobar"]}
                                    onClick={(e) => handleApprove(e, exercise.id)}
                                >
                                    Aprobar
                                </button>
                                <button
                                    className={styles["boton-rechazar"]}
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

            {(currentUser?.role === "TRAINER" || currentUser?.role === "ADMIN") && (
                <button className={styles["boton-crear"]} onClick={handleAddExercise}>
                    +
                </button>
            )}

            <ConfirmationPopup
                text="¿Seguro que quieres eliminar este ejercicio?"
                show={exerciseToDelete !== null}
                onOk={() => {
                    if (exerciseToDelete) handleDelete(exerciseToDelete);
                    setExerciseToDelete(null);
                }}
                onCancel={() => setExerciseToDelete(null)}
            />

            <ConfirmationPopup
                text="¿Seguro que quieres rechazar este ejercicio?"
                show={exerciseToReject !== null}
                onOk={() => {
                    if (exerciseToReject) handleReject(exerciseToReject);
                    setExerciseToReject(null);
                }}
                onCancel={() => setExerciseToReject(null)}
            />

            {deleteError && (
                <Popup
                    show={true}
                    text={deleteError}
                    onOk={() => setDeleteError(null)}
                />
            )}

            <GoPremiumPopup
                show={showGoPremiumPopup}
                text={"La creación de ejercicios es una función premium."}
                onOk={() => {
                    becomePremium(
                        currentUser.id,
                        () => {
                            setCurrentUser(prev => ({ ...prev, trainerPremium: true }));
                            setShowGoPremiumPopup(false);
                        },
                        (err) => {
                            alert("Error becoming premium: " + err);
                        }
                    );
                }}
                onCancel={() => {
                    setShowGoPremiumPopup(false);
                    navigate("/exercises")
                }}
            />

        </div>
    );
};

export default Exercises;
