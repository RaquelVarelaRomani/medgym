import React, {useEffect, useState} from "react";
import "./CreateRoutine.css";
import { useNavigate } from "react-router-dom";
import RoutineDetails from "./RoutineDetails";
import * as exerciseService from "../../../../backend/exerciseService";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";


const CreateRoutine = () => {
    const navigate = useNavigate();
    const [routineData, setRoutineData] = useState({titulo: "", descripcion: ""});
    const [exercises, setExercises] = useState([{id: null, nombre: "", descripcion: ""}]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showExerciseSearch, setShowExerciseSearch] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [titleError, setTitleError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadExercises = () => {
        setLoading(true);
        setError(null);

        exerciseService.getAllExercises(
            (data) => {
                const exercisesArray = data.content ? data.content : data;
                setAvailableExercises(exercisesArray);
                setLoading(false);
            },
            (err) => {
                console.error("Error loading exercises:", err);
                setError("Error al cargar los ejercicios disponibles");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        loadExercises();
    }, []);

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
        const newId = Math.max(...exercises.map(e => e.id)) + 1;
        setExercises([...exercises, { id: newId, nombre: "", descripcion: "" }]);
    };

    const handleRemoveExercise = (id) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
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
            (createdRoutine) => {
                console.log("Routine created:", createdRoutine);
                const routineId = createdRoutine.id;

                //crear ejercicios
                const exercisesToSave = exercises.map(ex =>
                    routineExerciseService.createRoutineExercise(
                        routineId,
                        ex.id,
                        ex.descripcion,
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

    if (loading) return <div>Cargando ejercicios...</div>;
    if (error)
        return (
            <div>
                <p>{error}</p>
                <button onClick={loadExercises}>Reintentar</button>
            </div>
        );

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
                        {/*ELIMINAR (papelera)*/}
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
                                placeholder="Buscar ejercicio o escribir el nombre..."
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
                            
                            {showExerciseSearch === index && searchTerm && (
                                <div className="ejercicio-dropdown">
                                    {filteredExercises.map((exercise, i) => (
                                        <div
                                            key={i}
                                            className="ejercicio-option"
                                            onClick={() => handleSelectExercise(index, exercise)}
                                        >
                                            {exercise.name}
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