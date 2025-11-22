import React, { useEffect, useRef, useState } from "react";
import styles from "./Routines.module.css";
import { Link, useNavigate } from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import { becomePremium, tryLoginFromServiceToken } from "../../../../backend/userService";
import { getMuscleGroups, getEquipments } from "../../../../backend/exerciseService";
import { followTrainer, unfollowTrainer, getFollowedTrainers } from "../../../../backend/userFollowService";
import HeartLike from "../common/HeartLike";
import { getRoutineLikes, likeRoutine, unlikeRoutine } from "../../../../backend/routineLikeService";
import * as workoutService from "../../../../backend/workoutService";
import { getDifficultyText, getEquipmentText, getMuscleGroupsText } from "../../util/enumConversor";
import GoPremiumPopup from "../common/popup/GoPremiumPopup";
import PropTypes from "prop-types";

const Routines = () => {
    const navigate = useNavigate();

    const [routines, setRoutines] = useState([]);
    const [allRoutines, setAllRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [routineToDelete, setRoutineToDelete] = useState(null);
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [showActiveWorkoutPopup, setShowActiveWorkoutPopup] = useState(false);

    const [filters, setFilters] = useState({
        difficulty: "",
        muscleGroup: [],
        equipment: [],
        trainerId: ""
    });

    const [openDropdown, setOpenDropdown] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const filterRefs = useRef({});
    const searchRef = useRef(null);

    const [availableTrainers, setAvailableTrainers] = useState([]);
    const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
    const [availableEquipment, setAvailableEquipment] = useState([]);

    const [following, setFollowing] = useState([]);
    const [trainerToUnfollow, setTrainerToUnfollow] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);

    const [showGoPremiumPopup, setShowGoPremiumPopup] = useState(false);
    const [routineLikes, setRoutineLikes] = useState([]); // aún no usado pero necesario para getRoutineLikes

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                const user = authenticatedUser.user;
                setCurrentUser(user);
                loadAllTrainers();
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

    useEffect(() => {
        getMuscleGroups(
            (data) => setAvailableMuscleGroups(data),
            (err) => console.error("Error loading muscle groups:", err)
        );

        getEquipments(
            (data) => setAvailableEquipment(data),
            (err) => console.error("Error loading equipment:", err)
        );
    }, []);

    useEffect(() => {
        const handleOutsideSearchClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchResults(false);
            }
        };
        if (showSearchResults) document.addEventListener("click", handleOutsideSearchClick);
        return () => document.removeEventListener("click", handleOutsideSearchClick);
    }, [showSearchResults]);

    useEffect(() => {
        const handleOutsideFilterClick = (e) => {
            if (
                openDropdown &&
                filterRefs.current[openDropdown] &&
                !filterRefs.current[openDropdown].contains(e.target)
            ) {
                setOpenDropdown(null);
            }
        };
        if (openDropdown) document.addEventListener("click", handleOutsideFilterClick);
        return () => document.removeEventListener("click", handleOutsideFilterClick);
    }, [openDropdown]);

    const loadRoutineLikes = () => {
        getRoutineLikes(
            data => setRoutineLikes(data),
            err => console.error("Error loading routine likes:", err)
        );
    };

    const checkActiveWorkout = () => {
        workoutService.getWorkouts(
            (data) => {
                const active = data.find((w) => !w.endTime);
                if (active) setActiveWorkout(active);
            },
            (err) => console.error("Error comprobando entrenamientos activos", err)
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

    const loadAllTrainers = () => {
        routineService.getAllRoutines(
            (data) => {
                const trainers = data
                    .filter((r) => r.trainerId && r.trainerName)
                    .map((r) => ({
                        id: r.trainerId,
                        name: `${r.trainerName || ""} ${r.trainerSurname || ""}`.trim(),
                    }))
                    .filter((t, i, self) => i === self.findIndex((x) => x.id === t.id));
                setAvailableTrainers(trainers);
            },
            (err) => console.error("Error loading trainers:", err)
        );
    };

    const loadRoutines = (filtersToUse = filters) => {
        setLoading(true);

        const hasFilters =
            filtersToUse.difficulty ||
            (filtersToUse.muscleGroup && filtersToUse.muscleGroup.length > 0) ||
            (filtersToUse.equipment && filtersToUse.equipment.length > 0) ||
            filtersToUse.trainerId;

        const handleSuccess = (data) => {
            setRoutines(data);
            setAllRoutines(data);
            setLoading(false);
        };

        const handleError = (errors) => {
            console.error("Error loading routines:", errors);
            setError(errors.globalError || "Error al cargar las rutinas");
            setLoading(false);
        };

        if (hasFilters) {
            routineService.getFilteredRoutines(
                filtersToUse.muscleGroup?.length ? filtersToUse.muscleGroup.join(",") : null,
                filtersToUse.equipment?.length ? filtersToUse.equipment.join(",") : null,
                filtersToUse.difficulty || null,
                filtersToUse.trainerId ? Number(filtersToUse.trainerId) : null,
                handleSuccess,
                handleError
            );
        } else {
            routineService.getAllRoutines(handleSuccess, handleError);
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
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const applyFilters = () => {
        setSearchTerm("");
        loadRoutines(filters);
    };

    const clearFilters = () => {
        const cleared = {
            difficulty: "",
            muscleGroup: [],
            equipment: [],
            trainerId: ""
        };
        setFilters(cleared);
        setSearchTerm("");
        loadRoutines(cleared);
    };

    const rawSearchResults = () => {
        if (!searchTerm.trim()) return [];
        const searchLower = searchTerm.toLowerCase();

        return allRoutines.filter(routine => {
            const routineName = routine.name?.toLowerCase() || "";
            const trainerFullName = `${routine.trainerName || ""} ${routine.trainerSurname || ""}`
                .toLowerCase()
                .trim();

            return routineName.includes(searchLower) || trainerFullName.includes(searchLower);
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (!value.trim()) {
            setShowSearchResults(false);
            setRoutines(allRoutines);
            return;
        }

        setShowSearchResults(true);
        const searchLower = value.toLowerCase();

        const filtered = allRoutines.filter(routine => {
            const routineName = routine.name?.toLowerCase() || "";
            const trainerFullName = `${routine.trainerName || ""} ${routine.trainerSurname || ""}`
                .toLowerCase()
                .trim();

            return routineName.includes(searchLower) || trainerFullName.includes(searchLower);
        });

        setRoutines(filtered);
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
            setTrainerToUnfollow(trainerId);
            return;
        }

        followTrainer(
            trainerId,
            () => setFollowing(prev => [...prev, trainerId]),
            () => console.error("Error al seguir entrenador")
        );
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
                setRoutines(prev => prev.filter(r => r.id !== routineId));
                window.dispatchEvent(new CustomEvent("routineDeleted"));
            },
            (err) => {
                console.error("Error deleting routine:", err);
                alert("No se pudo eliminar la rutina. Intenta de nuevo.");
            }
        );
    };

    const handleStartWorkout = (e, routineId) => {
        e.preventDefault();
        e.stopPropagation();

        if (activeWorkout) {
            setShowActiveWorkoutPopup(true);
            return;
        }

        workoutService.startWorkout(
            routineId,
            (workoutData) => navigate(`/workouts/session/${workoutData.id}`),
            (err) => {
                console.error("Error al iniciar entrenamiento:", err);
                alert("No se pudo iniciar el entrenamiento. Inténtelo de nuevo.");
            }
        );
    };

    const routinesByTrainer = isTrainer()
        ? routines.filter(r => r.trainerId === currentUser?.id)
        : [];

    const canCreateRoutine = () => {
        if (isAdmin() || (isTrainer() && currentUser?.trainerPremium)) return true;
        if (!isTrainer()) return false;
        return routinesByTrainer.length < 3;
    };

    if (loading) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["loading-message"]}>Cargando rutinas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.contenedor}>
                <div className={styles["error-message"]}>
                    {error}
                    <button
                        onClick={() => loadRoutines()}
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
            <RoutinesHeader
                showFilters={showFilters}
                setShowFilters={setShowFilters}
            />

            <FilterPanel
                showFilters={showFilters}
                filters={filters}
                availableMuscleGroups={availableMuscleGroups}
                availableEquipment={availableEquipment}
                availableTrainers={availableTrainers}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                filterRefs={filterRefs}
                handleFilterChange={handleFilterChange}
                handleMultiSelectChange={handleMultiSelectChange}
                applyFilters={applyFilters}
                clearFilters={clearFilters}
            />

            <SearchBar
                searchTerm={searchTerm}
                searchRef={searchRef}
                showSearchResults={showSearchResults}
                handleSearchChange={handleSearchChange}
                handleClearSearch={handleClearSearch}
                rawSearchResults={rawSearchResults}
                handleSelectSearchedRoutine={handleSelectSearchedRoutine}
            />

            <RoutineList
                routines={routines}
                currentUser={currentUser}
                activeWorkout={activeWorkout}
                isAdmin={isAdmin}
                isClient={isClient}
                isRoutineCreator={isRoutineCreator}
                handleStartWorkout={handleStartWorkout}
                handleEdit={handleEdit}
                setRoutineToDelete={setRoutineToDelete}
                handleFollowToggle={handleFollowToggle}
                following={following}
                getDifficultyText={getDifficultyText}
                getMuscleGroupsText={getMuscleGroupsText}
                getEquipmentText={getEquipmentText}
                likeRoutine={likeRoutine}
                unlikeRoutine={unlikeRoutine}
                setRoutines={setRoutines}
            />

            {(isTrainer() || isAdmin()) && (
                <button
                    className={styles["boton-crear"]}
                    onClick={() => {
                        if (!canCreateRoutine()) {
                            setShowGoPremiumPopup(true);
                            return;
                        }
                        navigate("/routines/new");
                    }}
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
                            () => setFollowing(prev => prev.filter(id => id !== trainerToUnfollow)),
                            () => console.error("Error al dejar de seguir entrenador")
                        );
                    }
                    setTrainerToUnfollow(null);
                }}
                onCancel={() => setTrainerToUnfollow(null)}
            />

            <GoPremiumPopup
                show={showGoPremiumPopup}
                text="Crear más de 3 rutinas es una función premium."
                onOk={() => {
                    becomePremium(
                        currentUser.id,
                        () => {
                            setCurrentUser(prev => ({ ...prev, trainerPremium: true }));
                            setShowGoPremiumPopup(false);
                            navigate("/users/profile/" + currentUser.id, { replace: true });
                        },
                        (err) => alert("Error becoming premium: " + err)
                    );
                }}
                onCancel={() => setShowGoPremiumPopup(false)}
            />
        </div>
    );
};

