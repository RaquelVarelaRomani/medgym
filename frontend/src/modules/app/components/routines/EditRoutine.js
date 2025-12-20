import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CreateRoutine.module.css";
import * as exerciseService from "../../../../backend/exerciseService";
import * as routineService from "../../../../backend/routineService";
import * as routineExerciseService from "../../../../backend/routineExerciseService";
import Popup from "../common/popup/Popup";
import LoadingMessage from "../common/LoadingMessage";
import PropTypes from "prop-types";
import {getExerciseTypeText} from "../../util/enumConversor";

function getRoutineFromResponse(data) {
    return data.content ? data.content[0] : data;
}

function mapRoutineExercises(page) {
    const list = Array.isArray(page.content) ? page.content : [];
    return list
        .map((re) => ({
            id: re.exerciseId,
            nombre: re.exerciseName || `Ejercicio #${re.exerciseId}`,
            exerciseType: re.exerciseType ?? "",
            position: re.position ?? null,
        }))
        .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
}

// Wrappers a promesas para evitar callbacks anidados
function getRoutineAsync(id) {
    return new Promise((resolve, reject) =>
        routineService.getRoutine(id, resolve, reject),
    );
}

function getRoutineExercisesAsync(id) {
    return new Promise((resolve, reject) =>
        routineExerciseService.getRoutineExercises(id, resolve, reject),
    );
}

function deleteRoutineExerciseAsync(routineId, exerciseId) {
    return new Promise((resolve, reject) =>
        routineExerciseService.deleteRoutineExercise(
            routineId,
            exerciseId,
            resolve,
            reject,
        ),
    );
}

function updateRoutineExerciseAsync(routineId, exerciseId, exerciseType, position) {
    return new Promise((resolve, reject) =>
        routineExerciseService.updateRoutineExercise(
            routineId,
            exerciseId,
            exerciseType,
            position,
            resolve,
            reject,
        ),
    );
}

function createRoutineExerciseAsync(routineId, exerciseId, exerciseType, position) {
    return new Promise((resolve, reject) =>
        routineExerciseService.createRoutineExercise(
            routineId,
            exerciseId,
            exerciseType,
            position,
            resolve,
            reject,
        ),
    );
}

function updateRoutineAsync(
    id,
    titulo,
    descripcion,
    visibility,
    difficulty,
) {
    return new Promise((resolve, reject) =>
        routineService.updateRoutine(
            id,
            titulo,
            descripcion,
            visibility,
            difficulty,
            resolve,
            reject,
        ),
    );
}

