import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import WorkoutHistory from "../../modules/app/components/workouts/WorkoutHistory";
import WorkoutDetails from "../../modules/app/components/workouts/WorkoutDetails";
import ExerciseEntry from "../../modules/app/components/workouts/ExerciseEntry";
import WorkoutSession from "../../modules/app/components/workouts/WorkoutSession";
import UserWorkoutHistory from "../../modules/app/components/workouts/UserWorkoutHistory";

import { tryLoginFromServiceToken } from "../../backend/userService";
import {
    getWorkouts,
    getWorkout,
    addWorkoutActivity,
    finishWorkout,
    getLastMonthStats,
    getWorkoutsByUser,
} from "../../backend/workoutService";
import {
    getWorkoutExercisesByWorkoutId,
    addWorkoutExercise,
} from "../../backend/workoutExerciseService";
import { getRoutineExercises } from "../../backend/routineExerciseService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1", sessionId: "1" }),
}));

jest.mock("../../backend/userService", () => ({
    tryLoginFromServiceToken: jest.fn(),
}));

jest.mock("../../backend/workoutService", () => ({
    getWorkouts: jest.fn(),
    getWorkout: jest.fn(),
    addWorkoutActivity: jest.fn(),
    finishWorkout: jest.fn(),
    getLastMonthStats: jest.fn(),
    getWorkoutsByUser: jest.fn(),
}));

jest.mock("../../backend/workoutExerciseService", () => ({
    getWorkoutExercisesByWorkoutId: jest.fn(),
    addWorkoutExercise: jest.fn(),
}));

