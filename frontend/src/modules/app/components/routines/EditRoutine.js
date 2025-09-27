import React, { useEffect, useState, useRef } from "react";
import "./CreateRoutine.css"; // Reuse same CSS
import { useNavigate, useParams } from "react-router-dom";
import * as exerciseService from "../../../../backend/exerciseService";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";

const EditRoutine = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // routine ID from URL
    const [routineData, setRoutineData] = useState({ titulo: "", descripcion: "" });
    const [originalRoutineData, setOriginalRoutineData] = useState({ titulo: "", descripcion: "" });
    const [exercises, setExercises] = useState([{ id: null, nombre: "", position: null }]);
    const [originalExercises, setOriginalExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showExerciseSearch, setShowExerciseSearch] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [titleError, setTitleError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const inputContainerRefs = useRef([]);

    const loadExercises = () => {
        exerciseService.getAllExercises(
            (data) => {
                const exercisesArray = data.content ? data.content : data;
                const sortedAvailableExercises = exercisesArray.sort((a, b) => a.name.localeCompare(b.name));
                setAvailableExercises(sortedAvailableExercises);
            },
            (err) => {
                console.error("Error loading exercises:", err);
                setError("Error al cargar los ejercicios disponibles");
            }
        );
    };

    const loadRoutine = () => {
        routineService.getRoutine(
            id,
            (data) => {
                const routineObj = data.content ? data.content[0] : data;
                setRoutineData({ titulo: routineObj.name, descripcion: routineObj.description });
                setOriginalRoutineData({ titulo: routineObj.name, descripcion: routineObj.description });

                routineExerciseService.getRoutineExercises(
                    id,
                    (routineExercisesPage) => {
                        const exercisesArray = Array.isArray(routineExercisesPage.content)
                            ? routineExercisesPage.content
                            : [];
                        const mappedExercises = exercisesArray.map((re) => ({
                            id: re.exerciseId,
                            nombre: re.exerciseName || `Ejercicio #${re.exerciseId}`,
                            position: re.position || null,
                        })).sort((a, b) => (a.position || Infinity) - (b.position || Infinity));
                        setExercises(mappedExercises.length ? mappedExercises : [{ id: null, nombre: "", position: null }]);
                        setOriginalExercises(JSON.parse(JSON.stringify(mappedExercises)));
                        setLoading(false);
                    },
                    (err) => {
                        console.error("Error loading routine exercises:", err);
                        setError("Error al cargar los ejercicios de la rutina");
                        setLoading(false);
                    }
                );
            },
            (err) => {
                console.error("Error loading routine:", err);
                setError("Error al cargar la rutina");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        loadExercises();
        loadRoutine();
    }, [id]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (showExerciseSearch !== null && inputContainerRefs.current[showExerciseSearch] && !inputContainerRefs.current[showExerciseSearch].contains(e.target)) {
                setShowExerciseSearch(null);
                setSearchTerm("");
            }
        };

        if (showExerciseSearch !== null) {
            document.addEventListener('click', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [showExerciseSearch]);

    const filteredExercises = availableExercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !exercises.some(e => e.id === ex.id)
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoutineData(prev => {
            const newData = { ...prev, [name]: value };
            console.log('New routineData:', newData);
            return newData;
        });
        if (name === "titulo" && value.length > 50) setTitleError("El título es demasiado grande");
        else setTitleError("");
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        if (field === "position") {
            newExercises[index][field] = value === "" ? null : Number(value);
        } else {
            newExercises[index][field] = value;
        }
        console.log('New exercises:', newExercises);
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
        setShowExerciseSearch(null);
        setExercises([...exercises, { id: null, nombre: "", position: exercises.length + 1 }]);
    };

    const handleRemoveExercise = (index) => {
        const newExercises = [...exercises];
        newExercises.splice(index, 1);
        newExercises.forEach((ex, i) => ex.position = i + 1);
        setExercises(newExercises);
    };

    const handleMoveUp = (index) => {
        if (index > 0) {
            const newExercises = [...exercises];
            // Swap positions
            const tempPos = newExercises[index].position;
            newExercises[index].position = newExercises[index - 1].position;
            newExercises[index - 1].position = tempPos;
            // Sort the array by position to reflect the new order
            newExercises.sort((a, b) => (a.position || Infinity) - (b.position || Infinity));
            setExercises(newExercises);
        }
    };

    const handleMoveDown = (index) => {
        if (index < exercises.length - 1) {
            const newExercises = [...exercises];
            // Swap positions
            const tempPos = newExercises[index].position;
            newExercises[index].position = newExercises[index + 1].position;
            newExercises[index + 1].position = tempPos;
            // Sort the array by position to reflect the new order
            newExercises.sort((a, b) => (a.position || Infinity) - (b.position || Infinity));
            setExercises(newExercises);
        }
    };

    const handleSelectExercise = (index, selectedExercise) => {
        handleExerciseChange(index, "nombre", selectedExercise.name);
        handleExerciseChange(index, "id", selectedExercise.id);
        setShowExerciseSearch(null);
        setSearchTerm("");
    };

    const handleCancel = () => {
        navigate(`/routines`);
    };

    const handleSave = async () => {

        const titleChanged = routineData.titulo !== originalRoutineData.titulo;
        const descriptionChanged = routineData.descripcion !== originalRoutineData.descripcion;

        const removedExercises = originalExercises.filter(oe => !exercises.some(e => e.id === oe.id));
        const addedExercises = exercises.filter(e => e.id && !originalExercises.some(oe => oe.id === e.id));
        const updatedExercises = exercises.filter(e => {
            const original = originalExercises.find(oe => oe.id === e.id);
            if (original) {
                const posChanged = e.position !== original.position;
                console.log(`Exercise ${e.id}: posChanged=${posChanged} (${e.position} !== ${original.position}, typeof e.pos: ${typeof e.position}, typeof orig.pos: ${typeof original.position})`);
                return posChanged;
            }
            return false;
        });

        const exercisesChanged = addedExercises.length > 0 || removedExercises.length > 0 || updatedExercises.length > 0;

        if (!titleChanged && !descriptionChanged && !exercisesChanged) {
            alert("No hay cambios para guardar.");
            return;
        }

        let successMessage = "";
        let errorMessage = "";

        for (const ex of removedExercises) {
            console.log(`Deleting exercise ${ex.nombre} (id: ${ex.id})`);
            try {
                await new Promise((resolve, reject) => {
                    routineExerciseService.deleteRoutineExercise(id, ex.id, resolve, reject);
                });
                successMessage += `Ejercicio ${ex.nombre} eliminado correctamente.\n`;
            } catch (error) {
                console.log(`Error deleting exercise ${ex.nombre}:`, error);
                errorMessage += `Error al eliminar el ejercicio ${ex.nombre}: ${error.message}\n`;
            }
        }

        // Handle position changes
        for (const ex of updatedExercises) {
            const original = originalExercises.find(oe => oe.id === ex.id);
            const posChanged = ex.position !== original.position;
            if (posChanged) {
                try {
                    await new Promise((resolve, reject) => {
                        routineExerciseService.updateRoutineExercise(id, ex.id, ex.position, resolve, reject);
                    });
                    successMessage += `Ejercicio ${ex.nombre} actualizado correctamente.\n`;
                } catch (error) {
                    console.log(`Error updating exercise:`, error);
                    errorMessage += `Error al actualizar el ejercicio ${ex.nombre}: ${error.message}\n`;
                }
            }
        }

        for (const ex of addedExercises) {
            try {
                await new Promise((resolve, reject) => {
                    routineExerciseService.createRoutineExercise(id, ex.id, ex.position, resolve, reject);
                });
                successMessage += `Ejercicio ${ex.nombre} agregado correctamente.\n`;
            } catch (error) {
                console.log(`Error adding exercise:`, error);
                errorMessage += `Error al agregar el ejercicio ${ex.nombre}: ${error.message}\n`;
            }
        }

        if (titleChanged || descriptionChanged) {
            try {
                await new Promise((resolve, reject) => {
                    routineService.updateRoutine(
                        id,
                        routineData.titulo,
                        routineData.descripcion,
                        resolve,
                        reject
                    );
                });
                successMessage += "Datos de la rutina actualizados correctamente.\n";
            } catch (error) {
                console.log(`Error updating routine:`, error);
                errorMessage += `Error al actualizar los datos de la rutina: ${error.message}\n`;
            }
        }

        if (errorMessage) {
            alert("Ocurrió un error");
        }
        if (successMessage) {
            alert("Se realizaron los cambios correctamente");
        }

        if (!errorMessage) {
            navigate(`/routines`);
        }
    };

    if (loading) return <div>Cargando rutina...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="contenedor-create-routine">
            <h2>Editar rutina</h2>
            <div className="form-crear-rutina">
                <div className="form-div">
                    <label>Título:</label>
                    <input
                        type="text"
                        name="titulo"
                        value={routineData.titulo}
                        onChange={handleInputChange}
                        className={titleError ? "input-error" : ""}
                    />
                    {titleError && <span className="error-message">{titleError}</span>}
                </div>

                <div className="form-div">
                    <label>Descripción:</label>
                    <textarea
                        name="descripcion"
                        value={routineData.descripcion}
                        onChange={handleInputChange}
                        rows={3}
                    />
                </div>

                {exercises.map((exercise, index) => (
                    <div key={index} className="ejercicio-item">
                        <label>Ejercicio {index + 1}:</label>
                        <button
                            type="button"
                            className="boton-eliminar-ejercicio"
                            onClick={() => handleRemoveExercise(index)}
                            title="Eliminar ejercicio"
                        >
                            <img
                                src={process.env.PUBLIC_URL + "/assets/papelera.svg"}
                                alt="Eliminar"
                                className="icono-papelera"
                            />
                        </button>
                        <div className="ejercicio-input-container" ref={(el) => inputContainerRefs.current[index] = el}>
                            <input
                                type="text"
                                value={exercise.nombre}
                                disabled={originalExercises.some(oe => oe.id === exercise.id)}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (newValue !== exercise.nombre) {
                                        handleExerciseChange(index, "id", null); // Clear id if changing
                                    }
                                    handleExerciseChange(index, "nombre", newValue);
                                    setSearchTerm(newValue);
                                    setShowExerciseSearch(index);
                                }}
                                onFocus={() => {
                                    setShowExerciseSearch(index);
                                    setSearchTerm(exercise.nombre);
                                }}
                            />
                            {showExerciseSearch === index && (
                                <div className="ejercicio-dropdown">
                                    {filteredExercises.map((ex, i) => (
                                        <div
                                            key={i}
                                            className="ejercicio-option"
                                            onClick={() => handleSelectExercise(index, ex)}
                                        >
                                            {ex.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="exercise-controls">
                            <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="move-button"
                            >
                                ▲
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === exercises.length - 1}
                                className="move-button"
                            >
                                ▼
                            </button>
                        </div>
                    </div>

                ))}

                <button className="boton-agregar-ejercicio" onClick={handleAddExercise}>
                    +
                </button>

                <div className="form-actions">
                    <button className="boton-guardar" onClick={handleSave}>
                        Guardar
                    </button>
                    <button className="boton-cancelar" onClick={handleCancel}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRoutine;