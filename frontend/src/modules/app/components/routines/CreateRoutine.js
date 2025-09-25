import React, { useState } from "react";
import "./CreateRoutine.css";
import { useNavigate } from "react-router-dom";
import RoutineDetails from "./RoutineDetails";

const CreateRoutine = () => {
    const navigate = useNavigate();

    const [routineData, setRoutineData] = useState({
        titulo: "",
        descripcion: ""
    });

    const [exercises, setExercises] = useState([{
        id: 1,
        nombre: "",
        descripcion: ""
    }]);

    const [showExerciseSearch, setShowExerciseSearch] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [titleError, setTitleError] = useState("");

    // CAMBIAR: Ejercicios de ejemplo - conectar con backend
    const availableExercises = [
        "curl biceps",
        "curl femoral sentado",
        "press banca",
        "sentadilla",
        "peso muerto"
    ];

    const filteredExercises = availableExercises.filter(exercise =>
        exercise.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoutineData(prev => ({
            ...prev,
            [name]: value
        }));

        //COMENTAR: que longitud maxima ponemos
        //CAMBIAR: poner popup de aviso
        if (name === "titulo" && value.length > 50) {
            setTitleError("El título es demasiado grande");
        } else {
            setTitleError("");
        }
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
        const newId = Math.max(...exercises.map(e => e.id)) + 1;
        setExercises([...exercises, { id: newId, nombre: "", descripcion: "" }]);
    };

    const handleSelectExercise = (exerciseIndex, exerciseName) => {
        handleExerciseChange(exerciseIndex, "nombre", exerciseName);
        setShowExerciseSearch(null);
        setSearchTerm("");
    };

    const handleCancel = () => {
        navigate("/routines");
    };

    const handleSave = () => {
        // CAMBIAR: conectar con añadir rutina en backend para guardar datos
        console.log("Añadiendo rutina:", { ...routineData, exercises });
        navigate("/routines");
    };

    return (
        <div className="contenedor-create-routine">
            <div className="header-crear-rutina">
                <h2>Estás creando un nuevo entrenamiento...</h2>
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Foto de perfil"
                    className="foto-perfil"
                />
            </div>

            <div className="form-crear-rutina">
                <div className="form-div">
                    <label>Título:</label>
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Escriba aquí el título de la rutina."
                        value={routineData.titulo}
                        onChange={handleInputChange}
                        className={titleError ? "input-error" : ""}
                    />
                    {titleError && <span className="error-message">{titleError}</span>}
                </div>

                <div className="form-div">
                    <label>Descripción de la rutina:</label>
                    <textarea
                        name="descripcion"
                        placeholder="Escriba aquí la descripción."
                        value={routineData.descripcion}
                        onChange={handleInputChange}
                        rows={3}
                    />
                </div>

                {exercises.map((exercise, index) => (
                    <div key={exercise.id} className="ejercicio-item">
                        <label>Ejercicio {index + 1}:</label>
                        <div className="ejercicio-input-container">
                            <input
                                type="text"
                                placeholder="Buscar ejercicio o escribir el nombre..."
                                value={exercise.nombre}
                                onChange={(e) => {
                                    handleExerciseChange(index, "nombre", e.target.value);
                                    setSearchTerm(e.target.value);
                                    setShowExerciseSearch(index);
                                }}
                                onFocus={() => {
                                    setShowExerciseSearch(index);
                                    setSearchTerm(exercise.nombre);
                                }}
                            />

                            {showExerciseSearch === index && searchTerm && (
                                <div className="ejercicio-dropdown">
                                    {filteredExercises.map((ex, i) => (
                                        <div
                                            key={i}
                                            className="ejercicio-option"
                                            onClick={() => handleSelectExercise(index, ex)}
                                        >
                                            {ex}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button
                    className="boton-agregar-ejercicio"
                    onClick={handleAddExercise}
                >
                    +
                </button>

                <div className="form-actions">
                    <button
                        className="boton-guardar"
                        onClick={handleSave}
                    >
                        Guardar
                    </button>

                    <button
                        className="boton-cancelar"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoutine;