import React, { useEffect, useState } from "react";
import "./CreateRoutine.css"; // Reuse same CSS
import { useNavigate, useParams } from "react-router-dom";
import * as exerciseService from "../../../../backend/exerciseService";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";

const EditRoutine = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // routine ID from URL
    console.log("Editing routine ID:", id);
    const [routineData, setRoutineData] = useState({ titulo: "", descripcion: "" });
    const [originalRoutineData, setOriginalRoutineData] = useState({ titulo: "", descripcion: "" });
    const [exercises, setExercises] = useState([{ id: null, nombre: "", descripcion: "" }]);
    const [originalExercises, setOriginalExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showExerciseSearch, setShowExerciseSearch] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [titleError, setTitleError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadExercises = () => {
        exerciseService.getAllExercises(
            (data) => {
                const exercisesArray = data.content ? data.content : data;
                setAvailableExercises(exercisesArray);
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
                console.log("Routine data:", data);
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
                            descripcion: re.exerciseDescription || re.description || "",
                        }));
                        setExercises(mappedExercises.length ? mappedExercises : [{ id: null, nombre: "", descripcion: "" }]);
                        setOriginalExercises(mappedExercises);
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

    const filteredExercises = availableExercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoutineData(prev => ({ ...prev, [name]: value }));
        if (name === "titulo" && value.length > 50) setTitleError("El título es demasiado grande");
        else setTitleError("");
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
        const newId = exercises.length ? Math.max(...exercises.map(e => e.id || 0)) + 1 : 1;
        setExercises([...exercises, { id: null, nombre: "", descripcion: "" }]);
    };

    const handleRemoveExercise = (id) => {
        setExercises(exercises.filter((ex) => ex.id !== id));
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

        const addedExercises = exercises.filter(e => e.id && !originalExercises.some(oe => oe.id === e.id));
        const removedExercises = originalExercises.filter(oe => !exercises.some(e => e.id === oe.id));

        const exercisesChanged = addedExercises.length > 0 || removedExercises.length > 0;

        if (!titleChanged && !descriptionChanged && !exercisesChanged) {
            alert("No hay cambios para guardar.");
            return;
        }

        try {
            if (titleChanged || descriptionChanged) {
                await new Promise((resolve, reject) => {
                    routineService.updateRoutine(
                        id,
                        routineData.titulo,
                        routineData.descripcion,
                        resolve,
                        reject
                    );
                });
            }

            const addPromises = addedExercises.map(ex =>
                new Promise((resolve, reject) => {
                    routineExerciseService.createRoutineExercise(id, ex.id, resolve, reject);
                })
            );

            const removePromises = removedExercises.map(ex =>
                new Promise((resolve, reject) => {
                    routineExerciseService.deleteRoutineExercise(id, ex.id, resolve, reject);
                })
            );

            await Promise.all([...addPromises, ...removePromises]);

            alert("Rutina modificada correctamente.");
            navigate(`/routines`);

        } catch (error) {
            console.error("Error saving routine:", error);
            alert("Error al guardar la rutina. Por favor, inténtelo de nuevo.");
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
                            onClick={() => handleRemoveExercise(exercise.id)}
                            title="Eliminar ejercicio"
                        >
                            <img
                                src={process.env.PUBLIC_URL + "/assets/papelera.svg"}
                                alt="Eliminar"
                                className="icono-papelera"
                            />
                        </button>
                        <div className="ejercicio-input-container">
                            <input
                                type="text"
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
                                            {ex.name}
                                        </div>
                                    ))}
                                </div>
                            )}
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