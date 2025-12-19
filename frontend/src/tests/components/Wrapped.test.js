import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Wrapped from "../../modules/app/components/wrapped/Wrapped";

import { tryLoginFromServiceToken } from "../../backend/userService";
import {
    getWeightComparison,
    getLongestStreak,
    getTopExercises,
    getFavoriteMuscleGroup,
    getFavoriteRoutine,
    getAnnualSummary
} from "../../backend/wrappedService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
}));

jest.mock("../../backend/userService", () => ({
    tryLoginFromServiceToken: jest.fn(),
}));

jest.mock("../../backend/wrappedService", () => ({
    getWeightComparison: jest.fn(),
    getLongestStreak: jest.fn(),
    getTopExercises: jest.fn(),
    getFavoriteMuscleGroup: jest.fn(),
    getFavoriteRoutine: jest.fn(),
    getAnnualSummary: jest.fn(),
}));

describe("Wrapped Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe"
    };

    const mockWeightData = {
        totalWeightKg: 125000,
        comparisonPhrase: "3 elefantes africanos"
    };

    const mockStreakData = 21;

    const mockSocialData = {
        likesGiven: 156,
        likesReceived: 234,
        commentsGiven: 89,
        commentsReceived: 167
    };

    const mockExercises = [
        { name: "Sentadillas", count: 45, muscleGroup: "Piernas" },
        { name: "Press de banca", count: 38, muscleGroup: "Pecho" },
        { name: "Peso muerto", count: 32, muscleGroup: "Espalda" }
    ];

    const mockMuscleGroup = {
        muscleGroup: "Piernas"
    };

    const mockRoutine = {
        name: "Rutina de Fuerza Total",
        count: 24,
        creatorName: "Carlos Entrenador"
    };

    const setupAuthAndData = () => {
        tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
            resolve({ user: mockUser });
        });

        getWeightComparison.mockImplementation((year, resolve) => {
            resolve(mockWeightData);
        });

        getLongestStreak.mockImplementation((year, resolve) => {
            resolve(mockStreakData);
        });

        getAnnualSummary.mockImplementation((resolve) => {
            resolve(mockSocialData);
        });

        getTopExercises.mockImplementation((resolve) => {
            resolve(mockExercises);
        });

        getFavoriteMuscleGroup.mockImplementation((resolve) => {
            resolve(mockMuscleGroup);
        });

        getFavoriteRoutine.mockImplementation((resolve) => {
            resolve(mockRoutine);
        });
    };

    test("renders loading state initially", () => {
        tryLoginFromServiceToken.mockImplementation(() => {}); // No callback → loading state

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Cargando tu Wrapped 2025...")).toBeInTheDocument();
    });

    test("redirects to login if user is not authenticated", async () => {
        tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
            reject();
        });

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/users/login");
        });
    });

    test("redirects if user accesses another user's wrapped", async () => {
        const differentUser = { ...mockUser, id: 2 };

        tryLoginFromServiceToken.mockImplementation((resolve) => {
            resolve({ user: differentUser });
        });

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/users/2/wrapped");
        });
    });

    test("loads and displays all wrapped data correctly", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 1 content
        expect(screen.getByText("MEDGYM")).toBeInTheDocument();
        expect(screen.getByText("2025")).toBeInTheDocument();
    });

    test("displays social stats correctly on slide 2", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 2
        const rightArrow = screen.getByText("›");
        fireEvent.click(rightArrow);

        await waitFor(() => {
            expect(screen.getByText("Tu impacto social")).toBeInTheDocument();
            expect(screen.getByText("156")).toBeInTheDocument(); // likesGiven
            expect(screen.getByText("234")).toBeInTheDocument(); // likesReceived
            expect(screen.getByText("89")).toBeInTheDocument(); // commentsGiven
            expect(screen.getByText("167")).toBeInTheDocument(); // commentsReceived
        });
    });

    test("displays top exercises correctly on slide 3", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 3
        const rightArrow = screen.getByText("›");
        fireEvent.click(rightArrow);
        fireEvent.click(rightArrow);

        await waitFor(() => {
            expect(screen.getByText("Tus ejercicios favoritos")).toBeInTheDocument();
            expect(screen.getByText("Sentadillas")).toBeInTheDocument();
            expect(screen.getByText("45 veces")).toBeInTheDocument();
            expect(screen.getByText("Press de banca")).toBeInTheDocument();
            expect(screen.getByText("Peso muerto")).toBeInTheDocument();
        });
    });

    test("displays favorite muscle group on slide 4", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        // Navigate to slide 4
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 3; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Tu grupo muscular favorito")).toBeInTheDocument();
            // Use a more flexible matcher that checks for the text containing "Piernas"
            expect(screen.getByText(/piernas/i)).toBeInTheDocument();
        });
    });

    test("displays favorite routine on slide 5", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 5
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 4; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Tu rutina más seguida")).toBeInTheDocument();
            expect(screen.getByText("Rutina de Fuerza Total")).toBeInTheDocument();
            expect(screen.getByText("Completada 24 veces")).toBeInTheDocument();
            expect(screen.getByText("por Carlos Entrenador")).toBeInTheDocument();
        });
    });

    test("handles null routine response", async () => {
        tryLoginFromServiceToken.mockImplementation((resolve) => {
            resolve({ user: mockUser });
        });

        getWeightComparison.mockImplementation((year, resolve) => resolve(mockWeightData));
        getLongestStreak.mockImplementation((year, resolve) => resolve(mockStreakData));
        getAnnualSummary.mockImplementation((resolve) => resolve(mockSocialData));
        getTopExercises.mockImplementation((resolve) => resolve(mockExercises));
        getFavoriteMuscleGroup.mockImplementation((resolve) => resolve(mockMuscleGroup));
        getFavoriteRoutine.mockImplementation((resolve) => resolve(null));

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 5
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 4; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Tu rutina más seguida")).toBeInTheDocument();
            expect(screen.getByText("Sin rutina favorita")).toBeInTheDocument();
        });
    });

    test("handles routine without creator name", async () => {
        const routineWithoutCreator = {
            name: "Rutina Personal",
            count: 15,
            creatorName: null
        };

        tryLoginFromServiceToken.mockImplementation((resolve) => {
            resolve({ user: mockUser });
        });

        getWeightComparison.mockImplementation((year, resolve) => resolve(mockWeightData));
        getLongestStreak.mockImplementation((year, resolve) => resolve(mockStreakData));
        getAnnualSummary.mockImplementation((resolve) => resolve(mockSocialData));
        getTopExercises.mockImplementation((resolve) => resolve(mockExercises));
        getFavoriteMuscleGroup.mockImplementation((resolve) => resolve(mockMuscleGroup));
        getFavoriteRoutine.mockImplementation((resolve) => resolve(routineWithoutCreator));

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 5
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 4; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Rutina Personal")).toBeInTheDocument();
            expect(screen.getByText("Completada 15 veces")).toBeInTheDocument();
            expect(screen.queryByText(/por/)).not.toBeInTheDocument();
        });
    });

    test("displays longest streak on slide 6", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 6
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 5; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Tu mejor racha")).toBeInTheDocument();
            expect(screen.getByText("21")).toBeInTheDocument();
            expect(screen.getByText("días seguidos")).toBeInTheDocument();
        });
    });

    test("displays total weight on slide 7", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 7
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 6; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Peso total levantado")).toBeInTheDocument();
            expect(screen.getByText("125.000 kg")).toBeInTheDocument();
            expect(screen.getByText("3 elefantes africanos")).toBeInTheDocument();
        });
    });

    test("handles zero values correctly", async () => {
        const zeroData = {
            likesGiven: 0,
            likesReceived: 0,
            commentsGiven: 0,
            commentsReceived: 0
        };

        tryLoginFromServiceToken.mockImplementation((resolve) => {
            resolve({ user: mockUser });
        });

        getWeightComparison.mockImplementation((year, resolve) =>
            resolve({ totalWeightKg: 0, comparisonPhrase: "nada aún" })
        );
        getLongestStreak.mockImplementation((year, resolve) => resolve(0));
        getAnnualSummary.mockImplementation((resolve) => resolve(zeroData));
        getTopExercises.mockImplementation((resolve) => resolve([]));
        getFavoriteMuscleGroup.mockImplementation((resolve) => resolve({ muscleGroup: "General" }));
        getFavoriteRoutine.mockImplementation((resolve) => resolve(null));

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 2
        const rightArrow = screen.getByText("›");
        fireEvent.click(rightArrow);

        await waitFor(() => {
            expect(screen.getByText("Tu impacto social")).toBeInTheDocument();
            // Use getAllByText to verify there are 4 zeros on this slide
            const zeros = screen.getAllByText("0").filter(el =>
                el.className.includes("statNumber")
            );
            expect(zeros).toHaveLength(4);
        });

        //slide 6
        for (let i = 0; i < 4; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("Tu mejor racha")).toBeInTheDocument();
            const streakZero = screen.getAllByText("0").find(el =>
                el.className.includes("streakNumber")
            );
            expect(streakZero).toBeInTheDocument();
        });

        //slide 7
        fireEvent.click(rightArrow);

        await waitFor(() => {
            expect(screen.getByText("Peso total levantado")).toBeInTheDocument();
            expect(screen.getByText("0 kg")).toBeInTheDocument();
            expect(screen.getByText("nada aún")).toBeInTheDocument();
        });
    });

    test("navigates to last slide and shows outro content", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 8
        const rightArrow = screen.getByText("›");
        for (let i = 0; i < 7; i++) {
            fireEvent.click(rightArrow);
        }

        await waitFor(() => {
            expect(screen.getByText("¡Increíble trabajo!")).toBeInTheDocument();
            expect(screen.getByText("2025 fue un año lleno de logros.")).toBeInTheDocument();
            expect(screen.getByText("¿Listo para superar tus límites en 2026?")).toBeInTheDocument();
        });
    });

    test("navigation with left arrow works correctly", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 2
        const rightArrow = screen.getByText("›");
        fireEvent.click(rightArrow);

        await waitFor(() => {
            expect(screen.getByText("Tu impacto social")).toBeInTheDocument();
        });

        //slide 1
        const leftArrow = screen.getByText("‹");
        fireEvent.click(leftArrow);

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });
    });

    test("progress dots navigation works correctly", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 3
        const progressDots = document.querySelectorAll('[class*="progressDot"]');
        fireEvent.click(progressDots[2]);

        await waitFor(() => {
            expect(screen.getByText("Tus ejercicios favoritos")).toBeInTheDocument();
        });
    });

    test("keyboard navigation with arrow keys works", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        fireEvent.keyDown(window, { key: "ArrowRight" });

        await waitFor(() => {
            expect(screen.getByText("Tu impacto social")).toBeInTheDocument();
        });

        fireEvent.keyDown(window, { key: "ArrowLeft" });

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });
    });

    test("close button navigates to profile", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        const closeButton = screen.getByText("✕");
        fireEvent.click(closeButton);

        expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
    });

    test("handles empty exercises", async () => {
        tryLoginFromServiceToken.mockImplementation((resolve) => {
            resolve({ user: mockUser });
        });

        getWeightComparison.mockImplementation((year, resolve) => resolve(mockWeightData));
        getLongestStreak.mockImplementation((year, resolve) => resolve(mockStreakData));
        getAnnualSummary.mockImplementation((resolve) => resolve(mockSocialData));
        getTopExercises.mockImplementation((resolve) => resolve([])); // Empty exercises
        getFavoriteMuscleGroup.mockImplementation((resolve) => resolve(mockMuscleGroup));
        getFavoriteRoutine.mockImplementation((resolve) => resolve(mockRoutine));

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });

        //slide 3
        const rightArrow = screen.getByText("›");
        fireEvent.click(rightArrow);
        fireEvent.click(rightArrow);

        await waitFor(() => {
            expect(screen.getByText("Tus ejercicios favoritos")).toBeInTheDocument();
            expect(screen.getByText("Aún no has registrado ejercicios este año")).toBeInTheDocument();
        });
    });

    test("handles API errors", async () => {
        tryLoginFromServiceToken.mockImplementation((resolve) => {
            resolve({ user: mockUser });
        });

        getWeightComparison.mockImplementation((year, resolve, reject) => {
            reject({ globalError: "Error loading weight" });
        });

        getLongestStreak.mockImplementation((year, resolve, reject) => {
            reject({ globalError: "Error loading streak" });
        });

        getAnnualSummary.mockImplementation((resolve, reject) => {
            reject({ globalError: "Error loading summary" });
        });

        getTopExercises.mockImplementation((resolve, reject) => {
            reject({ globalError: "Error loading exercises" });
        });

        getFavoriteMuscleGroup.mockImplementation((resolve, reject) => {
            reject({ globalError: "Error loading muscle group" });
        });

        getFavoriteRoutine.mockImplementation((resolve, reject) => {
            reject({ globalError: "Error loading routine" });
        });

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Tu año en")).toBeInTheDocument();
        });
    });
});