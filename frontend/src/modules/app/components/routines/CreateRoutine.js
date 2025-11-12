import React, {useEffect, useState, useRef} from "react";
import styles from "./CreateRoutine.module.css";
import { useNavigate } from "react-router-dom";
import * as exerciseService from "../../../../backend/exerciseService";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import LoadingMessage from "../common/LoadingMessage";

const CreateRoutine = () => {
    const navigate = useNavigate();
    const [routineData, setRoutineData] = useState({titulo: "", descripcion: "", visibility: "PUBLIC", difficulty: "INTERMEDIATE"});
    const [exercises, setExercises] = useState([{id: null, nombre: "", position: 1}]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showExerciseSearch, setShowExerciseSearch] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [titleError, setTitleError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const inputContainerRefs = useRef([]);

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = () => {
        setLoading(true);
        setError(null);

        exerciseService.getExercisesByStatus(
            "APPROVED",
            (data) => {
                const exercisesArray = data.content ? data.content : data;

                const approvedExercises = exercisesArray.filter(
                    (exercise) => exercise.status === "APPROVED"
                );

                setAvailableExercises(approvedExercises);
                setLoading(false);
            },
            (err) => {
                console.error("Error al cargar los ejercicios disponibles:", err);
                setError("Error al cargar los ejercicios disponibles");
                setLoading(false);
            }
        );
    };


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

    const filteredExercises = availableExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !exercises.some(e => e.id === exercise.id)
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
        const newId = Math.max(...exercises.map(e => e.id || 0)) + 1;
        const newPosition = exercises.length + 1;
        setExercises([...exercises, { id: newId, nombre: "", position: newPosition }]);
    };

    const handleRemoveExercise = (id) => {
        const newExercises = exercises.filter(exercise => exercise.id !== id);
        // Reassign positions
        newExercises.forEach((ex, index) => ex.position = index + 1);
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
            newExercises.sort((a, b) => a.position - b.position);
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
            newExercises.sort((a, b) => a.position - b.position);
            setExercises(newExercises);
        }
    };


    const handleSelectExercise = (exerciseIndex, selectedExercise) => {
        handleExerciseChange(exerciseIndex, "id", selectedExercise.id);
        handleExerciseChange(exerciseIndex, "nombre", selectedExercise.name);
        setShowExerciseSearch(null);
        setSearchTerm("");
    };

    const handleCancel = () => {
        navigate("/routines");
    };

    const handleSave = () => {
        if (!routineData.titulo.trim()) {
            setTitleError("El título es obligatorio");
            return;
        }

        const storedUser = sessionStorage.getItem("authenticatedUser");
        let trainerId = null;

        if (storedUser) {
            const authUser = JSON.parse(storedUser);
            trainerId = authUser.id;
        }

        routineService.createRoutine(
            routineData.titulo,
            routineData.descripcion,
            trainerId,
            routineData.visibility,
            routineData.difficulty,
            (createdRoutine) => {
                console.log("Routine created:", createdRoutine);
                const routineId = createdRoutine.id;

                //crear ejercicios
                const exercisesToSave = exercises
                    .filter(ex => ex.id !== null && ex.nombre.trim() !== "")
                    .map(ex =>
                    routineExerciseService.createRoutineExercise(
                        routineId,
                        ex.id,
                        ex.position,
                        () => {},
                        (err) => console.error("Error adding exercise:", err)
                    )
                );

                Promise.all(exercisesToSave).finally(() => {
                    navigate("/routines");
                });
            },
            (error) => {
                console.error("Error creating routine:", error);
                alert("No se pudo crear la rutina. Intenta de nuevo.");
            },
        );
    };

    if (loading) return <LoadingMessage text="Cargando ejercicios..." />;

    if (error)
        return (
            <div>
                <p>{error}</p>
                <button onClick={loadExercises}>Reintentar</button>
            </div>
        );

    return (
        <div className={styles['contenedor-create-routine']}>
            <div className={styles['header-crear-rutina']}>
                <h2>Estás creando una nueva rutina...</h2>
            </div>

            <div className={styles['form-crear-rutina']}>
                <div className={styles['form-div']}>
                    <label>Título:</label>
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Escriba aquí el título de la rutina."
                        value={routineData.titulo}
                        onChange={handleInputChange}
                        className={titleError ? styles['input-error'] : ""}
                    />
                    {titleError && <span className={styles['error-message']}>{titleError}</span>}
                </div>

                <div className={styles['form-div']}>
                    <label>Descripción de la rutina:</label>
                    <textarea
                        name="descripcion"
                        placeholder="Escriba aquí la descripción."
                        value={routineData.descripcion}
                        onChange={handleInputChange}
                        rows={3}
                    />
                </div>

                <div className={styles['form-div']}>
                    <label>Dificultad:</label>
                    <select
                        name="difficulty"
                        value={routineData.difficulty}
                        onChange={handleInputChange}
                        aria-label="Seleccionar dificultad de la rutina"
                    >
                        <option value="BEGINNER">Principiante</option>
                        <option value="INTERMEDIATE">Intermedia</option>
                        <option value="ADVANCED">Avanzada</option>
                    </select>
                </div>

                <div className={styles['form-div']}>
                    <label>Visibilidad:</label>
                    <select
                        name="visibility"
                        value={routineData.visibility}
                        onChange={handleInputChange}
                        aria-label="Seleccionar visibilidad de la rutina"
                    >
                        <option value="PUBLIC">Pública</option>
                        <option value="PRIVATE">Privada</option>
                    </select>
                </div>

                {exercises.sort((a, b) => a.position - b.position).map((exercise, index) => (
                    <div key={exercise.id} className={styles['ejercicio-item']}>
                        <label>Ejercicio {index + 1}:</label>
                        <button
                            type="button"
                            className={styles['boton-eliminar-ejercicio']}
                            onClick={() => handleRemoveExercise(exercise.id)}
                            title="Eliminar ejercicio"
                        >
                            <img
                                src={process.env.PUBLIC_URL + "/assets/papelera.svg"}
                                alt="Eliminar"
                                className={styles['icono-papelera']}
                            />
                        </button>
                        <div className={styles['ejercicio-input-container']}
                             ref={(el) => inputContainerRefs.current[index] = el}>
                            <input
                                type="text"
                                placeholder="Buscar ejercicio..."
                                value={exercise.nombre}
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
                                <div className={styles['ejercicio-dropdown']}>
                                    {filteredExercises.map((exercise, i) => (
                                        <div
                                            key={i}
                                            className={styles['ejercicio-option']}
                                            onClick={() => handleSelectExercise(index, exercise)}
                                        >
                                            {exercise.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles['exercise-controls']}>
                            <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={styles['move-button']}
                            >
                                ▲
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === exercises.length - 1}
                                className={styles['move-button']}
                            >
                                ▼
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className={styles['boton-agregar-ejercicio']}
                    onClick={handleAddExercise}
                >
                    +
                </button>

                <div className={styles['form-actions']}>
                    <button type="button" className={styles['boton-guardar-rutina']} onClick={handleSave}>
                        Guardar
                    </button>
                    <button type="button" className={styles['boton-cancelar']} onClick={handleCancel}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoutine;
