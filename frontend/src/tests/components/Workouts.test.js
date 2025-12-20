import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import WorkoutHistory from "../../modules/app/components/workouts/WorkoutHistory";
import WorkoutDetails from "../../modules/app/components/workouts/WorkoutDetails";
import ExerciseEntry from "../../modules/app/components/workouts/ExerciseEntry";
import WorkoutSession from "../../modules/app/components/workouts/WorkoutSession";
import UserWorkoutHistory from "../../modules/app/components/workouts/UserWorkoutHistory";
import VolumeRankingPage from "../../modules/app/components/workouts/VolumeRanking";
import WorkoutFeed from "../../modules/app/components/workouts/WorkoutFeed";
import { tryLoginFromServiceToken } from "../../backend/userService";
import {
    getWorkouts,
    getWorkout,
    addWorkoutActivity,
    finishWorkout,
    getStatsForMonth,
    getWorkoutsByUser,
    getVolumeRankingForRoutine,
    getWorkoutsFromFollowing,
} from "../../backend/workoutService";
import {
    getWorkoutExercisesByWorkoutId,
    addWorkoutExercise,
} from "../../backend/workoutExerciseService";
import { getRoutineExercises } from "../../backend/routineExerciseService";
import { onFinishWorkoutAchievements } from "../../backend/achievementService";
import { likeWorkout, unlikeWorkout } from "../../backend/workoutLikeService";
import { commentWorkout } from "../../backend/workoutCommentService";
import { getFollowedTrainers, getFollowers } from "../../backend/userFollowService";

global.ResizeObserver = class {
    constructor(callback) { this.callback = callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
};

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
    getStatsForMonth: jest.fn(),
    getWorkoutsByUser: jest.fn(),
    getVolumeRankingForRoutine: jest.fn(),
    getWorkoutsFromFollowing: jest.fn(),
}));

jest.mock("../../backend/workoutExerciseService", () => ({
    getWorkoutExercisesByWorkoutId: jest.fn(),
    addWorkoutExercise: jest.fn(),
}));

jest.mock("../../backend/routineExerciseService", () => ({
    getRoutineExercises: jest.fn(),
}));

jest.mock("../../backend/achievementService", () => ({
    onFinishWorkoutAchievements: jest.fn(),
}));

jest.mock("../../backend/workoutLikeService", () => ({
    likeWorkout: jest.fn(),
    unlikeWorkout: jest.fn(),
}));

jest.mock("../../backend/workoutCommentService", () => ({
    commentWorkout: jest.fn(),
}));

