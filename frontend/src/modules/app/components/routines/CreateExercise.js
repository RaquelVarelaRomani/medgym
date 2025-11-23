import React, { useEffect, useState } from "react";
import styles from "./CreateExercise.module.css";
import { useNavigate } from "react-router-dom";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import Popup from "../common/popup/Popup";
import FileUploadButton from "../common/FileUploadButton";
import CropModal from "../common/CropModal";
import LoadingMessage from "../common/LoadingMessage";
import {createExercise, getEquipments, getMuscleGroups} from "../../../../backend/exerciseService";
import {getEquipmentText, getMuscleGroupsText} from "../../util/enumConversor";


const CreateExercise = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [titleError, setTitleError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupText, setPopupText] = useState("");
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);

    const [exerciseData, setExerciseData] = useState({
        name: "",
        description: "",
        muscleGroup: "",
        equipment: "",
        image: null,    //Guardamos la imgaen en base64
    });

    const[showCropper, setShowCropper] = useState(false);
    const[imageToCrop, setImageToCrop] = useState(null);

    // Verificar login y rol
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

    useEffect(() => {
        getMuscleGroups(
            (data) => {
                setAvailableMuscleGroups(data)
            },
            (errors) => console.error("Error loading muscle groups:", errors)
        )

        getEquipments(
            (data) => {
                setAvailableEquipment(data)
            },
            (errors) => console.error("Error loading equipment:", errors)
        )
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExerciseData((prev) => ({ ...prev, [name]: value }));

        if (name === "name" && value.length > 50) {
            setTitleError("El nombre es demasiado largo");
        } else {
            setTitleError("");
        }
    };

    const handleCancel = () => {
        navigate("/exercises");
    };

    const handleSave = () => {
        if (!exerciseData.name.trim()) {
            setTitleError("El nombre es obligatorio");
            return;
        }

        /* Llamada al backend */
        createExercise(
            exerciseData.name,
            exerciseData.description,
            exerciseData.muscleGroup,
            exerciseData.equipment,
            exerciseData.image,
            () => {
                const message =
                    currentUser.role === "ADMIN"
                        ? "Ejercicio creado correctamente"
                        : "Ejercicio creado correctamente. Pendiente de aprobación por un administrador.";
                setPopupText(message);
                setShowPopup(true);
            },
            (errors) => {
                console.error("Error creando ejercicio:", errors);
                setError("Error al crear el ejercicio. Intenta de nuevo.");
            }
        );
    };

    if (loading) return <LoadingMessage text="Cargando ejercicio..." />;
    
    return (
        <div className={styles['contenedor-create-exercise']}>
            <div className={styles['header-crear-ejercicio']}>
                <h2>Estás creando un nuevo ejercicio...</h2>
                <button
                    type="button"
                    className={styles['foto-perfil']}
                    onClick={() => navigate("/users/profile/" + currentUser.id)}
                >
                    <img
                        src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                        alt="Foto de perfil"
                    />
                </button>
            </div>

            <div className={styles['form-crear-ejercicio']}>
                <div className={styles["exercise-photo"]}>
                    {exerciseData.image ? (
                        <img
                            src={`data:image/jpeg;base64,${exerciseData.image}`}
                            alt="Previsualización del ejercicio"
                            className={styles["exercise-image"]}
                        />
                    ) : (
                        <img
                            src="./assets/default-exercise.jpg"
                            alt="Ejercicio por defecto"
                            className={styles["exercise-image"]}
                        />
                    )}
                </div>

                <FileUploadButton
                    onFileSelect={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setShowCropper(true);
                            setImageToCrop(reader.result);
                        };
                        reader.readAsDataURL(file);
                    }}
                />

                {showCropper && (
                    <CropModal
                        imageSrc={imageToCrop}
                        onCancel={() => setShowCropper(false)}
                        onSave={(croppedImage) => {
                            const base64String = croppedImage.split(",")[1];
                            setExerciseData({ ...exerciseData, image: base64String });
                            setShowCropper(false);
                        }}
                    />
                )}

                <div className={styles['form-div']}>
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Escriba aquí el nombre del ejercicio..."
                        value={exerciseData.name}
                        onChange={handleChange}
                        className={titleError ? styles['input-error'] : ""}
                    />
                    {titleError && <span className={styles['error-message']}>{titleError}</span>}
                </div>

                <div className={styles['form-div']}>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Describa brevemente el ejercicio..."
                        value={exerciseData.description}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <div className={styles["form-div"]}>
                    <label htmlFor="muscleGroup">Grupo muscular:</label>
                    <div className={styles["form-div"]}>
                        <select
                            id="muscleGroup"
                            name="muscleGroup"
                            value={exerciseData.muscleGroup}
                            onChange={handleChange}
                        >
                            <option value="">Seleccionar...</option>
                            {availableMuscleGroups.map(m => (
                                <option key={m.name} value={m.name}>{getMuscleGroupsText(m.name)}</option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className={styles["form-div"]}>
                    <label htmlFor="equipment">Equipamiento:</label>
                    <div className={styles["form-div"]}>
                        <select
                            id="equipment"
                            name="equipment"
                            value={exerciseData.equipment}
                            onChange={handleChange}
                        >
                            <option value="">Seleccionar...</option>
                            {availableEquipment.map(e => (
                                <option key={e.name} value={e.name}>{getEquipmentText(e.name)}</option>
                            ))}
                        </select>
                    </div>

                </div>

                {error && <div className={styles['error-message']}>{error}</div>}

                <div className={styles['form-actions']}>
                    <button className={styles['boton-guardar']} onClick={handleSave}>
                        Guardar
                    </button>
                    <button className={styles['boton-cancelar']} onClick={handleCancel}>
                        Cancelar
                    </button>
                </div>
            </div>
            <Popup
                show={showPopup}
                text={popupText}
                onOk={() => {
                    setShowPopup(false)
                    navigate("/exercises");
                }}
            />
        </div>
    );
};

export default CreateExercise;