jest.mock("../../backend/routineExerciseService", () => ({
    getRoutineExercises: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe("WorkoutHistory Component", () => {
    test("renders loading state initially", () => {
        tryLoginFromServiceToken.mockImplementation((success) => {});

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        expect(
            screen.getByText("Cargando historial de entrenamientos..."),
        ).toBeInTheDocument();
    });

    test("redirects to login on authentication failure", () => {
        tryLoginFromServiceToken.mockImplementation((success, error) => {
            error();
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
    });

    test("renders error state when loading workouts fails", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success, error) => {
            error({ globalError: "Error al cargar el historial" });
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Error al cargar el historial"),
            ).toBeInTheDocument();
            expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
        });
    });

    test("renders empty state when no workouts exist", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success([]);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("No has realizado ningún entrenamiento todavía."),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Ver entrenamientos disponibles"),
            ).toBeInTheDocument();
        });
    });

    test("renders workout list correctly", async () => {
        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2023-10-01T10:00:00Z",
                endTime: "2023-10-01T11:00:00Z",
            },
            {
                id: 2,
                routineName: "Rutina 2",
                startTime: "2023-10-02T10:00:00Z",
                endTime: null,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Historial de entrenamientos"),
            ).toBeInTheDocument();
            expect(screen.getByText("Rutina 2")).toBeInTheDocument();
            expect(screen.getByText("Rutina 1")).toBeInTheDocument();
            expect(screen.getByText("En progreso")).toBeInTheDocument();
            expect(screen.getByText("1h 0min")).toBeInTheDocument();
        });
    });

    test("handles retry button click", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts
            .mockImplementationOnce((success, error) => {
                error({ globalError: "Error" });
            })
            .mockImplementationOnce((success) => {
                success([]);
            });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Intentar de nuevo"));

        await waitFor(() => {
            expect(getWorkouts).toHaveBeenCalledTimes(2);
        });
    });

    test("navigates to routines on empty state button click", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success([]);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Ver entrenamientos disponibles"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Ver entrenamientos disponibles"));

        expect(mockNavigate).toHaveBeenCalledWith("/routines");
    });

    test("renders calendar view correctly", async () => {
        jest
            .useFakeTimers()
            .setSystemTime(new Date("2025-12-01T00:00:00Z"));

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const startTime = `${currentYear}-${String(currentMonth).padStart(
            2,
            "0",
        )}-01T00:00:00Z`;
        const endTime = `${currentYear}-${String(currentMonth).padStart(
            2,
            "0",
        )}-01T11:00:00Z`;

        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime,
                endTime,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((s) =>
            s({ user: { id: 1 } }),
        );
        getWorkouts.mockImplementation((s) => s(mockWorkouts));

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(
                screen.getByText("diciembre de 2025"),
            ).toBeInTheDocument();
            expect(screen.getByText("1")).toBeInTheDocument();
            expect(screen.getByText("Rutina 1")).toBeInTheDocument();
        });
    });

    test("handles month navigation in calendar view", async () => {
        jest
            .useFakeTimers()
            .setSystemTime(new Date("2025-01-15T10:00:00Z"));

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear(); // 2025
        const startTime = `${currentYear}-01-01T00:00:00Z`;
        const endTime = `${currentYear}-01-01T11:00:00Z`;

        const mockWorkouts = [
            { id: 1, routineName: "Rutina 1", startTime, endTime },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(
                screen.getByText("enero de 2025"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(">"));

        await waitFor(() => {
            expect(
                screen.getByText("febrero de 2025"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("<"));

        await waitFor(() => {
            expect(
                screen.getByText("enero de 2025"),
            ).toBeInTheDocument();
        });
    });

    test("navigates on workout click in calendar view", async () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const startTime = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T00:00:00Z`;
        const endTime = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T11:00:00Z`;

        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime,
                endTime,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            const workoutLink = screen.getByText("Rutina 1");
            expect(workoutLink).toBeInTheDocument();
            expect(workoutLink.closest("a")).toHaveAttribute(
                "href",
                "/workouts/1?returnTo=history"
            );
        });
    });

    test("toggles between list, calendar and statistics view", async () => {
        const mockWorkouts = [];
        const mockStats = {
            lastMonthWorkouts: 0,
            totalDurationSeconds: 0,
            averageDurationSeconds: 0,
            exercisesByMuscleGroup: {},
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        getLastMonthStats.mockImplementation((success) => {
            success(mockStats);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        expect(screen.getByText("Lista")).toHaveClass("active");
        expect(screen.getByText("Calendario")).not.toHaveClass("active");
        expect(screen.getByText("Estadísticas")).not.toHaveClass("active");

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(screen.getByText("Calendario")).toHaveClass("active");
            expect(screen.getByText("Lista")).not.toHaveClass("active");
            expect(screen.getByText("Estadísticas")).not.toHaveClass("active");
        });

        fireEvent.click(screen.getByText("Estadísticas"));
        await waitFor(() => {
            expect(screen.getByText("Estadísticas")).toHaveClass("active");
            expect(screen.getByText("Lista")).not.toHaveClass("active");
            expect(screen.getByText("Calendario")).not.toHaveClass("active");
        });

        fireEvent.click(screen.getByText("Lista"));

        await waitFor(() => {
            expect(screen.getByText("Lista")).toHaveClass("active");
            expect(screen.getByText("Estadísticas")).not.toHaveClass("active");
            expect(screen.getByText("Calendario")).not.toHaveClass("active");
        });
    });

    test("renders statistics view correctly", async () => {
        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2025-10-01T19:30:00Z",
                endTime: "2025-10-01T20:15:00Z",
            },
            {
                id: 2,
                routineName: "Rutina 2",
                startTime: "2025-10-05T19:00:00Z",
                endTime: "2025-10-05T19:50:00Z",
            },
        ];

        const mockStats = {
            lastMonthWorkouts: 2,
            totalDurationSeconds: 3300,
            averageDurationSeconds: 1650,
            exercisesByMuscleGroup: {
                CHEST: 5,
                BACK: 8,
            },
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        getLastMonthStats.mockImplementation((success) => {
            success(mockStats);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            expect(
                screen.getByText("Estadísticas del último mes"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Entrenamientos completados"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Duración total"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Duración promedio"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Ejercicios por grupo muscular"),
            ).toBeInTheDocument();
        });
    });

    test("displays statistics metrics correctly", async () => {
        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2025-10-01T19:30:00Z",
                endTime: "2025-10-01T20:15:00Z",
            },
        ];

        const mockStats = {
            lastMonthWorkouts: 1,
            totalDurationSeconds: 2700,
            averageDurationSeconds: 2700,
            exercisesByMuscleGroup: {
                CHEST: 5,
            },
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        getLastMonthStats.mockImplementation((success) => {
            success(mockStats);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            const metricLabels = screen.getAllByText(
                /Entrenamientos completados|Duración total|Duración promedio/,
            );
            expect(metricLabels.length).toBe(3);
        });
    });

    test("displays empty statistics message when no workouts exist", async () => {
        const mockWorkouts = [];
        const mockStats = {
            lastMonthWorkouts: 0,
            totalDurationSeconds: 0,
            averageDurationSeconds: 0,
            exercisesByMuscleGroup: {},
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        getLastMonthStats.mockImplementation((success) => {
            success(mockStats);
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            expect(
                screen.getByText("Estadísticas del último mes"),
            ).toBeInTheDocument();
        });
    });
});