export default function EditRoutine() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [routineData, setRoutineData] = useState({
        titulo: "",
        descripcion: "",
        visibility: "PUBLIC",
        difficulty: "INTERMEDIATE",
    });
    const [originalRoutineData, setOriginalRoutineData] = useState({
        titulo: "",
        descripcion: "",
        visibility: "PUBLIC",
        difficulty: "INTERMEDIATE",
    });
    const [exercises, setExercises] = useState([]);
    const [originalExercises, setOriginalExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showExerciseSearch, setShowExerciseSearch] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [titleError, setTitleError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [popupMessage, setPopupMessage] = useState(null);
    const [exerciseTypes, setExerciseTypes] = useState([]);

    const inputContainerRefs = useRef([]);

    const loadExercises = () => {
        exerciseService.getAllExercises(
            (data) => {
                const arr = data.content || data;
                setAvailableExercises(
                    arr.sort((a, b) => a.name.localeCompare(b.name)),
                );
            },
            (err) =>
                setError(
                    "Error al cargar los ejercicios disponibles: " + err,
                ),
        );
    };

    const loadRoutine = async () => {
        setLoading(true);

        try {
            const routineResponse = await getRoutineAsync(id);
            const r = getRoutineFromResponse(routineResponse);

            const base = {
                titulo: r.name,
                descripcion: r.description,
                visibility: r.visibility,
                difficulty: r.difficulty,
            };

            setRoutineData(base);
            setOriginalRoutineData(base);

            const routineExercisesPage = await getRoutineExercisesAsync(id);
            const mapped = mapRoutineExercises(routineExercisesPage);

            setExercises(mapped);
            setOriginalExercises(JSON.parse(JSON.stringify(mapped)));
            setLoading(false);
        } catch (err) {
            console.error("Error loading routine:", err);
            setError("Error al cargar la rutina");
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExercises();
        loadRoutine();
    }, [id]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                showExerciseSearch !== null &&
                inputContainerRefs.current[showExerciseSearch] &&
                !inputContainerRefs.current[showExerciseSearch].contains(
                    e.target,
                )
            ) {
                setShowExerciseSearch(null);
                setSearchTerm("");
            }
        };

        if (showExerciseSearch !== null) {
            document.addEventListener("click", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [showExerciseSearch]);

    useEffect(() => {
        routineExerciseService.getExerciseTypes(
            setExerciseTypes,
            console.error
        );
    }, []);

    const filteredExercises = availableExercises.filter(
        (ex) =>
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !exercises.some((e) => e.id === ex.id),
    );

    const changeInput = (e) => {
        const { name, value } = e.target;

        setRoutineData((prev) => {
            const updated = { ...prev, [name]: value };
            return updated;
        });

        if (name === "titulo" && value.length > 50) {
            setTitleError("El título es demasiado grande");
        } else {
            setTitleError("");
        }
    };

    const changeExerciseField = (index, field, value) => {
        const copy = [...exercises];

        if (field === "position") {
            if (value === "") {
                copy[index][field] = null;
            } else {
                copy[index][field] = Number(value);
            }
        } else {
            copy[index][field] = value;
        }

        setExercises(copy);
    };

    const addExercise = () => {
        setShowExerciseSearch(null);
        setExercises((prev) => [
            ...prev,
            { id: null, nombre: "", exerciseType: "", position: prev.length + 1 }
        ]);
    };

    const removeExercise = (index) => {
        const arr = [...exercises];
        arr.splice(index, 1);
        arr.forEach((ex, i) => {
            ex.position = i + 1;
        });
        setExercises(arr);
    };

    const moveExercise = (index, dir) => {
        const newIndex = dir === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= exercises.length) return;

        const arr = [...exercises];
        const tmp = arr[index].position;
        arr[index].position = arr[newIndex].position;
        arr[newIndex].position = tmp;

        arr.sort(
            (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
        );
        setExercises(arr);
    };

    const selectExercise = (index, ex) => {
        changeExerciseField(index, "nombre", ex.name);
        changeExerciseField(index, "id", ex.id);
        setShowExerciseSearch(null);
        setSearchTerm("");
    };

    const cancel = () => navigate("/routines");

    const save = async () => {
        const changedFields =
            routineData.titulo !== originalRoutineData.titulo ||
            routineData.descripcion !== originalRoutineData.descripcion ||
            routineData.visibility !== originalRoutineData.visibility ||
            routineData.difficulty !== originalRoutineData.difficulty;

        const removed = originalExercises.filter(
            (oe) => !exercises.some((e) => e.id === oe.id),
        );
        const added = exercises.filter(
            (e) => e.id && !originalExercises.some((oe) => oe.id === e.id),
        );
        const updated = exercises.filter((e) => {
            const orig = originalExercises.find((oe) => oe.id === e.id);
            return orig && (
                e.position !== orig.position ||
                e.exerciseType !== orig.exerciseType
            );
        });

        const anyChange =
            changedFields ||
            removed.length > 0 ||
            added.length > 0 ||
            updated.length > 0;

        if (!anyChange) {
            setPopupMessage("¡No hay cambios para guardar!");
            return;
        }

        let errorMsg = "";
        let successMsg = "";

        // eliminados
        for (const ex of removed) {
            try {
                await deleteRoutineExerciseAsync(id, ex.id);
                successMsg += `Ejercicio ${ex.nombre} eliminado correctamente.\n`;
            } catch (err) {
                errorMsg += `Error al eliminar ${ex.nombre}: ${err.message}\n`;
            }
        }

        // actualizados
        for (const ex of updated) {
            try {
                await updateRoutineExerciseAsync(id, ex.id, ex.exerciseType, ex.position);
                successMsg += `Ejercicio ${ex.nombre} actualizado correctamente.\n`;
            } catch (err) {
                errorMsg += `Error al actualizar ${ex.nombre}: ${err.message}\n`;
            }
        }

        // añadidos
        for (const ex of added) {
            try {
                await createRoutineExerciseAsync(id, ex.id, ex.exerciseType, ex.position);
                successMsg += `Ejercicio ${ex.nombre} agregado correctamente.\n`;
            } catch (err) {
                errorMsg += `Error al agregar ${ex.nombre}: ${err.message}\n`;
            }
        }

        if (changedFields) {
            try {
                await updateRoutineAsync(
                    id,
                    routineData.titulo,
                    routineData.descripcion,
                    routineData.visibility,
                    routineData.difficulty,
                );
            } catch (err) {
                errorMsg +=
                    "Error al actualizar los datos de la rutina: " +
                    err.message +
                    "\n";
            }
        }

        if (errorMsg) {
            console.error(errorMsg);
            setPopupMessage("Ocurrió un error");
        } else {
            console.log(successMsg);
            setPopupMessage("Cambios guardados. ¡Gracias!");
        }
    };

    if (loading) return <LoadingMessage text="Cargando rutina..." />;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles["contenedor-create-routine"]}>
            <h2>Editar rutina</h2>

            <div className={styles["form-crear-rutina"]}>
                <RoutineTextFields
                    routineData={routineData}
                    titleError={titleError}
                    changeInput={changeInput}
                />

                <ExerciseList
                    exercises={exercises}
                    originalExercises={originalExercises}
                    filteredExercises={filteredExercises}
                    inputContainerRefs={inputContainerRefs}
                    showExerciseSearch={showExerciseSearch}
                    setShowExerciseSearch={setShowExerciseSearch}
                    setSearchTerm={setSearchTerm}
                    changeExerciseField={changeExerciseField}
                    selectExercise={selectExercise}
                    removeExercise={removeExercise}
                    moveExercise={moveExercise}
                    exerciseTypes={exerciseTypes}
                />

                <button
                    type="button"
                    className={styles["boton-agregar-ejercicio"]}
                    onClick={addExercise}
                >
                    +
                </button>

                <div className={styles["form-actions"]}>
                    <button
                        type="button"
                        className={styles["boton-guardar-rutina"]}
                        onClick={save}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        className={styles["boton-cancelar"]}
                        onClick={cancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            <Popup
                text={popupMessage}
                show={popupMessage !== null}
                onOk={() => {
                    const msg = popupMessage || "";
                    setPopupMessage(null);
                    if (
                        msg.includes("guardados") ||
                        msg.includes("Cambios")
                    ) {
                        navigate("/routines");
                    }
                }}
            />
        </div>
    );
}

