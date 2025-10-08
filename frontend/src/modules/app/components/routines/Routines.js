import React, {useEffect, useState} from "react";
// OJO! Importa estilos definidos en CSS
import "./Routines.css";
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
            <div className="contenedor">
                <div className="loading-message">Cargando entrenamientos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contenedor">
                <div className="error-message">
                    {error}
                    <button onClick={loadRoutines} className="retry-button">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

  // return = lo que hay que renderizar en pantalla
  return (
    
    // 1) Hacemos un div para agrupar todo dentro del recuadro del login
    <div className="contenedor">

        <div className="routines-titulo-grande">
            <h2>Entrenamientos:</h2>
        </div>

        <div className="lista-rutinas">
            {routines.map((routine) => ( //recorre el array de rutinas
            <Link
                to={`/routines/${routine.id}`}
                key={routine.id}
                className="caja-rutina"
            >
                <h3>{routine.name}</h3> {/*Ya usamos h2 en el titulo grande*/}
                <p>
                    Generado por{" "}
                    {`${routine.trainerName ?? ""} ${routine.trainerSurname ?? ""}`.trim() ||
                        "Entrenador desconocido"}
                </p>

                {/*boton editar y borrar para admins y creador de las rutinas*/}
                {((isTrainer() && isRoutineCreator(routine)) || isAdmin()) && (
                    <div>
                        <button className="boton-editar"
                            onClick={(e) => handleEdit(e, routine.id)}>
                            Editar
                        </button>
                        <button
                            className="boton-eliminar"
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
        <button className="boton-crear" onClick={handleAddRoutine}>
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