describe("WorkoutDetails Component", () => {
    test("renders loading state initially", () => {
        tryLoginFromServiceToken.mockImplementation((success) => {});

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(
            screen.getByText("Cargando detalles del entrenamiento..."),
        ).toBeInTheDocument();
    });

    test("redirects to login on authentication failure", () => {
        tryLoginFromServiceToken.mockImplementation((success, error) => {
            error();
        });

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
    });

    test("renders error state when loading workout fails", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success, error) => {
            error("Error al cargar el entrenamiento");
        });

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Error al cargar el entrenamiento"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Volver al historial"),
            ).toBeInTheDocument();
        });
    });

    test("renders workout details correctly", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina de Fuerza",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        const mockRoutineExercises = {
            content: [
                { id: 1, exerciseName: "Press de banca", position: 1 },
                { id: 2, exerciseName: "Sentadillas", position: 2 },
            ],
        };

        const mockWorkoutExercises = [
            { id: 1, routineExerciseId: 1, reps: 10, weight: 80 },
            { id: 2, routineExerciseId: 1, reps: 8, weight: 85 },
            { id: 3, routineExerciseId: 2, reps: 12, weight: 100 },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success(mockRoutineExercises);
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success(mockWorkoutExercises);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Rutina de Fuerza"),
            ).toBeInTheDocument();
            expect(screen.getByText("Fecha:")).toBeInTheDocument();
            expect(screen.getByText("Duración:")).toBeInTheDocument();
            expect(screen.getByText("1h 30min")).toBeInTheDocument();
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
            expect(screen.getByText("2. Sentadillas")).toBeInTheDocument();
        });
    });

    test("displays logged sets when exercise is expanded", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina de Fuerza",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        const mockRoutineExercises = {
            content: [{ id: 1, exerciseName: "Press de banca", position: 1 }],
        };

        const mockWorkoutExercises = [
            { id: 1, routineExerciseId: 1, reps: 10, weight: 80 },
            { id: 2, routineExerciseId: 1, reps: 8, weight: 85 },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success(mockRoutineExercises);
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success(mockWorkoutExercises);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("1. Press de banca"));

        await waitFor(() => {
            expect(
                screen.getByText("Series realizadas:"),
            ).toBeInTheDocument();
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
            expect(screen.getByText("10")).toBeInTheDocument();
            expect(screen.getByText("80")).toBeInTheDocument();
            expect(screen.getByText("Serie 2")).toBeInTheDocument();
            expect(screen.getByText("85")).toBeInTheDocument();
        });
    });

    test("displays no data message when no logged sets exist", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina de Fuerza",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        const mockRoutineExercises = {
            content: [{ id: 1, exerciseName: "Press de banca", position: 1 }],
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success(mockRoutineExercises);
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success([]);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("1. Press de banca"));

        await waitFor(() => {
            expect(
                screen.getByText("No se registraron datos para este ejercicio"),
            ).toBeInTheDocument();
        });
    });

    test("displays no exercises message when routine has no exercises", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina Vacía",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: [] });
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success([]);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("No hay ejercicios registrados"),
            ).toBeInTheDocument();
        });
    });

    test("handles back button click", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina de Fuerza",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: [] });
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success([]);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("←")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("←"));

        expect(mockNavigate).toHaveBeenCalledWith("/workouts//");
    });

    test("displays in progress for workouts without end time", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina en Progreso",
            startTime: "2023-10-01T10:00:00Z",
            endTime: null,
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: [] });
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success([]);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("En progreso")).toBeInTheDocument();
        });
    });

    test("handles error loading routine exercises", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina de Fuerza",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success, error) => {
            error("Error al cargar los ejercicios");
        });

        getWorkoutExercisesByWorkoutId.mockImplementation((id, success) => {
            success([]);     // NECESARIO
        });

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Error al cargar los ejercicios"),
            ).toBeInTheDocument();
        });
    });

    test("handles error loading workout exercises gracefully", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina de Fuerza",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:30:00Z",
        };

        const mockRoutineExercises = {
            content: [{ id: 1, exerciseName: "Press de banca", position: 1 }],
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success(mockRoutineExercises);
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success, error) => {
                error("No workout exercises found");
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Rutina de Fuerza"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("1. Press de banca"));

        await waitFor(() => {
            expect(
                screen.getByText("No se registraron datos para este ejercicio"),
            ).toBeInTheDocument();
        });
    });

    test("displays duration less than 1 hour correctly", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina Corta",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T10:30:00Z",
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: [] });
        });

        getWorkoutExercisesByWorkoutId.mockImplementation(
            (workoutId, success) => {
                success([]);
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("30 min")).toBeInTheDocument();
        });
    });
});