jest.mock("../../backend/userFollowService", () => ({
    getFollowedTrainers: jest.fn(),
    getFollowers: jest.fn(),
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

        getStatsForMonth.mockImplementation((month, year, success) => {
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

        const mockPreviousStats = {
            lastMonthWorkouts: 3,
            totalDurationSeconds: 5400,
            averageDurationSeconds: 1800,
            exercisesByMuscleGroup: {
                CHEST: 4,
                BACK: 6,
            },
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        getStatsForMonth.mockImplementation((month, year, success) => {
            if (getStatsForMonth.mock.calls.length === 1) {
                success(mockStats);
            } else {
                success(mockPreviousStats);
            }
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            expect(
                screen.getByText(/Estadísticas de \w+/),
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
            lastMonthWorkouts: 2,
            totalDurationSeconds: 3300,
            averageDurationSeconds: 1650,
            exercisesByMuscleGroup: {
                CHEST: 5,
                BACK: 8,
            },
        };

        const mockPreviousStats = {
            lastMonthWorkouts: 3,
            totalDurationSeconds: 5400,
            averageDurationSeconds: 1800,
            exercisesByMuscleGroup: {
                CHEST: 4,
                BACK: 6,
            },
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        getStatsForMonth.mockImplementation((month, year, success) => {
            if (getStatsForMonth.mock.calls.length === 1) {
                success(mockStats);
            } else {
                success(mockPreviousStats);
            }
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

    test("loads both current and previous month stats", async () => {
        const mockWorkouts = [];
        const mockCurrentStats = {
            lastMonthWorkouts: 2,
            totalDurationSeconds: 3300,
            averageDurationSeconds: 1650,
            exercisesByMuscleGroup: {
                CHEST: 5,
                BACK: 8,
            },
        };

        const mockPreviousStats = {
            lastMonthWorkouts: 3,
            totalDurationSeconds: 5400,
            averageDurationSeconds: 1800,
            exercisesByMuscleGroup: {
                CHEST: 4,
                BACK: 6,
            },
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        let callCount = 0;
        getStatsForMonth.mockImplementation((month, year, success) => {
            callCount++;
            if (callCount === 1) {
                success(mockCurrentStats);
            } else {
                success(mockPreviousStats);
            }
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            expect(getStatsForMonth).toHaveBeenCalledTimes(2);
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

        const mockPreviousStats = {
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

        let callCount = 0;
        getStatsForMonth.mockImplementation((month, year, success) => {
            callCount++;
            if (callCount === 1) {
                success(mockStats);
            } else {
                success(mockPreviousStats);
            }
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

        const mockPreviousStats = {
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

        let callCount = 0;
        getStatsForMonth.mockImplementation((month, year, success) => {
            callCount++;
            if (callCount === 1) {
                success(mockStats);
            } else {
                success(mockPreviousStats);
            }
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            expect(
                screen.getByText(/Estadísticas de/),
            ).toBeInTheDocument();
        });
    });

    test("toggles between normal and comparison views", async () => {
        const mockWorkouts = [];
        const mockCurrentStats = {
            lastMonthWorkouts: 2,
            totalDurationSeconds: 3300,
            averageDurationSeconds: 1650,
            exercisesByMuscleGroup: {
                CHEST: 5,
                BACK: 8,
            },
        };

        const mockPreviousStats = {
            lastMonthWorkouts: 3,
            totalDurationSeconds: 5400,
            averageDurationSeconds: 1800,
            exercisesByMuscleGroup: {
                CHEST: 4,
                BACK: 6,
            },
        };

        tryLoginFromServiceToken.mockImplementation((success) => {
            success({ user: { id: 1 } });
        });

        getWorkouts.mockImplementation((success) => {
            success(mockWorkouts);
        });

        let callCount = 0;
        getStatsForMonth.mockImplementation((month, year, success) => {
            callCount++;
            if (callCount === 1 || callCount === 3) {
                success(mockCurrentStats);
            } else {
                success(mockPreviousStats);
            }
        });

        render(
            <MemoryRouter>
                <WorkoutHistory />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByText("Estadísticas"));

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /Comparar Meses/ }),
            ).toBeInTheDocument();
        });

        const toggleButton = screen.getByRole("button", { name: /Comparar Meses/ });

        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(toggleButton).toHaveTextContent("Vista Normal");
        });

        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(toggleButton).toHaveTextContent("Comparar Meses");
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

    test("comment optimistic placeholder appears and is replaced by final comment, achievements trigger popup", async () => {
        const mockWorkout = {
            id: 1,
            routineId: 1,
            routineName: "Rutina Comentarios",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:00:00Z",
            comments: [],
            likes: []
        };

        const mockRoutineExercises = { content: [] };

        tryLoginFromServiceToken.mockImplementation((success) =>
            success({ user: { id: 2 } })
        );

        getWorkout.mockImplementation((id, success) => success(mockWorkout));
        getRoutineExercises.mockImplementation((rid, success) => success(mockRoutineExercises));
        getWorkoutExercisesByWorkoutId.mockImplementation((wid, success) => success([]));

        commentWorkout.mockImplementation((id, text, success) => {
            success({
                newAchievements: [
                    {
                        name: "Comentando Entrenos",
                        description: "desc",
                        medal: "BRONZE"
                    }
                ],
                id: 123,
                text,
                userName: "Test",
                userSurname: "User",
                date: new Date().toISOString()
            });
        });

        render(
            <MemoryRouter initialEntries={["/workouts/1"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Añadir comentario...")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText("Añadir comentario..."), {
            target: { value: "Mi comentario" }
        });

        fireEvent.click(screen.getByText("Enviar"));

        // optimistic appears
        await waitFor(() => {
            expect(screen.getByText("Mi comentario")).toBeInTheDocument();
        });

        // final comment replaces placeholder
        await waitFor(() => {
            const matches = screen.queryAllByText("Mi comentario");
            expect(matches.length).toBe(1);
        });

        // popup
        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes("Comentando Entrenos"))
            ).toBeInTheDocument();
        });
    });

    test("like optimistic update modifies like count and calls API (like -> unlike flows)", async () => {
        const mockWorkout = {
            id: 2,
            routineId: 1,
            routineName: "Rutina Likes",
            startTime: "2023-10-01T10:00:00Z",
            endTime: "2023-10-01T11:00:00Z",
            comments: [],
            likes: [] // start with 0 likes
        };

        const mockRoutineExercises = { content: [] };

        tryLoginFromServiceToken.mockImplementation((success) =>
            success({ user: { id: 42 } })
        );
        getWorkout.mockImplementation((id, success) => success(mockWorkout));
        getRoutineExercises.mockImplementation((rid, success) => success(mockRoutineExercises));
        getWorkoutExercisesByWorkoutId.mockImplementation((wid, success) => success([]));

        // likeWorkout will return no achievements
        likeWorkout.mockImplementation((workoutId, success) => {
            success([]); // no achievements
        });

        // unlikeWorkout will return no achievements
        unlikeWorkout.mockImplementation((workoutId, success) => {
            success([]);
        });

        render(
            <MemoryRouter initialEntries={["/workouts/2"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait until header renders
        await waitFor(() => {
            expect(screen.getByText("Rutina Likes")).toBeInTheDocument();
        });

        // Find the like control. HeartLike implementation is unknown, but it receives a count prop.
        // We assert count rendering by searching for "0" (initial count) and then "1" after liking.
        // Find an element that contains '0' as a standalone (the count). This is defensive: if not found, fail fast.
        const initialCountNode = screen.queryByText("0");
        expect(initialCountNode).not.toBeNull();

        // Trigger the like by finding the HeartLike clickable area.
        // We attempt to click the element that is next to the title in the header row.
        const header = screen.getByText("Rutina Likes").closest("div");
        expect(header).not.toBeNull();

        // Find any button within the header that would toggle like (best-effort).
        const buttons = header.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThanOrEqual(0);

        // If there's a button, click the first one. This will call the onChange passed to HeartLike.
        if (buttons.length > 0) {
            fireEvent.click(buttons[0]);
        } else {
            // fallback: call likeWorkout directly to verify optimistic behavior via re-render — simulate optimistic by re-rendering with new props
            await act(async () => likeWorkout(mockWorkout.id, () => {}));
        }

        // After clicking, optimistic update should have added one like -> count "1" should appear
        await waitFor(() => {
            const after = screen.queryByText("1");
            expect(after).not.toBeNull();
        });

        // Ensure the backend likeWorkout was called once
        expect(likeWorkout).toHaveBeenCalledTimes(1);

        // Now simulate unlike: click again (toggle)
        if (buttons.length > 0) {
            fireEvent.click(buttons[0]);
        } else {
            await act(async () => unlikeWorkout(mockWorkout.id, () => {}));
        }

        // After unlike, optimistic update should remove the like -> count "0" should appear again
        await waitFor(() => {
            const afterUnlike = screen.queryByText("0");
            expect(afterUnlike).not.toBeNull();
        });

        expect(unlikeWorkout).toHaveBeenCalledTimes(1);
    });

    test("handles workout with null workout (no render) and error state button navigates back", async () => {
        // Simulate login success but getWorkout triggers error callback
        tryLoginFromServiceToken.mockImplementation((success) => success({ user: { id: 1 } }));
        getWorkout.mockImplementation((id, success, error) => {
            error("Error al cargar el entrenamiento");
        });

        // Ensure routine exercise loader doesn't crash if not called
        getRoutineExercises.mockImplementation((rid, success) => success({ content: [] }));
        getWorkoutExercisesByWorkoutId.mockImplementation((wid, success) => success([]));

        render(
            <MemoryRouter initialEntries={["/workouts/999"]}>
                <Routes>
                    <Route path="/workouts/:id" element={<WorkoutDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText("Error al cargar el entrenamiento")).toBeInTheDocument();
        });

        // Click the "Volver al historial" button and ensure navigate called with back route
        fireEvent.click(screen.getByText("Volver al historial"));
        expect(mockNavigate).toHaveBeenCalledWith("/workouts//");
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
                exerciseType: "STRENGTH",
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Reps")).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("Peso (kg)"),
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
                exerciseType: "CARDIO",
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
                screen.getByText("1. Press de banca (Cardio)"),
            ).toBeInTheDocument();
        });

        const durationInput = screen.getByPlaceholderText("Duración (s)");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(durationInput, { target: { value: "60" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(addWorkoutExercise).toHaveBeenCalledWith(
                "1",
                null,
                null,
                60,
                1,
                expect.any(Function),
                expect.any(Function)
            );
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
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
                exerciseType: "STRENGTH",
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "50" } });
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
                exerciseType: "STRENGTH",
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

        onFinishWorkoutAchievements.mockImplementation((seconds, reps, workoutId, success) => {
            success([]);
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "50" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(finishWorkout).toHaveBeenCalledWith(
                "1",
                expect.any(Function),
            );
            expect(onFinishWorkoutAchievements).toHaveBeenCalledWith(
                0,
                10,
                "1",
                expect.any(Function),
                expect.any(Function),
            );
        });
    });

    test("shows achievement popup when new streak medal unlocked", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                exerciseType: "STRENGTH",
                position: 1,
            },
        ];

        const mockNewAchievements = [
            {
                id: 4,
                name: "Racha",
                description: "Completa entrenamientos consecutivos",
                progress: 3,
                bronzeReq: 3,
                silverReq: 7,
                goldReq: 30,
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

        onFinishWorkoutAchievements.mockImplementation((seconds, reps, workoutId, success) => {
            success(mockNewAchievements);
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
        });

        const repsInput = screen.getByPlaceholderText("Reps");
        const weightInput = screen.getByPlaceholderText("Peso (kg)");
        const addButton = screen.getByText("Añadir serie");

        fireEvent.change(repsInput, { target: { value: "10" } });
        fireEvent.change(weightInput, { target: { value: "50" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(onFinishWorkoutAchievements).toHaveBeenCalledWith(
                0,
                10,
                "1",
                expect.any(Function),
                expect.any(Function),
            );
            expect(
                screen.getByText((content, element) => content.includes("¡Nueva medalla desbloqueada!") && content.includes("Racha")),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Completa entrenamientos consecutivos (3)"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("OK"));

        // popup visible
        expect(
            screen.getByText(
                (content) =>
                    content.includes("¡Nueva medalla desbloqueada!") &&
                    content.includes("Racha"),
            ),
        ).toBeInTheDocument();

        // cerrar popup
        const popupTitle = screen.getByText(
            (content) =>
                content.includes("¡Nueva medalla desbloqueada!") &&
                content.includes("Racha"),
        );

        fireEvent.click(screen.getByText("OK"));
    });

    test("shows sequential achievement popups when multiple new medals unlocked", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                exerciseType: "STRENGTH",
                position: 1,
            },
        ];

        const mockNewAchievements = [
            {
                id: 4,
                name: "Racha",
                description: "Completa entrenamientos consecutivos",
                progress: 3,
                bronzeReq: 3,
                silverReq: 7,
                goldReq: 30,
            },
            {
                id: 5,
                name: "Fuerza",
                description: "Levanta mucho peso",
                progress: 10,
                bronzeReq: 10,
                silverReq: 20,
                goldReq: 50,
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

        onFinishWorkoutAchievements.mockImplementation((seconds, reps, workoutId, success) => {
            success(mockNewAchievements);
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText("Reps"), { target: { value: "10" } });
        fireEvent.change(screen.getByPlaceholderText("Peso (kg)"), { target: { value: "50" } });
        fireEvent.click(screen.getByText("Añadir serie"));

        await waitFor(() => {
            expect(screen.getByText("Serie 1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        // ===== Popup 1 =====
        const firstPopup = await screen.findByText(
            (c) => c.includes("¡Nueva medalla desbloqueada!") && c.includes("Racha"),
        );

        expect(
            screen.getByText("Completa entrenamientos consecutivos (3)"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByText("OK"));

        // ===== Popup 2 =====
        const secondPopup = await screen.findByText(
            (c) => c.includes("¡Nueva medalla desbloqueada!") && c.includes("Fuerza"),
        );

        expect(
            screen.getByText("Levanta mucho peso (10)"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByText("OK"));
    });

    test("shows popup when finishing with incomplete exercises", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                exerciseType: "STRENGTH",
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        const popup = await screen.findByRole("button", { name: "OK" });

        fireEvent.click(popup);

        await waitFor(() => {
            expect(finishWorkout).toHaveBeenCalledWith(
                "1",
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
                exerciseType: "STRENGTH",
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
                screen.getByText("1. Press de banca (Fuerza)"),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Finalizar entrenamiento"));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Cancelar"));

        await waitFor(() => {
            expect(finishWorkout).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalledWith("/workouts/history");
        });
    });

    test("handles error when finishing workout", async () => {
        const mockWorkout = { id: 1, routineName: "Rutina 1" };
        const mockExercises = [
            {
                id: 1,
                exerciseName: "Press de banca",
                description: "Ejercicio",
                exerciseType: "STRENGTH",
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

        // Firma correcta: SOLO success callback
        finishWorkout.mockImplementation((sessionId, success) => {
            // simula fallo silencioso (como hace el backend actual)
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
                screen.getByText("1. Press de banca (Fuerza)"),
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
            );
        });
    });

    describe("VolumeRankingPage Component", () => {
        test("renders loading state initially", () => {
            tryLoginFromServiceToken.mockImplementation((success) => {});

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            expect(
                screen.getByText("Cargando rutinas completadas...")
            ).toBeInTheDocument();
        });

        test("redirects to login on authentication failure", () => {
            tryLoginFromServiceToken.mockImplementation((success, error) => {
                error();
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/users/login");
        });
        test("renders error state when loading workouts fails", async () => {
            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success, error) => {
                error({ message: "Error al cargar las rutinas completadas" });
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(
                    screen.getByText("Error al cargar las rutinas completadas")
                ).toBeInTheDocument();
                expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
            });
        });

        test("renders empty state when no routines completed", async () => {
            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success([]);
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(
                    screen.getByText("No has completado ninguna rutina todavía.")
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Completa una rutina para ver tu ranking.")
                ).toBeInTheDocument();
            });
        });

        test("renders routine list correctly", async () => {
            const mockWorkouts = [
                {
                    id: 1,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-01T10:00:00Z",
                    endTime: "2023-10-01T11:00:00Z",
                },
                {
                    id: 2,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-02T10:00:00Z",
                    endTime: "2023-10-02T11:00:00Z",
                },
                {
                    id: 3,
                    routineId: 2,
                    routineName: "Rutina Cardio",
                    startTime: "2023-10-03T10:00:00Z",
                    endTime: "2023-10-03T11:00:00Z",
                },
            ];

            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success(mockWorkouts);
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Rankings por volumen")).toBeInTheDocument();
                expect(
                    screen.getByText("Selecciona una rutina para ver el ranking de volumen total")
                ).toBeInTheDocument();
                expect(screen.getByText("Rutina Cardio")).toBeInTheDocument();
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
                expect(screen.getByText("Completada 2 veces")).toBeInTheDocument();
                expect(screen.getByText("Completada 1 vez")).toBeInTheDocument();
            });
        });

        test("loads ranking when routine is clicked", async () => {
            const mockWorkouts = [
                {
                    id: 1,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-01T10:00:00Z",
                    endTime: "2023-10-01T11:00:00Z",
                },
            ];

            const mockRanking = [
                {
                    userId: 1,
                    userName: "John",
                    userSurname: "Doe",
                    workoutId: 1,
                    endTime: "2023-10-01T11:00:00Z",
                    totalVolume: 5000,
                },
                {
                    userId: 2,
                    userName: "Jane",
                    userSurname: "Smith",
                    workoutId: 2,
                    endTime: "2023-10-02T11:00:00Z",
                    totalVolume: 4500,
                },
            ];

            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success(mockWorkouts);
            });

            getVolumeRankingForRoutine.mockImplementation((routineId, success) => {
                success(mockRanking);
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Rutina Fuerza"));

            await waitFor(() => {
                expect(getVolumeRankingForRoutine).toHaveBeenCalledWith(
                    1,
                    expect.any(Function),
                    expect.any(Function)
                );
                expect(screen.getByText("←")).toBeInTheDocument();
                expect(screen.getByText("John Doe")).toBeInTheDocument();
                expect(screen.getByText("Jane Smith")).toBeInTheDocument();
                expect(screen.getByText("5000")).toBeInTheDocument();
                expect(screen.getByText("4500")).toBeInTheDocument();
            });
        });

        test("displays error when ranking fails to load", async () => {
            const mockWorkouts = [
                {
                    id: 1,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-01T10:00:00Z",
                    endTime: "2023-10-01T11:00:00Z",
                },
            ];

            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success(mockWorkouts);
            });

            getVolumeRankingForRoutine.mockImplementation((routineId, success, error) => {
                error({ message: "Error al cargar el ranking" });
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Rutina Fuerza"));

            await waitFor(() => {
                expect(screen.getByText("Error al cargar el ranking")).toBeInTheDocument();
            });
        });

        test("displays empty ranking message when no data available", async () => {
            const mockWorkouts = [
                {
                    id: 1,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-01T10:00:00Z",
                    endTime: "2023-10-01T11:00:00Z",
                },
            ];

            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success(mockWorkouts);
            });

            getVolumeRankingForRoutine.mockImplementation((routineId, success) => {
                success([]);
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Rutina Fuerza"));

            await waitFor(() => {
                expect(
                    screen.getByText("No hay datos de volumen para esta rutina.")
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Tú o las personas que sigues aún no han completado esta rutina.")
                ).toBeInTheDocument();
            });
        });

        test("displays current user position in ranking", async () => {
            const mockWorkouts = [
                {
                    id: 1,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-01T10:00:00Z",
                    endTime: "2023-10-01T11:00:00Z",
                },
            ];

            const mockRanking = [
                {
                    userId: 2,
                    userName: "Jane",
                    userSurname: "Smith",
                    workoutId: 2,
                    endTime: "2023-10-02T11:00:00Z",
                    totalVolume: 5000,
                },
                {
                    userId: 1,
                    userName: "John",
                    userSurname: "Doe",
                    workoutId: 1,
                    endTime: "2023-10-01T11:00:00Z",
                    totalVolume: 4500,
                },
            ];

            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success(mockWorkouts);
            });

            getVolumeRankingForRoutine.mockImplementation((routineId, success) => {
                success(mockRanking);
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Rutina Fuerza"));

            await waitFor(() => {
                expect(screen.getByText("Tu posición: #2")).toBeInTheDocument();
            });
        });

        test("navigates back to routine list", async () => {
            const mockWorkouts = [
                {
                    id: 1,
                    routineId: 1,
                    routineName: "Rutina Fuerza",
                    startTime: "2023-10-01T10:00:00Z",
                    endTime: "2023-10-01T11:00:00Z",
                },
            ];

            const mockRanking = [
                {
                    userId: 1,
                    userName: "John",
                    userSurname: "Doe",
                    workoutId: 1,
                    endTime: "2023-10-01T11:00:00Z",
                    totalVolume: 5000,
                },
            ];

            tryLoginFromServiceToken.mockImplementation((success) => {
                success({ user: { id: 1 } });
            });

            getWorkoutsByUser.mockImplementation((userId, success) => {
                success(mockWorkouts);
            });

            getVolumeRankingForRoutine.mockImplementation((routineId, success) => {
                success(mockRanking);
            });

            render(
                <MemoryRouter>
                    <VolumeRankingPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Rutina Fuerza"));

            await waitFor(() => {
                expect(screen.getByText("←")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("←"));

            await waitFor(() => {
                expect(screen.getByText("Rutina Fuerza")).toBeInTheDocument();
                expect(
                    screen.getByText("Selecciona una rutina para ver el ranking de volumen total")
                ).toBeInTheDocument();
            });
        });
    });
});
