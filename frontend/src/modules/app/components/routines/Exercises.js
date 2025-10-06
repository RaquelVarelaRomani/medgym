import React, { useState, useEffect } from "react";
// OJO! Importa estilos definidos en CSS
import "./Exercises.css";
import { Link, useNavigate} from "react-router-dom";
import {tryLoginFromServiceToken} from "../../../../backend/userService";

//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


// Definición componente funcional (el que React renderiza como pantalla)
const Exercises = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [exercises, setExercises] = useState([]);
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
    const fetchExercises = async () => {
        try {
            setLoading(true);

            // Temporary mock data
            const mockExercises = viewMode === "approved" ? [
                { id: 1, titulo: "Ejercicio nº 1", descripcion: "Descripción ejercicio nº 1", status: "approved" },
                { id: 2, titulo: "Ejercicio nº 2", descripcion: "Descripción ejercicio nº 2", status: "approved" },
                { id: 3, titulo: "Ejercicio nº 3", descripcion: "Descripción ejercicio nº 3", status: "approved" },
            ] : [
                { id: 4, titulo: "Ejercicio pendiente nº 1", descripcion: "Esperando aprobación", status: "pending" },
                { id: 5, titulo: "Ejercicio pendiente nº 2", descripcion: "Esperando aprobación", status: "pending" },
            ];
            setExercises(mockExercises);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = () => {
        if (!currentUser) return false;
        return currentUser.role === 'ADMIN';
    };


    const handleDelete = (e, exerciseId) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Delete exercise", exerciseId);
    };

    const handleApprove = async (e, exerciseId) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Approve exercise", exerciseId);
    };

    const handleReject = async (e, exerciseId) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Reject exercise", exerciseId);
    };

    const handleAddExercise = () => {
    //pag de crear exercises CAMBIAR 
    navigate("/exercises/new");
  };

    if (loading) {
        return <div className="contenedor">Cargando...</div>;
    }

  // return = lo que hay que renderizar en pantalla
    return (
        <div className="contenedor">
            {isAdmin() && (
                <div className="view-toggle-buttons">
                    <button
                        className={`toggle-button ${viewMode === 'approved' ? 'active' : ''}`}
                        onClick={() => setViewMode('approved')}
                    >
                        Ejercicios Aprobados
                    </button>
                    <button
                        className={`toggle-button ${viewMode === 'pending' ? 'active' : ''}`}
                        onClick={() => setViewMode('pending')}
                    >
                        Ejercicios Pendientes
                    </button>
                </div>
            )}

            <div className="lista-ejercicios">
                {exercises.map((exercise) => (
                    <Link
                        to={`/exercises/${exercise.id}`}
                        key={exercise.id}
                        className="caja-ejercicio"
                    >
                        <h3>{exercise.titulo}</h3>
                        <p>{exercise.descripcion}</p>

                        {viewMode === "approved" && (isAdmin()) && (
                            <button
                                className="boton-eliminar"
                                onClick={(e) => handleDelete(e, exercise.id)}
                            >
                                Eliminar
                            </button>
                        )}

                        {viewMode === "pending" && isAdmin() && (
                            <div className="approval-buttons">
                                <button
                                    className="boton-aprobar"
                                    onClick={(e) => handleApprove(e, exercise.id)}
                                >
                                    Aprobar
                                </button>
                                <button
                                    className="boton-rechazar"
                                    onClick={(e) => handleReject(e, exercise.id)}
                                >
                                    Rechazar
                                </button>
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {(isAdmin()) && (
                <button className="boton-crear" onClick={handleAddExercise}>
                    +
                </button>
            )}
        </div>
    );
};

export default Exercises;