function RoutinesHeader({ showFilters, setShowFilters }) {
    return (
        <div className={styles["routines-header"]}>
            <h2>Rutinas</h2>
            <button
                className={styles["filter-toggle-button"]}
                onClick={() => setShowFilters(!showFilters)}
            >
                Filtrar
            </button>
        </div>
    );
}

function FilterPanel({
                         showFilters,
                         filters,
                         availableMuscleGroups,
                         availableEquipment,
                         availableTrainers,
                         openDropdown,
                         setOpenDropdown,
                         filterRefs,
                         handleFilterChange,
                         handleMultiSelectChange,
                         applyFilters,
                         clearFilters,
                     }) {
    if (!showFilters) return null;

    return (
        <div className={styles["filter-container"]}>
            <DifficultyFilter
                filters={filters}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                filterRefs={filterRefs}
                handleFilterChange={handleFilterChange}
            />

            <MultiSelectFilter
                label="Grupos Musculares"
                filterKey="muscleGroup"
                filters={filters}
                options={availableMuscleGroups}
                optionTextFn={getMuscleGroupsText}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                filterRefs={filterRefs}
                handleMultiSelectChange={handleMultiSelectChange}
            />

            <MultiSelectFilter
                label="Equipamiento"
                filterKey="equipment"
                filters={filters}
                options={availableEquipment}
                optionTextFn={getEquipmentText}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                filterRefs={filterRefs}
                handleMultiSelectChange={handleMultiSelectChange}
            />

            <TrainerFilter
                filters={filters}
                availableTrainers={availableTrainers}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                filterRefs={filterRefs}
                handleFilterChange={handleFilterChange}
            />

            <div className={styles["filter-actions"]}>
                <button
                    className={styles["apply-filter-button"]}
                    onClick={applyFilters}
                >
                    Aplicar Filtros
                </button>
                <button
                    className={styles["clear-filter-button"]}
                    onClick={clearFilters}
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

function DifficultyFilter({
                              filters,
                              openDropdown,
                              setOpenDropdown,
                              filterRefs,
                              handleFilterChange,
                          }) {
    const isOpen = openDropdown === "difficulty";

    return (
        <div className={styles["filter-group"]}>
            <label>Dificultad:</label>

            <div
                className={styles["custom-select"]}
                ref={el => { filterRefs.current["difficulty"] = el; }}
            >
                <button
                    type="button"
                    className={styles["select-display"]}
                    onClick={() => setOpenDropdown(isOpen ? null : "difficulty")}
                >
                    <span>
                        {filters.difficulty
                            ? getDifficultyText(filters.difficulty)
                            : "Todas"}
                    </span>
                    <span className={styles["select-arrow"]}>▼</span>
                </button>

                {isOpen && (
                    <div className={styles["select-dropdown"]}>
                        <button type="button" className={styles["select-option"]}
                                onClick={() => { handleFilterChange("difficulty", ""); setOpenDropdown(null); }}>
                            Todas
                        </button>
                        <button type="button" className={styles["select-option"]}
                                onClick={() => { handleFilterChange("difficulty", "BEGINNER"); setOpenDropdown(null); }}>
                            Principiante
                        </button>
                        <button type="button" className={styles["select-option"]}
                                onClick={() => { handleFilterChange("difficulty", "INTERMEDIATE"); setOpenDropdown(null); }}>
                            Intermedia
                        </button>
                        <button type="button" className={styles["select-option"]}
                                onClick={() => { handleFilterChange("difficulty", "ADVANCED"); setOpenDropdown(null); }}>
                            Avanzada
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function MultiSelectFilter({
                               label,
                               filterKey,
                               filters,
                               options,
                               optionTextFn,
                               openDropdown,
                               setOpenDropdown,
                               filterRefs,
                               handleMultiSelectChange,
                           }) {
    const selected = filters[filterKey] || [];
    const isOpen = openDropdown === filterKey;

    let selectedLabel;

    if (selected.length === 0) {
        selectedLabel = "Todos";
    } else if (selected.length === 1) {
        selectedLabel = "1 seleccionado";
    } else {
        selectedLabel = `${selected.length} seleccionados`;
    }

    return (
        <div className={styles["filter-group"]}>
            <label>{label}:</label>

            <div
                className={styles["custom-select"]}
                ref={el => { filterRefs.current[filterKey] = el; }}
            >
                <button
                    type="button"
                    className={styles["select-display"]}
                    onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
                >
                    <span>{selectedLabel}</span>
                    <span className={styles["select-arrow"]}>▼</span>
                </button>

                {isOpen && (
                    <div className={styles["select-dropdown"]}>
                        {options.map(option => (
                            <button
                                type="button"
                                key={option.name}
                                className={styles["select-option-multi"]}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleMultiSelectChange(filterKey, option.name);
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option.name)}
                                    readOnly
                                    className={styles["checkbox"]}
                                />
                                <span>{optionTextFn(option.name)}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TrainerFilter({
                           filters,
                           availableTrainers,
                           openDropdown,
                           setOpenDropdown,
                           filterRefs,
                           handleFilterChange,
                       }) {
    const isOpen = openDropdown === "trainer";

    const currentTrainerName =
        filters.trainerId
            ? availableTrainers.find(t => t.id === parseInt(filters.trainerId))?.name || "Todos"
            : "Todos";

    return (
        <div className={styles["filter-group"]}>
            <label>Entrenador:</label>

            <div
                className={styles["custom-select"]}
                ref={el => { filterRefs.current["trainer"] = el; }}
            >
                <button
                    type="button"
                    className={styles["select-display"]}
                    onClick={() => setOpenDropdown(isOpen ? null : "trainer")}
                >
                    <span>{currentTrainerName}</span>
                    <span className={styles["select-arrow"]}>▼</span>
                </button>

                {isOpen && (
                    <div className={styles["select-dropdown"]}>
                        <button
                            type="button"
                            className={styles["select-option"]}
                            onClick={() => {
                                handleFilterChange("trainerId", "");
                                setOpenDropdown(null);
                            }}
                        >
                            Todos
                        </button>

                        {availableTrainers.map(trainer => (
                            <button
                                type="button"
                                key={trainer.id}
                                className={styles["select-option"]}
                                onClick={() => {
                                    handleFilterChange("trainerId", trainer.id.toString());
                                    setOpenDropdown(null);
                                }}
                            >
                                {trainer.name || "Entrenador desconocido"}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SearchBar({
                       searchTerm,
                       searchRef,
                       showSearchResults,
                       handleSearchChange,
                       handleClearSearch,
                       rawSearchResults,
                       handleSelectSearchedRoutine,
                   }) {
    const results = rawSearchResults();

    return (
        <div className={styles["search-container"]}>
            <h3 className={styles["search-title"]}>Buscar rutinas</h3>

            <div className={styles["search-input-wrapper"]} ref={searchRef}>
                <svg
                    className={styles["search-icon"]}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                    type="text"
                    placeholder="Buscar por nombre de rutina o entrenador..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm && results.length > 0 && setTimeout(() => {}, 0)}
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
                        {results.length > 0 ? (
                            results.slice(0, 5).map(routine => {
                                const trainerName =
                                    `${routine.trainerName || ""} ${routine.trainerSurname || ""}`.trim() ||
                                    "Entrenador desconocido";
                                return (
                                    <div
                                        key={routine.id}
                                        className={styles["search-result-item"]}
                                        onClick={() => handleSelectSearchedRoutine(routine)}
                                    >
                                        <div className={styles["search-result-name"]}>
                                            {routine.name}
                                        </div>
                                        <div className={styles["search-result-trainer"]}>
                                            {trainerName}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className={styles["no-search-results"]}>
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function RoutineList({
                         routines,
                         currentUser,
                         activeWorkout,
                         isAdmin,
                         isClient,
                         isRoutineCreator,
                         handleStartWorkout,
                         handleEdit,
                         setRoutineToDelete,
                         handleFollowToggle,
                         following,
                         getDifficultyText,
                         getMuscleGroupsText,
                         getEquipmentText,
                         likeRoutine,
                         unlikeRoutine,
                         setRoutines,
                     }) {
    if (routines.length === 0) {
        return (
            <div className={styles["lista-rutinas"]}>
                <div className={styles["no-results"]}>
                    No se encontraron rutinas con los filtros seleccionados.
                </div>
            </div>
        );
    }

    return (
        <div className={styles["lista-rutinas"]}>
            {routines.map(routine => (
                <RoutineCard
                    key={routine.id}
                    routine={routine}
                    currentUser={currentUser}
                    activeWorkout={activeWorkout}
                    isAdmin={isAdmin}
                    isClient={isClient}
                    isRoutineCreator={isRoutineCreator}
                    handleStartWorkout={handleStartWorkout}
                    handleEdit={handleEdit}
                    setRoutineToDelete={setRoutineToDelete}
                    handleFollowToggle={handleFollowToggle}
                    following={following}
                    getDifficultyText={getDifficultyText}
                    likeRoutine={likeRoutine}
                    unlikeRoutine={unlikeRoutine}
                    setRoutines={setRoutines}
                />
            ))}
        </div>
    );
}

function RoutineCard({
                         routine,
                         currentUser,
                         activeWorkout,
                         isAdmin,
                         isClient,
                         isRoutineCreator,
                         handleStartWorkout,
                         handleEdit,
                         setRoutineToDelete,
                         handleFollowToggle,
                         following,
                         getDifficultyText,
                         likeRoutine,
                         unlikeRoutine,
                         setRoutines,
                     }) {
    const basePath = activeWorkout && activeWorkout.routineId === routine.id
        ? `/workouts/session/${activeWorkout.id}`
        : `/routines/${routine.id}`;

    const isLiked = (routine.likes || []).some(like => like.userId === currentUser?.id);

    const handleLikeChange = (next) => {
        if (!currentUser) return;

        if (next) {
            setRoutines(prev =>
                prev.map(r =>
                    r.id === routine.id
                        ? { ...r, likes: [...(r.likes || []), { userId: currentUser.id }] }
                        : r
                )
            );

            likeRoutine(
                routine.id,
                () => {},
                () => console.error("Error al marcar como favorito")
            );
            return;
        }

        setRoutines(prev =>
            prev.map(r =>
                r.id === routine.id
                    ? { ...r, likes: (r.likes || []).filter(like => like.userId !== currentUser.id) }
                    : r
            )
        );

        unlikeRoutine(
            routine.id,
            () => {},
            () => console.error("Error al desmarcar como favorito")
        );
    };

    const trainerName = `${routine.trainerName ?? ""} ${routine.trainerSurname ?? ""}`.trim() ||
        "Entrenador desconocido";

    return (
        <Link
            to={basePath}
            className={styles["caja-rutina"]}
        >
            <h3>
                <span>{routine.name}</span>
                <HeartLike
                    count={(routine.likes || []).length}
                    liked={isLiked}
                    onChange={handleLikeChange}
                    size={22}
                />
                {routine.visibility === "PRIVATE" &&
                    (isRoutineCreator(routine) || isAdmin()) && (
                        <span className={styles["private-badge"]}>🔒 Privado</span>
                    )}
            </h3>

            {isClient() && (
                <button
                    className={styles["boton-empezar-redondo"]}
                    onClick={e => handleStartWorkout(e, routine.id)}
                >
                    Empezar
                </button>
            )}

            <div className={styles["trainer-info"]}>
                <p className={styles["trainer-name"]}>
                    Generado por {trainerName}
                </p>

                {isClient() && routine.trainerId && (
                    <button
                        className={`${styles["filter-toggle-button"]} ${styles["follow-btn"]}`}
                        onClick={e => {
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
                    className={`${styles["routine-difficulty"]} ${
                        styles[routine.difficulty.toLowerCase()]
                    }`}
                >
                    {getDifficultyText(routine.difficulty)}
                </span>
            )}

            {isAdmin() && (
                <div>
                    <button
                        className={styles["boton-editar"]}
                        onClick={e => handleEdit(e, routine.id)}
                    >
                        Editar
                    </button>
                    <button
                        className={styles["boton-eliminar"]}
                        onClick={e => {
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
    );
}

export default Routines;

Routines.propTypes = {};

RoutinesHeader.propTypes = {
    showFilters: PropTypes.bool.isRequired,
    setShowFilters: PropTypes.func.isRequired,
};

FilterPanel.propTypes = {
    showFilters: PropTypes.bool.isRequired,
    filters: PropTypes.shape({
        difficulty: PropTypes.string,
        muscleGroup: PropTypes.arrayOf(PropTypes.string),
        equipment: PropTypes.arrayOf(PropTypes.string),
        trainerId: PropTypes.string,
    }).isRequired,
    availableMuscleGroups: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired
        })
    ).isRequired,
    availableEquipment: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired
        })
    ).isRequired,
    availableTrainers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    openDropdown: PropTypes.string,
    setOpenDropdown: PropTypes.func.isRequired,
    filterRefs: PropTypes.shape({
        current: PropTypes.object.isRequired
    }).isRequired,
    handleFilterChange: PropTypes.func.isRequired,
    handleMultiSelectChange: PropTypes.func.isRequired,
    applyFilters: PropTypes.func.isRequired,
    clearFilters: PropTypes.func.isRequired,
};

DifficultyFilter.propTypes = {
    filters: PropTypes.shape({
        difficulty: PropTypes.string,
    }).isRequired,
    openDropdown: PropTypes.string,
    setOpenDropdown: PropTypes.func.isRequired,
    filterRefs: PropTypes.shape({
        current: PropTypes.object.isRequired
    }).isRequired,
    handleFilterChange: PropTypes.func.isRequired,
};

MultiSelectFilter.propTypes = {
    label: PropTypes.string.isRequired,
    filterKey: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({ name: PropTypes.string.isRequired })
    ).isRequired,
    optionTextFn: PropTypes.func.isRequired,
    openDropdown: PropTypes.string,
    setOpenDropdown: PropTypes.func.isRequired,
    filterRefs: PropTypes.shape({
        current: PropTypes.object.isRequired
    }).isRequired,
    handleMultiSelectChange: PropTypes.func.isRequired,
};

TrainerFilter.propTypes = {
    filters: PropTypes.shape({
        trainerId: PropTypes.string,
    }).isRequired,
    availableTrainers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    openDropdown: PropTypes.string,
    setOpenDropdown: PropTypes.func.isRequired,
    filterRefs: PropTypes.shape({
        current: PropTypes.object.isRequired
    }).isRequired,
    handleFilterChange: PropTypes.func.isRequired,
};

SearchBar.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    searchRef: PropTypes.shape({
        current: PropTypes.any
    }).isRequired,
    showSearchResults: PropTypes.bool.isRequired,
    handleSearchChange: PropTypes.func.isRequired,
    handleClearSearch: PropTypes.func.isRequired,
    rawSearchResults: PropTypes.func.isRequired,
    handleSelectSearchedRoutine: PropTypes.func.isRequired,
};

RoutineList.propTypes = {
    routines: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    ).isRequired,
    currentUser: PropTypes.object,
    activeWorkout: PropTypes.object,
    isAdmin: PropTypes.func.isRequired,
    isClient: PropTypes.func.isRequired,
    isRoutineCreator: PropTypes.func.isRequired,
    handleStartWorkout: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    setRoutineToDelete: PropTypes.func.isRequired,
    handleFollowToggle: PropTypes.func.isRequired,
    following: PropTypes.arrayOf(PropTypes.number).isRequired,
    getDifficultyText: PropTypes.func.isRequired,
    getMuscleGroupsText: PropTypes.func.isRequired,
    getEquipmentText: PropTypes.func.isRequired,
    likeRoutine: PropTypes.func.isRequired,
    unlikeRoutine: PropTypes.func.isRequired,
    setRoutines: PropTypes.func.isRequired,
};

RoutineCard.propTypes = {
    routine: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        trainerId: PropTypes.number,
        trainerName: PropTypes.string,
        trainerSurname: PropTypes.string,
        likes: PropTypes.arrayOf(
            PropTypes.shape({
                userId: PropTypes.number.isRequired
            })
        ),
        difficulty: PropTypes.string,
        visibility: PropTypes.string,
    }).isRequired,

    currentUser: PropTypes.object,
    activeWorkout: PropTypes.object,

    isAdmin: PropTypes.func.isRequired,
    isClient: PropTypes.func.isRequired,
    isRoutineCreator: PropTypes.func.isRequired,

    handleStartWorkout: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    setRoutineToDelete: PropTypes.func.isRequired,

    handleFollowToggle: PropTypes.func.isRequired,
    following: PropTypes.arrayOf(PropTypes.number).isRequired,

    getDifficultyText: PropTypes.func.isRequired,

    likeRoutine: PropTypes.func.isRequired,
    unlikeRoutine: PropTypes.func.isRequired,
    setRoutines: PropTypes.func.isRequired,
};