describe("UserWorkoutHistory Component", () => {
    test("renders loading state initially", () => {
        tryLoginFromServiceToken.mockImplementation((success) => {});

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        expect(
            screen.getByText("Cargando historial de entrenamientos..."),
        ).toBeInTheDocument();
    });

    test("redirects to login on authentication failure", () => {
        tryLoginFromServiceToken.mockImplementation((success, error) => {
            error();
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
    });

    test("renders empty state when no workouts exist", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success([]);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("No has realizado ningún entrenamiento todavía."),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Ver entrenamientos disponibles"),
            ).toBeInTheDocument();
        });
    });

    test("renders workout list correctly", async () => {
        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2023-10-01T10:00:00Z",
                endTime: "2023-10-01T11:00:00Z",
            },
            {
                id: 2,
                routineName: "Rutina 2",
                startTime: "2023-10-02T10:00:00Z",
                endTime: null,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Historial de entrenamientos"),
            ).toBeInTheDocument();
            expect(screen.getByText("Rutina 2")).toBeInTheDocument();
            expect(screen.getByText("Rutina 1")).toBeInTheDocument();
            expect(screen.getByText("En progreso")).toBeInTheDocument();
            expect(screen.getByText("1h 0min")).toBeInTheDocument();
        });
    });

    test("renders error state when loading workouts fails", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success, error) => {
            error({ globalError: "Error al cargar el historial" });
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Error al cargar el historial"),
            ).toBeInTheDocument();
            expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
        });
    });

    test("handles retry button click", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser
            .mockImplementationOnce((id, success, error) => {
                error({ globalError: "Error" });
            })
            .mockImplementationOnce((id, success) => {
                success([]);
            });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Intentar de nuevo"));

        await waitFor(() => {
            expect(getWorkoutsByUser).toHaveBeenCalledTimes(2);
        });
    });

    test("navigates to routines on empty state button click", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success([]);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("Ver entrenamientos disponibles"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Ver entrenamientos disponibles"));

        expect(mockNavigate).toHaveBeenCalledWith("/routines");
    });

    test("handles month navigation in calendar view", async () => {
        jest
            .useFakeTimers()
            .setSystemTime(new Date("2025-01-15T10:00:00Z"));

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear(); // 2025
        const startTime = `${currentYear}-01-01T00:00:00Z`;
        const endTime = `${currentYear}-01-01T11:00:00Z`;

        const mockWorkouts = [
            { id: 1, routineName: "Rutina 1", startTime, endTime },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(
                screen.getByText("Enero de 2025"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(">"));

        await waitFor(() => {
            expect(
                screen.getByText("Febrero de 2025"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("<"));

        await waitFor(() => {
            expect(
                screen.getByText("Enero de 2025"),
            ).toBeInTheDocument();
        });
    });

    test("navigates on workout click in calendar view", async () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const startTime = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T00:00:00Z`;
        const endTime = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T11:00:00Z`;

        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime,
                endTime,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            const workoutLink = screen.getByText("Rutina 1");
            expect(workoutLink).toBeInTheDocument();
            expect(workoutLink.closest("a")).toHaveAttribute(
                "href",
                "/workouts/1"
            );
        });
    });

    test("navigates to active workout session", async () => {
        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2023-10-01T10:00:00Z",
                endTime: null,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            const workoutLink = screen.getByText("Rutina 1");
            expect(workoutLink.closest("a")).toHaveAttribute(
                "href",
                "/workouts/session/1"
            );
        });
    });

    test("toggles between list and calendar view", async () => {
        const mockWorkouts = [];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        expect(screen.getByText("Lista")).toHaveClass("active");
        expect(screen.getByText("Calendario")).not.toHaveClass("active");

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(screen.getByText("Calendario")).toHaveClass("active");
            expect(screen.getByText("Lista")).not.toHaveClass("active");
        });

        fireEvent.click(screen.getByText("Lista"));

        await waitFor(() => {
            expect(screen.getByText("Lista")).toHaveClass("active");
            expect(screen.getByText("Calendario")).not.toHaveClass("active");
        });
    });

    test("handles year change when navigating from January to December", async () => {
        jest
            .useFakeTimers()
            .setSystemTime(new Date("2025-01-15T10:00:00Z"));

        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2025-01-01T00:00:00Z",
                endTime: "2025-01-01T11:00:00Z",
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(
                screen.getByText("Enero de 2025"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("<"));

        await waitFor(() => {
            expect(
                screen.getByText("Diciembre de 2024"),
            ).toBeInTheDocument();
        });
    });

    test("handles year change when navigating from December to January", async () => {
        jest
            .useFakeTimers()
            .setSystemTime(new Date("2025-12-15T10:00:00Z"));

        const mockWorkouts = [
            {
                id: 1,
                routineName: "Rutina 1",
                startTime: "2025-12-01T00:00:00Z",
                endTime: "2025-12-01T11:00:00Z",
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkoutsByUser.mockImplementation((id, success) => {
            success(mockWorkouts);
        });

        render(
            <MemoryRouter>
                <UserWorkoutHistory id="1" />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Calendario"));

        await waitFor(() => {
            expect(
                screen.getByText("Diciembre de 2025"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(">"));

        await waitFor(() => {
            expect(
                screen.getByText("Enero de 2026"),
            ).toBeInTheDocument();
        });
    });
});

describe("ExerciseEntry Component", () => {
    const mockExercise = {
        id: 1,
        name: "Press de banca",
        description: "Ejercicio para pecho",
    };
    const mockSessionId = "1";

    test("renders exercise card correctly", () => {
        render(
            <ExerciseEntry
                exercise={mockExercise}
                sessionId={mockSessionId}
                index={1}
            />,
        );

        expect(
            screen.getByText("1. Press de banca"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Ejercicio para pecho"),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Reps")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Peso (kg)")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Tiempo (s)")).toBeInTheDocument();
        expect(screen.getByText("Añadir")).toBeInTheDocument();
    });

    test("updates input fields correctly", () => {
        render(
            <ExerciseEntry
                exercise={mockExercise}
                sessionId={mockSessionId}
                index={1}
            />,
        );

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const timeInput = screen.getByPlaceholderText("Tiempo (s)");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "80" } });
        fireEvent.change(timeInput, { target: { value: "60" } });

        expect(repsInput.value).toBe("10");
        expect(weightInput.value).toBe("80");
        expect(timeInput.value).toBe("60");
    });

    test("adds set successfully and displays logged sets", async () => {
        const mockSavedSet = { id: 1, reps: 10, weight: 80, time: 60 };
        addWorkoutActivity.mockImplementation(
            (sessionId, exerciseId, reps, weight, time, success) => {
                success(mockSavedSet);
            },
        );

        render(
            <ExerciseEntry
                exercise={mockExercise}
                sessionId={mockSessionId}
                index={1}
            />,
        );

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const timeInput = screen.getByPlaceholderText("Tiempo (s)");
        const addButton = screen.getByText("Añadir");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "80" } });
        fireEvent.change(timeInput, { target: { value: "60" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(addWorkoutActivity).toHaveBeenCalledWith(
                mockSessionId,
                mockExercise.id,
                "10",
                "80",
                "60",
                expect.any(Function),
                expect.any(Function),
            );
            expect(
                screen.getByText((t) =>
                    /10 reps/.test(t) &&
                    /80 kg/.test(t) &&
                    /60s/.test(t)
                ),
            ).toBeInTheDocument();
            expect(repsInput.value).toBe("");
            expect(weightInput.value).toBe("");
            expect(timeInput.value).toBe("");
        });
    });

    test("handles error when adding set", async () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const alertSpy = jest
            .spyOn(window, "alert")
            .mockImplementation(() => {});

        addWorkoutActivity.mockImplementation(
            (sessionId, exerciseId, reps, weight, time, success, error) => {
                error("API Error");
            },
        );

        render(
            <ExerciseEntry
                exercise={mockExercise}
                sessionId={mockSessionId}
                index={1}
            />,
        );

        const repsInput = screen.getByPlaceholderText("Reps");
        const addButton = screen.getByText("Añadir");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(addWorkoutActivity).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error adding set:",
                "API Error",
            );
            expect(alertSpy).toHaveBeenCalledWith(
                "Error al registrar la serie.",
            );
        });

        consoleSpy.mockRestore();
        alertSpy.mockRestore();
    });

    test("displays multiple logged sets", async () => {
        const mockSets = [
            { id: 1, reps: 10, weight: 80, time: 60 },
            { id: 2, reps: 8, weight: 85, time: null },
        ];

        addWorkoutActivity.mockImplementation(
            (sessionId, exerciseId, reps, weight, time, success) => {
                success(mockSets[0]);
            },
        );

        render(
            <ExerciseEntry
                exercise={mockExercise}
                sessionId={mockSessionId}
                index={1}
            />,
        );

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const timeInput = screen.getByPlaceholderText("Tiempo (s)");
        const addButton = screen.getByText("Añadir");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "80" } });
        fireEvent.change(timeInput, { target: { value: "60" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(
                screen.getByText((t) =>
                    t.includes("Serie") &&
                    t.includes("10 reps") &&
                    t.includes("80 kg") &&
                    t.includes("60s")
                )
            ).toBeInTheDocument();
        });
    });
});