function RoutineTextFields({ routineData, titleError, changeInput }) {
    return (
        <>
            <div className={styles["form-div"]}>
                <label htmlFor={"titulo-input"}>Título:</label>
                <input
                    id={"titulo-input"}
                    name="titulo"
                    value={routineData.titulo}
                    onChange={changeInput}
                    className={titleError ? styles["input-error"] : ""}
                />
                {titleError && (
                    <span className={styles["error-message"]}>
                        {titleError}
                    </span>
                )}
            </div>

            <div className={styles["form-div"]}>
                <label htmlFor={"descripcion-text-area"}>Descripción:</label>
                <textarea
                    id={"descripcion-text-area"}
                    name="descripcion"
                    value={routineData.descripcion}
                    onChange={changeInput}
                    rows={3}
                />
            </div>

            <div className={styles["form-div"]}>
                <label htmlFor={"dificultad-select"}>Dificultad:</label>
                <select
                    id={"dificultad-select"}
                    name="difficulty"
                    value={routineData.difficulty}
                    onChange={changeInput}
                >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedia</option>
                    <option value="ADVANCED">Avanzada</option>
                </select>
            </div>

            <div className={styles["form-div"]}>
                <label htmlFor={"visibilidad-select"}>Visibilidad:</label>
                <select
                    id={"visibilidad-select"}
                    name="visibility"
                    value={routineData.visibility}
                    onChange={changeInput}
                >
                    <option value="PUBLIC">Pública</option>
                    <option value="PRIVATE">Privada</option>
                </select>
            </div>
        </>
    );
}

function ExerciseList({
                          exercises,
                          originalExercises,
                          filteredExercises,
                          inputContainerRefs,
                          showExerciseSearch,
                          setShowExerciseSearch,
                          setSearchTerm,
                          changeExerciseField,
                          selectExercise,
                          removeExercise,
                          moveExercise,
                          exerciseTypes,
                      }) {
    return exercises.map((exercise, index) => (
        <ExerciseItem
            key={exercise.id ?? index}
            index={index}
            exercise={exercise}
            originalExercises={originalExercises}
            filteredExercises={filteredExercises}
            inputContainerRefs={inputContainerRefs}
            showExerciseSearch={showExerciseSearch}
            setShowExerciseSearch={setShowExerciseSearch}
            setSearchTerm={setSearchTerm}
            changeExerciseField={changeExerciseField}
            selectExercise={selectExercise}
            removeExercise={removeExercise}
            moveExercise={moveExercise}
            total={exercises.length}
            exerciseTypes={exerciseTypes}
        />
    ));
}

