import React, {useEffect, useRef, useState} from "react";
import styles from "./Routines.module.css";
import { Link, useNavigate} from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import { tryLoginFromServiceToken } from "../../../../backend/userService";

const Routines = () => {
    const navigate = useNavigate();

    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [routineToDelete, setRoutineToDelete] = useState(null);
    const [filters, setFilters] = useState({difficulty: "", muscleGroup: "", trainerId: ""});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const filterRefs = useRef({});
    const [availableTrainers, setAvailableTrainers] = useState([]);
    const [availableMuscleGroups] = useState([
        "Bíceps",
        "Core",
        "Espalda",
        "Full body",
        "Hombros",
        "Pectorales",
        "Piernas",
        "Tríceps"
    ]);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                setCurrentUser(authenticatedUser.user);  // ya viene del backend
                loadAllTrainers();
                loadRoutines();                     // solo cargas rutinas si hay usuario válido
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    //close filter dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (openDropdown && filterRefs.current[openDropdown] && !filterRefs.current[openDropdown].contains(e.target)) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown) {
            document.addEventListener('click', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [openDropdown]);

    const loadAllTrainers = () => {
        routineService.getAllRoutines(
            (data) => {
                const trainers = data
                    .filter(routine => routine.trainerId && routine.trainerName)
                    .map(routine => ({
                        id: routine.trainerId,
                        name: `${routine.trainerName || ''} ${routine.trainerSurname || ''}`.trim()
                    }))
                    .filter((trainer, index, self) =>
                        index === self.findIndex(t => t.id === trainer.id)
                    );
                setAvailableTrainers(trainers);
            },
            (errors) => {
                console.error("Error loading trainers:", errors);
            }
        );
    };

    const loadRoutines = () => {
        setLoading(true);

        const hasFilters = filters.difficulty || filters.muscleGroup || filters.trainerId;

        const handleSuccess = (data) => {
            console.log("Routines loaded:", data);
            setRoutines(data);
            setLoading(false);
        };

        const handleError = (errors) => {
            console.error("Error loading routines:", errors);
            setError(errors.globalError || "Error al cargar los entrenamientos");
            setLoading(false);
        };

        if (hasFilters) {
            routineService.getFilteredRoutines(
                filters.muscleGroup || null,
                filters.difficulty || null,
                filters.trainerId || null,
                handleSuccess,
                handleError
            );
        } else {
            routineService.getAllRoutines(handleSuccess, handleError);
        }
    };

    const getDifficultyText = (difficulty) => {
        switch(difficulty) {
            case 'BEGINNER': return 'Principiante';
            case 'INTERMEDIATE': return 'Intermedia';
            case 'ADVANCED': return 'Avanzada';
            default: return difficulty;
        }
    };
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const applyFilters = () => {
        loadRoutines();
    };

    const clearFilters = () => {
        setFilters({
            difficulty: "",
            muscleGroup: "",
            trainerId: ""
        });
        // Reload without filters
        setTimeout(() => loadRoutines(), 0);
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
        navigate(`/routines/edit/${routineId}`);
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
            <div className={styles.contenedor}>
                <div className={styles['loading-message']}>Cargando entrenamientos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles['error-message']}>
                    {error}
                    <button onClick={loadRoutines} className={styles['retry-button']}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

  // return = lo que hay que renderizar en pantalla
    return (
        <div className={styles.contenedor}>
            <div className={styles['routines-header']}>
                <h2>Entrenamientos</h2>
                <button
                    className={styles['filter-toggle-button']}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    Filtrar
                </button>
            </div>

            {showFilters && (
                <div className={styles['filter-container']}>
                    <div className={styles['filter-group']}>
                        <label>Dificultad:</label>
                        <div className={styles['custom-select']} ref={(el) => {
                            filterRefs.current['difficulty'] = el;
                        }}>
                            <div
                                className={styles['select-display']}
                                onClick={() => setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty')}
                            >
                                <span>{filters.difficulty ? getDifficultyText(filters.difficulty) : 'Todas'}</span>
                                <span className={styles['select-arrow']}>▼</span>
                            </div>
                            {openDropdown === 'difficulty' && (
                                <div className={styles['select-dropdown']}>
                                    <div
                                        className={styles['select-option']}
                                        onClick={() => {
                                            handleFilterChange('difficulty', '');
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        Todas
                                    </div>
                                    <div
                                        className={styles['select-option']}
                                        onClick={() => {
                                            handleFilterChange('difficulty', 'BEGINNER');
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        Principiante
                                    </div>
                                    <div
                                        className={styles['select-option']}
                                        onClick={() => {
                                            handleFilterChange('difficulty', 'INTERMEDIATE');
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        Intermedia
                                    </div>
                                    <div
                                        className={styles['select-option']}
                                        onClick={() => {
                                            handleFilterChange('difficulty', 'ADVANCED');
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        Avanzada
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles['filter-group']}>
                    <label>Grupo Muscular:</label>
                        <div className={styles['custom-select']} ref={(el) => {
                            filterRefs.current['muscleGroup'] = el;
                        }}>
                            <div
                                className={styles['select-display']}
                                onClick={() => setOpenDropdown(openDropdown === 'muscleGroup' ? null : 'muscleGroup')}
                            >
                                <span>{filters.muscleGroup || 'Todos'}</span>
                                <span className={styles['select-arrow']}>▼</span>
                            </div>
                            {openDropdown === 'muscleGroup' && (
                                <div className={styles['select-dropdown']}>
                                    <div
                                        className={styles['select-option']}
                                        onClick={() => {
                                            handleFilterChange('muscleGroup', '');
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        Todos
                                    </div>
                                    {availableMuscleGroups.map(group => (
                                        <div
                                            key={group}
                                            className={styles['select-option']}
                                            onClick={() => {
                                                handleFilterChange('muscleGroup', group);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            {group}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles['filter-group']}>
                    <label>Entrenador:</label>
                        <div className={styles['custom-select']} ref={(el) => {
                            filterRefs.current['trainer'] = el;
                        }}>
                            <div
                                className={styles['select-display']}
                                onClick={() => setOpenDropdown(openDropdown === 'trainer' ? null : 'trainer')}
                            >
                    <span>
                        {filters.trainerId
                            ? availableTrainers.find(t => t.id === parseInt(filters.trainerId))?.name || 'Todos'
                            : 'Todos'
                        }
                    </span>
                                <span className={styles['select-arrow']}>▼</span>
                            </div>
                            {openDropdown === 'trainer' && (
                                <div className={styles['select-dropdown']}>
                                    <div
                                        className={styles['select-option']}
                                        onClick={() => {
                                            handleFilterChange('trainerId', '');
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        Todos
                                    </div>
                                    {availableTrainers.map(trainer => (
                                        <div
                                            key={trainer.id}
                                            className={styles['select-option']}
                                            onClick={() => {
                                                handleFilterChange('trainerId', trainer.id.toString());
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            {trainer.name || 'Entrenador desconocido'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles['filter-actions']}>
                    <button
                            className={styles['apply-filter-button']}
                            onClick={applyFilters}
                        >
                            Aplicar Filtros
                        </button>
                        <button
                            className={styles['clear-filter-button']}
                            onClick={clearFilters}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            <div className={styles['lista-rutinas']}>
                {routines.length === 0 ? (
                    <div className={styles['no-results']}>
                        No se encontraron rutinas con los filtros seleccionados.
                    </div>
                ) : (
                    routines.map((routine) => (
                        <Link
                            to={`/routines/${routine.id}`}
                            key={routine.id}
                            className={styles['caja-rutina']}
                        >
                            <h3>
                                {routine.name}
                                {routine.visibility === "PRIVATE" && (isRoutineCreator(routine) || isAdmin()) && (
                                    <span className={styles['private-badge']}>🔒 Privado</span>
                                )}
                            </h3>
                            <p>
                                Generado por{" "}
                                {`${routine.trainerName ?? ""} ${routine.trainerSurname ?? ""}`.trim() ||
                                    "Entrenador desconocido"}
                            </p>

                            {routine.difficulty && (
                                <span className={`${styles['routine-difficulty']} ${styles[routine.difficulty.toLowerCase()]}`}>
                                    {getDifficultyText(routine.difficulty)}
                                </span>
                            )}

                            {((isTrainer() && isRoutineCreator(routine)) || isAdmin()) && (
                                <div>
                                    <button className={styles['boton-editar']}
                                            onClick={(e) => handleEdit(e, routine.id)}>
                                        Editar
                                    </button>
                                    <button
                                        className={styles['boton-eliminar']}
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
                    ))
                )}
            </div>

            {(isTrainer() || isAdmin()) && (
                <button className={styles['boton-crear']} onClick={handleAddRoutine}>
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