describe("WorkoutSession Component", () => {
    test("renders loading state initially", () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation(() => {});

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        expect(
            screen.getByText("Cargando entrenamiento..."),
        ).toBeInTheDocument();
    });

    test("renders error state when loading fails", async () => {
        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success, error) => {
            error("Error");
        });

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("No se pudo cargar el entrenamiento."),
            ).toBeInTheDocument();
        });
    });

    test("renders workout session correctly", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText("Rutina 1")).toBeInTheDocument();
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Reps")).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("Peso (kg)"),
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("Duración (s)"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Añadir serie"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Finalizar entrenamiento"),
            ).toBeInTheDocument();
        });
    });

    test("adds set successfully", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        addWorkoutExercise.mockImplementation(
            (sessionId, reps, weight, duration, routineExerciseId, success) => {
                success();
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const durationInput = screen.getByPlaceholderText("Duración (s)");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "80" } });
        fireEvent.change(durationInput, { target: { value: "60" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(addWorkoutExercise).toHaveBeenCalledWith(
                "1",
                10,
                80,
                60,
                1,
                expect.any(Function),
                expect.any(Function),
            );
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
            expect(screen.getByText("10")).toBeInTheDocument();
            expect(screen.getByText("80")).toBeInTheDocument();
            expect(screen.getByText("60")).toBeInTheDocument();
        });
    });

    test("handles error when adding set", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        addWorkoutExercise.mockImplementation(
            (
                sessionId,
                reps,
                weight,
                duration,
                routineExerciseId,
                success,
                error,
            ) => {
                error("Error");
            },
        );

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(
                screen.getByText("⚠️ Error al registrar la serie."),
            ).toBeInTheDocument();
        });
    });

    test("finishes workout when all exercises completed", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        addWorkoutExercise.mockImplementation(
            (sessionId, reps, weight, duration, routineExerciseId, success) => {
                success();
            },
        );

        finishWorkout.mockImplementation((sessionId, success) => {
            success();
        });

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(finishWorkout).toHaveBeenCalledWith(
                "1",
                expect.any(Function),
                expect.any(Function),
            );
        });
    });

    test("shows popup when finishing with incomplete exercises", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        finishWorkout.mockImplementation((sessionId, success) => {
            success();
        });

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Aún faltan ejercicios por registrar. ¿Deseas finalizar igualmente?",
                ),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("OK"));

        await waitFor(() => {
            expect(finishWorkout).toHaveBeenCalledWith(
                "1",
                expect.any(Function),
                expect.any(Function),
            );
        });
    });

    test("cancels popup when finishing with incomplete exercises", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Aún faltan ejercicios por registrar. ¿Deseas finalizar igualmente?",
                ),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Cancelar"));

        await waitFor(() => {
            expect(finishWorkout).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalledWith(
                "/workouts/history",
            );
        });
    });

    test("handles error when finishing workout", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                position: 1,
            },
        ];

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1, role: "CLIENT" } });
        });

        getWorkout.mockImplementation((id, success) => {
            success(mockWorkout);
        });

        getRoutineExercises.mockImplementation((routineId, success) => {
            success({ content: mockExercises });
        });

        addWorkoutExercise.mockImplementation(
            (sessionId, reps, weight, duration, routineExerciseId, success) => {
                success();
            },
        );

        finishWorkout.mockImplementation((sessionId, success, error) => {
            error("Error");
        });

        render(
            <MemoryRouter initialEntries={["/workouts/session/1"]}>
                <Routes>
                    <Route
                        path="/workouts/session/:sessionId"
                        element={<WorkoutSession />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByText("1. Press de banca"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(
                screen.getByText("⚠️ Error al finalizar el entrenamiento"),
            ).toBeInTheDocument();
        });
    });
});
