import React, { useEffect, useRef, useState } from "react";
import styles from "./Routines.module.css";
import { Link, useNavigate } from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import * as exerciseService from "../../../../backend/exerciseService";
import {followTrainer, unfollowTrainer, getFollowedTrainers} from "../../../../backend/userFollowService";
import HeartLike from "../common/HeartLike";
import {getLikes, likeRoutine, unlikeRoutine} from "../../../../backend/routineLikeService";
import * as workoutService from "../../../../backend/workoutService";


const Routines = () => {
    const navigate = useNavigate();

    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [routineToDelete, setRoutineToDelete] = useState(null);
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [showActiveWorkoutPopup, setShowActiveWorkoutPopup] = useState(false);
    const [filters, setFilters] = useState({difficulty: "", muscleGroup: [], equipment: [], trainerId: ""});
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
        "Tríceps",
    ]);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [following, setFollowing] = useState([]);
    const [trainerToUnfollow, setTrainerToUnfollow] = useState(null);
    const [routineLikes, setRoutineLikes] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);
    const [allRoutines, setAllRoutines] = useState([]);

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                const user = authenticatedUser.user;
                setCurrentUser(user);
                loadAllTrainers();
                loadAllEquipment();
                loadRoutines();
                loadRoutineLikes();
                if (user.role === "CLIENT") {
                    loadFollowing(user.id);
                    checkActiveWorkout();
                }
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);


    const checkActiveWorkout = () => {
    workoutService.getWorkouts(
      (data) => {
        const active = data.find((w) => !w.endTime);
        if (active) setActiveWorkout(active);
      },
      (error) => console.error("Error comprobando entrenamientos activos", error)
    );
  };

    const loadFollowing = (userId) => {
        getFollowedTrainers(
            userId,
            (data) => {
                const trainerIds = data.map((f) => f.trainerId);
                setFollowing(trainerIds);
            },
            (err) => console.error("Error cargando follows", err)
        );
    };

    //close search autocomplete dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchResults(false);
            }
        };

        if (showSearchResults) {
            document.addEventListener('click', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [showSearchResults]);

    //close filter dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                openDropdown &&
                filterRefs.current[openDropdown] &&
                !filterRefs.current[openDropdown].contains(e.target)
            ) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown) {
            document.addEventListener("click", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [openDropdown]);

    const loadAllTrainers = () => {
        routineService.getAllRoutines(
            (data) => {
                const trainers = data
                    .filter((r) => r.trainerId && r.trainerName)
                    .map((r) => ({
                        id: r.trainerId,
                        name: `${r.trainerName || ""} ${r.trainerSurname || ""}`.trim(),
                    }))
                    .filter(
                        (t, i, self) => i === self.findIndex((x) => x.id === t.id)
                    );
                setAvailableTrainers(trainers);
            },
            (errors) => console.error("Error loading trainers:", errors)
        );
    };

    const loadAllEquipment = () => {
        exerciseService.getAllExercises(
            (data) => {
                const exercisesArray = data.content ? data.content : data;
                const equipment = [...new Set(exercisesArray
                    .filter(exercise => exercise.equipment)
                    .map(exercise => exercise.equipment)
                )].sort();
                setAvailableEquipment(equipment);
            },
            (errors) => {
                console.error("Error loading equipment:", errors);
            }
        );
    };

    const loadRoutines = (filtersToUse = filters) => {
        setLoading(true);

        const hasFilters = filtersToUse.difficulty || filtersToUse.muscleGroup.length > 0 ||
            filtersToUse.equipment.length > 0 || filtersToUse.trainerId;

        const handleSuccess = (data) => {
            setRoutines(data);
            setAllRoutines(data);
            setLoading(false);
        };

        const loadFollowing = (userId) => {
            getFollowedTrainers(
                userId,
                (data) => {
                    const trainerIds = data.map((f) => f.trainerId);
                    setFollowing(trainerIds);
                },
                (err) => console.error("Error cargando follows", err)
            );
        };

        const handleError = (errors) => {
            console.error("Error loading routines:", errors);
            setError(errors.globalError || "Error al cargar los entrenamientos");
            setLoading(false);
        };

        if (hasFilters) {
            routineService.getFilteredRoutines(
                filtersToUse.muscleGroup.join(',') || null,
                filtersToUse.equipment.join(',') || null,
                filtersToUse.difficulty || null,
                filtersToUse.trainerId || null,
                handleSuccess,
                handleError
            );
        } else {
            routineService.getAllRoutines(handleSuccess, handleError);
        }
    };

    const loadRoutineLikes = () => {
        getLikes(
            data => setRoutineLikes(data),
            error => console.error("Error loading routine likes:", error)
        )
    }

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case "BEGINNER":
                return "Principiante";
            case "INTERMEDIATE":
                return "Intermedia";
            case "ADVANCED":
                return "Avanzada";
            default:
                return difficulty;
        }
    };

    const handleMultiSelectChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: prev[filterName].includes(value)
                ? prev[filterName].filter(item => item !== value)
                : [...prev[filterName], value]
        }));
    };
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const applyFilters = () => {
        setSearchTerm("");
        loadRoutines(filters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            difficulty: "",
            muscleGroup: [],
            equipment: [],
            trainerId: ""
        };
        setFilters(clearedFilters);
        setSearchTerm("");
        loadRoutines(clearedFilters);
    };

    const searchRoutines = () => {
        if (!searchTerm.trim()) return [];

        const searchLower = searchTerm.toLowerCase();
        return allRoutines.filter(routine => {
            const routineName = routine.name?.toLowerCase() || "";
            const trainerFullName = `${routine.trainerName || ""} ${routine.trainerSurname || ""}`.toLowerCase().trim();

            return routineName.includes(searchLower) || trainerFullName.includes(searchLower);
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            setShowSearchResults(true);
            const searchLower = value.toLowerCase();
            const filtered = allRoutines.filter(routine => {
                const routineName = routine.name?.toLowerCase() || "";
                const trainerFullName = `${routine.trainerName || ""} ${routine.trainerSurname || ""}`.toLowerCase().trim();

                return routineName.includes(searchLower) || trainerFullName.includes(searchLower);
            });
            setRoutines(filtered);
        } else {
            setShowSearchResults(false);
            loadRoutines();
        }
    };

    const handleSelectSearchedRoutine = (routine) => {
        setSearchTerm(routine.name);
        setShowSearchResults(false);
        setRoutines([routine]);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setShowSearchResults(false);
        loadRoutines();
    };

    const handleFollowToggle = (trainerId) => {
        if (following.includes(trainerId)) {
            // Mostrar popup de confirmación antes de dejar de seguir
            setTrainerToUnfollow(trainerId);
        } else {
            followTrainer(
                trainerId,
                () => setFollowing((prev) => [...prev, trainerId]),
                () => console.error("Error al seguir entrenador")
            );
        }
    };

    const isTrainer = () => currentUser?.role === "TRAINER";
    const isAdmin = () => currentUser?.role === "ADMIN";
    const isClient = () => currentUser?.role === "CLIENT";

    const isRoutineCreator = (routine) =>
        currentUser && routine.trainerId === currentUser.id;

    const handleEdit = (e, routineId) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/routines/edit/${routineId}`);
    };

    const handleDelete = (routineId) => {
        routineService.deleteRoutine(
            routineId,
            () => {
                setRoutines((prev) => prev.filter((r) => r.id !== routineId));
                window.dispatchEvent(new CustomEvent("routineDeleted"));
            },
            (error) => {
                console.error("Error deleting routine:", error);
                alert("No se pudo eliminar la rutina. Intenta de nuevo.");
            }
        );
    };

    const handleAddRoutine = () => navigate("/routines/new");


    const handleStartWorkout = (e, routineId) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeWorkout) {
      setShowActiveWorkoutPopup(true);
      return;
    }

    workoutService.startWorkout(
      routineId,
      (workoutData) => {
        console.log("Workout iniciado:", workoutData);
        navigate(`/workouts/session/${workoutData.id}`);
      },
      (error) => {
        console.error("Error al iniciar entrenamiento:", error);
        alert("No se pudo iniciar el entrenamiento. Inténtelo de nuevo.");
      }
    );
  };

    if (loading) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["loading-message"]}>
                    Cargando entrenamientos...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["error-message"]}>
                    {error}
                    <button
                        onClick={loadRoutines}
                        className={styles["retry-button"]}
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.contenedor}>
            <div className={styles["routines-header"]}>
                <h2>Entrenamientos</h2>
                <button
                    className={styles["filter-toggle-button"]}
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
                        <label>Grupos Musculares:</label>
                        <div className={styles['custom-select']} ref={(el) => {
                            filterRefs.current['muscleGroup'] = el;
                        }}>
                            <div
                                className={styles['select-display']}
                                onClick={() => setOpenDropdown(openDropdown === 'muscleGroup' ? null : 'muscleGroup')}
                            >
                <span>
                    {filters.muscleGroup.length > 0
                        ? `${filters.muscleGroup.length} seleccionado${filters.muscleGroup.length > 1 ? 's' : ''}`
                        : 'Todos'
                    }
                </span>
                                <span className={styles['select-arrow']}>▼</span>
                            </div>
                            {openDropdown === 'muscleGroup' && (
                                <div className={styles['select-dropdown']}>
                                    {availableMuscleGroups.map(group => (
                                        <div
                                            key={group}
                                            className={styles['select-option-multi']}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMultiSelectChange('muscleGroup', group);  // Singular
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.muscleGroup.includes(group)}  // Singular
                                                onChange={() => {
                                                }}
                                                className={styles['checkbox']}
                                            />
                                            <span>{group}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles['filter-group']}>
                        <label>Equipamiento:</label>
                        <div className={styles['custom-select']} ref={(el) => {
                            filterRefs.current['equipment'] = el;
                        }}>
                            <div
                                className={styles['select-display']}
                                onClick={() => setOpenDropdown(openDropdown === 'equipment' ? null : 'equipment')}
                            >
                        <span>
                            {filters.equipment.length > 0
                                ? `${filters.equipment.length} seleccionado${filters.equipment.length > 1 ? 's' : ''}`
                                : 'Todos'
                            }
                        </span>
                                <span className={styles['select-arrow']}>▼</span>
                            </div>
                            {openDropdown === 'equipment' && (
                                <div className={styles['select-dropdown']}>
                                    {availableEquipment.map(equip => (
                                        <div
                                            key={equip}
                                            className={styles['select-option-multi']}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMultiSelectChange('equipment', equip);
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.equipment.includes(equip)}
                                                onChange={() => {
                                                }}
                                                className={styles['checkbox']}
                                            />
                                            <span>{equip}</span>
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

            <div className={styles["search-container"]} ref={searchRef}>
                <h3 className={styles['search-title']}>Buscar entrenamientos</h3>
                <div className={styles['search-input-wrapper']}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre de rutina o entrenador..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => searchTerm && setShowSearchResults(true)}
                        className={styles["search-input"]}
                    />
                    {searchTerm && (
                        <button
                            className={styles["clear-search-btn"]}
                            onClick={handleClearSearch}
                            type="button"
                        >
                            ✕
                        </button>
                    )}

                    {showSearchResults && searchTerm && (
                        <div className={styles["search-dropdown"]}>
                            {searchRoutines().length > 0 ? (
                                searchRoutines().slice(0, 5).map((routine) => (
                                    <div
                                        key={routine.id}
                                        className={styles["search-result-item"]}
                                        onClick={() => handleSelectSearchedRoutine(routine)}
                                    >
                                        <div className={styles["search-result-name"]}>
                                            {routine.name}
                                        </div>
                                        <div className={styles["search-result-trainer"]}>
                                            {`${routine.trainerName || ""} ${routine.trainerSurname || ""}`.trim() || "Entrenador desconocido"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles["no-search-results"]}>
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles["lista-rutinas"]}>
                {routines.length === 0 ? (
                    <div className={styles["no-results"]}>
                        No se encontraron rutinas con los filtros seleccionados.
                    </div>
                ) : (
                    routines.map((routine) => (
                        <Link
                            to={activeWorkout && activeWorkout.routineId === routine.id ? `/workouts/session/${activeWorkout.id}` : `/routines/${routine.id}`}
                            key={routine.id}
                            className={styles["caja-rutina"]}
                        >
                            <h3>
                                {routine.name}
                                <HeartLike
                                    initialLiked={routineLikes.some(like => like.routineId === routine.id)}
                                    onChange={(liked) => {
                                        if (liked) {
                                            likeRoutine(routine.id);
                                            setRoutineLikes(prevLikes => [
                                                ...prevLikes,
                                                {routineId: routine.id, userId: currentUser.id}
                                            ]);
                                        } else {
                                            unlikeRoutine(routine.id);
                                            setRoutineLikes(prevLikes =>
                                                prevLikes.filter(like => like.routineId !== routine.id)
                                            );
                                        }
                                    }}
                                />


                                {routine.visibility === "PRIVATE" &&
                                    (isRoutineCreator(routine) || isAdmin()) && (
                                        <span className={styles["private-badge"]}>
                                            🔒 Privado
                                        </span>
                                    )}
                            </h3>

                            {isClient() && (
                                <button
                                    className={styles["boton-empezar-redondo"]}
                                    onClick={(e) => handleStartWorkout(e, routine.id)}
                                >
                                    Empezar
                                </button>
                            )}


                            <div className={styles["trainer-info"]}>
                                <p className={styles["trainer-name"]}>
                                    Generado por{" "}
                                    {`${routine.trainerName ?? ""} ${
                                        routine.trainerSurname ?? ""
                                    }`.trim() || "Entrenador desconocido"}
                                </p>

                                {isClient() && routine.trainerId && (
                                    <button
                                        className={`${styles["filter-toggle-button"]} ${styles["follow-btn"]}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleFollowToggle(routine.trainerId);
                                        }}
                                    >
                                        {following.includes(routine.trainerId)
                                            ? "Dejar de seguir al creador"
                                            : "Seguir al creador"}
                                    </button>
                                )}
                            </div>

                            {routine.difficulty && (
                                <span
                                    className={`${styles['routine-difficulty']} ${styles[routine.difficulty.toLowerCase()]}`}>

                                    {getDifficultyText(routine.difficulty)}
                                </span>
                            )}

                            {((isTrainer() && isRoutineCreator(routine)) ||
                                isAdmin()) && (
                                <div>
                                    <button
                                        className={styles["boton-editar"]}
                                        onClick={(e) => handleEdit(e, routine.id)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className={styles["boton-eliminar"]}
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
                <button
                    className={styles["boton-crear"]}
                    onClick={handleAddRoutine}
                >
                    +
                </button>
            )}

            <ConfirmationPopup
                text="Seguro que quieres eliminar esta rutina?"
                show={routineToDelete !== null}
                onOk={() => {
                    if (routineToDelete) handleDelete(routineToDelete);
                    setRoutineToDelete(null);
                }}
                onCancel={() => setRoutineToDelete(null)}
            />


            <ConfirmationPopup
                show={showActiveWorkoutPopup}
                text="Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?"
                okText="Ir al entrenamiento activo"
                cancelText="Cancelar"
                onOk={() => {
                    setShowActiveWorkoutPopup(false);
                    if (activeWorkout) navigate(`/workouts/session/${activeWorkout.id}`);
                }}
                onCancel={() => setShowActiveWorkoutPopup(false)}
            />

            <ConfirmationPopup
                text="¿Seguro que quieres dejar de seguir a este entrenador?"
                show={trainerToUnfollow !== null}
                onOk={() => {
                    if (trainerToUnfollow) {
                        unfollowTrainer(
                            trainerToUnfollow,
                            () => setFollowing((prev) =>
                                prev.filter((id) => id !== trainerToUnfollow)
                            ),
                            () => console.error("Error al dejar de seguir entrenador")
                        );
                    }
                    setTrainerToUnfollow(null);
                }}
                onCancel={() => setTrainerToUnfollow(null)}
            />
        </div>
    );
};

export default Routines;
