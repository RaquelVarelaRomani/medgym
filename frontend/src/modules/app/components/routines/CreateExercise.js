import React, { useEffect, useState } from "react";
import "./CreateExercise.css";
import { useNavigate } from "react-router-dom";
import * as exerciseService from "../../../../backend/exerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";

const CreateExercise = () => {
    const navigate = useNavigate();
    
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [exerciseData, setExerciseData] = useState({ name: "", description: ""});

    //Verificar si hay usuario logueado e identificarlo
    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);
                setLoading(false);
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    const isTrainer = () => currentUser && currentUser.role === 'TRAINER';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExerciseData((prev) => ({...prev, [name]: value}));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();

        exerciseService.createExercise(
            exerciseData.name,
            exerciseData.description,
            () => {
                navigate("/routines/exercises");
            },
            (errors) => {
                console.error("Error creating exercise:", errors);
                setError(errors.globalError || "Error al crear el ejercicio");
            }
        );
    };

    const handleProfileClick = () => {
        navigate("/users/profile");
    }

    if (loading) {
        return (
            <div className="contenedor">
                <div className="loading-message">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contenedor">
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)} className="retry-button"> Intentar de nuevo </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor">
        <img
            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
            alt="Logo"
            className="foto-perfil"
            onClick={handleProfileClick}
        />

        <div className="routines-titulo-grande">
            <h2>Crear nuevo ejercicio</h2>
        </div>

        {/* Solo mostrar el formulario si el usuario es entrenador */}
        {isTrainer() && ( 
            <form className="create-exercise-form" onSubmit={handleSubmit}>
            <label>
                Nombre del ejercicio:
                <input
                    type="text"
                    name="name"
                    value={exerciseData.name}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Descripción:
                <textarea
                    name="description"
                    value={exerciseData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                />
            </label>

            <button type="submit" className="boton-crear-ejercicio">
                Crear ejercicio
            </button>
            </form>
        )}
        </div>
    )
};

export default CreateExercise;

