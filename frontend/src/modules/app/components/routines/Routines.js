import React, {useEffect, useState} from "react";
import styles from "./Routines.module.css";
import { Link, useNavigate} from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import ConfirmationPopup from "../common/ConfirmationPopup";
import { tryLoginFromServiceToken } from "../../../../backend/userService";

const Routines = () => {
    const navigate = useNavigate();

    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [routineToDelete, setRoutineToDelete] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);  // ya viene del backend
                loadRoutines();                     // solo cargas rutinas si hay usuario válido
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);


    const loadRoutines = () => {
        setLoading(true);
        routineService.getAllRoutines(
            (data) => {
                console.log("Routines loaded:", data);
                setRoutines(data);
                setLoading(false);
            },
            (errors) => {
                console.error("Error loading routines:", errors);
                setError(errors.globalError || "Error al cargar los entrenamientos");
                setLoading(false);
            }
        );
    };

    const getDifficultyText = (difficulty) => {
        switch(difficulty) {
            case 'BEGINNER': return 'Principiante';
            case 'INTERMEDIATE': return 'Intermedia';
            case 'ADVANCED': return 'Avanzada';
            default: return difficulty;
        }
    };

    //CAMBIAR: hacer funcion auxiliar para mapear int a role
    const isClient = () => {
        if (!currentUser) return true;
        return currentUser.role === 'CLIENT';
    };
    const isTrainer = () => {
        if (!currentUser) return false;
        return currentUser.role === 'TRAINER';
    };
    const isAdmin = () => {
        if (!currentUser) return false;
        return currentUser.role === 'ADMIN';
    };

    const isRoutineCreator = (routine) => {
        if (!currentUser || !routine.trainerId) return false;
        return currentUser.id === routine.trainerId;
    }

    const handleEdit = (e, routineId) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/routines/edit/${routineId}`); //comprobar ruta
    };

    const handleDelete = (routineId) => {
        routineService.deleteRoutine(
            routineId,
            () => {
                setRoutines(prev => prev.filter(r => r.id !== routineId));
            },
            (error) => {
                console.error("Error deleting routine:", error);
                alert("No se pudo eliminar la rutina. Intenta de nuevo.");
            }
        );
    };

    const handleAddRoutine = () => {
    //pag de crear rutinas CAMBIAR 
    navigate("/routines/new");
    };

    if (loading) {
        return (
            <div className={styles.contenedor}>
                <div className={styles['loading-message']}>Cargando entrenamientos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles['error-message']}>
                    {error}
                    <button onClick={loadRoutines} className={styles['retry-button']}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

  // return = lo que hay que renderizar en pantalla
  return (
    
    // 1) Hacemos un div para agrupar todo dentro del recuadro del login
    <div className={styles.contenedor}>

        <div className={styles['routines-titulo-grande']}>
            <h2>Entrenamientos:</h2>
        </div>

        <div className={styles['lista-rutinas']}>
            {routines.map((routine) => ( //recorre el array de rutinas
            <Link
                to={`/routines/${routine.id}`}
                key={routine.id}
                className={styles['caja-rutina']}
            >
                <h3>
                    {routine.name}
                    {routine.visibility === "PRIVATE" && (isRoutineCreator(routine) || isAdmin()) && (
                        <span className={styles['private-badge']}>🔒 Privado</span>
                    )}
                </h3> {/*Ya usamos h2 en el titulo grande*/}
                <p>
                    Generado por{" "}
                    {`${routine.trainerName ?? ""} ${routine.trainerSurname ?? ""}`.trim() ||
                        "Entrenador desconocido"}
                </p>

                {routine.difficulty && (
                    <span className={`${styles['routine-difficulty']} ${styles[routine.difficulty.toLowerCase()]}`}>
            {getDifficultyText(routine.difficulty)}
        </span>
                )}

                {/*boton editar y borrar para admins y creador de las rutinas*/}
                {((isTrainer() && isRoutineCreator(routine)) || isAdmin()) && (
                    <div>
                        <button className={styles['boton-editar']}
                            onClick={(e) => handleEdit(e, routine.id)}>
                            Editar
                        </button>
                        <button
                            className={styles['boton-eliminar']}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setRoutineToDelete(routine.id);
                            }}
                        >
                            Eliminar
                        </button>

                    </div>
                )}
            </Link>
            ))}
        </div>

        {/*Boton CREAR*/}
      {(isTrainer() || isAdmin()) && (
        <button className={styles['boton-crear']} onClick={handleAddRoutine}>
          +
        </button>
      )}

        <ConfirmationPopup
            text="Seguro que quieres eliminar esta rutina?"
            show={routineToDelete !== null}
            onOk={() => {
                if (routineToDelete) {
                    handleDelete(routineToDelete);
                }
                setRoutineToDelete(null);
            }}
            onCancel={() => setRoutineToDelete(null)}
        />

    </div>

  );
};

export default Routines;