function ExerciseItem({
                          index,
                          exercise,
                          originalExercises,
                          filteredExercises,
                          inputContainerRefs,
                          showExerciseSearch,
                          setShowExerciseSearch,
                          setSearchTerm,
                          changeExerciseField,
                          selectExercise,
                          removeExercise,
                          moveExercise,
                          total,
                          exerciseTypes,
                      }) {
    const isOriginal = originalExercises.some(
        (oe) => oe.id === exercise.id,
    );

    return (
        <div className={styles["ejercicio-item"]}>
            <label htmlFor={`exercise-${index}-input`}>Ejercicio {index + 1}:</label>

            <button
                type="button"
                className={styles["boton-eliminar-ejercicio"]}
                onClick={() => removeExercise(index)}
                title="Eliminar ejercicio"
                aria-label="Eliminar ejercicio"
            >
                <img
                    src={
                        process.env.PUBLIC_URL + "/assets/papelera.svg"
                    }
                    alt="Eliminar ejercicio"
                    className={styles["icono-papelera"]}
                />
            </button>

            <div
                className={styles["ejercicio-input-container"]}
                ref={(el) => {
                    inputContainerRefs.current[index] = el;
                }}
            >
                <input
                    type="text"
                    id={`exercise-${index}-input`}
                    value={exercise.nombre}
                    disabled={isOriginal}
                    placeholder="Buscar ejercicio..."
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v !== exercise.nombre) {
                            changeExerciseField(index, "id", null);
                        }
                        changeExerciseField(index, "nombre", v);
                        setSearchTerm(v);
                        setShowExerciseSearch(index);
                    }}
                    onFocus={() => {
                        setSearchTerm(exercise.nombre);
                        setShowExerciseSearch(index);
                    }}
                />
                <select
                    value={exercise.exerciseType}
                    disabled={isOriginal}
                    onChange={(e) =>
                        changeExerciseField(index, "exerciseType", e.target.value)
                    }
                    className={styles["exercise-type-select"]}
                >
                    <option value="">Tipo de ejercicio</option>
                    {exerciseTypes.map((t, i) => (
                        <option key={`${t.name}-${i}`} value={t.name}>
                            {getExerciseTypeText(t.name)}
                        </option>
                    ))}
                </select>

                {showExerciseSearch === index && (
                    <div className={styles["ejercicio-dropdown"]}>
                        {filteredExercises.map((ex) => (
                            <button
                                key={ex.id}
                                type="button"
                                className={styles["ejercicio-option"]}
                                onClick={() => selectExercise(index, ex)}
                            >
                                {ex.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles["exercise-controls"]}>
                <button
                    type="button"
                    disabled={index === 0}
                    className={styles["move-button"]}
                    onClick={() => moveExercise(index, "up")}
                >
                    ▲
                </button>

                <button
                    type="button"
                    disabled={index === total - 1}
                    className={styles["move-button"]}
                    onClick={() => moveExercise(index, "down")}
                >
                    ▼
                </button>
            </div>
        </div>
    );
}

EditRoutine.propTypes = {};

RoutineTextFields.propTypes = {
    routineData: PropTypes.shape({
        titulo: PropTypes.string.isRequired,
        descripcion: PropTypes.string.isRequired,
        visibility: PropTypes.string.isRequired,
        difficulty: PropTypes.string.isRequired,
    }).isRequired,
    titleError: PropTypes.string,
    changeInput: PropTypes.func.isRequired,
};

ExerciseList.propTypes = {
    exercises: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            nombre: PropTypes.string.isRequired,
            position: PropTypes.number,
            exerciseType: PropTypes.string,
        })
    ).isRequired,
    originalExercises: PropTypes.array.isRequired,
    filteredExercises: PropTypes.array.isRequired,
    inputContainerRefs: PropTypes.object.isRequired,
    showExerciseSearch: PropTypes.number,
    setShowExerciseSearch: PropTypes.func.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    changeExerciseField: PropTypes.func.isRequired,
    selectExercise: PropTypes.func.isRequired,
    removeExercise: PropTypes.func.isRequired,
    moveExercise: PropTypes.func.isRequired,
    exerciseTypes: PropTypes.array.isRequired,
};

ExerciseItem.propTypes = {
    index: PropTypes.number.isRequired,
    exercise: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        nombre: PropTypes.string.isRequired,
        position: PropTypes.number,
        exerciseType: PropTypes.string,
    }).isRequired,
    originalExercises: PropTypes.array.isRequired,
    filteredExercises: PropTypes.array.isRequired,
    inputContainerRefs: PropTypes.object.isRequired,
    showExerciseSearch: PropTypes.number,
    setShowExerciseSearch: PropTypes.func.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    changeExerciseField: PropTypes.func.isRequired,
    selectExercise: PropTypes.func.isRequired,
    removeExercise: PropTypes.func.isRequired,
    moveExercise: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
    exerciseTypes: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
};