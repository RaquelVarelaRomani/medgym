import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Wrapped from "../../modules/app/components/wrapped/Wrapped";

import { tryLoginFromServiceToken } from "../../backend/userService";
import {
    getWeightComparison,
    getLongestStreak,
    getTopExercises,
    getFavoriteRoutine,
    getFavoriteMuscleGroup,
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
    getFavoriteRoutine: jest.fn(),
    getFavoriteMuscleGroup: jest.fn(),
    getAnnualSummary: jest.fn(),
}));

const resolveWrappedSuccessfully = () => {
    tryLoginFromServiceToken.mockImplementation((onSuccess) => {
        onSuccess({ user: { id: 1 } });
    });

    getWeightComparison.mockImplementation((_, onSuccess) =>
        onSuccess({ totalWeightKg: 1000, comparisonPhrase: "algo" })
    );

    getLongestStreak.mockImplementation((_, onSuccess) =>
        onSuccess(10)
    );

    getAnnualSummary.mockImplementation((onSuccess) =>
        onSuccess({
            likesGiven: 1,
            likesReceived: 2,
            commentsGiven: 3,
            commentsReceived: 4,
        })
    );

    getTopExercises.mockImplementation((onSuccess) =>
        onSuccess([])
    );

    getFavoriteMuscleGroup.mockImplementation((onSuccess) =>
        onSuccess({ muscleGroup: "General" })
    );

    getFavoriteRoutine.mockImplementation((onSuccess) =>
        onSuccess(null)
    );
};

afterEach(() => {
    cleanup();
    jest.clearAllMocks();
});

describe("Wrapped (Jenkins-safe)", () => {
    test("redirects to login if user is not authenticated", async () => {
        tryLoginFromServiceToken.mockImplementation((_, onFail) => {
            onFail();
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

    test("redirects to correct wrapped if accessing another user", async () => {
        tryLoginFromServiceToken.mockImplementation((onSuccess) => {
            onSuccess({ user: { id: 2 } });
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

    test("renders wrapped intro after successful load", async () => {
        resolveWrappedSuccessfully();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Tu año en")
        ).toBeInTheDocument();

        expect(screen.getByText("MEDGYM")).toBeInTheDocument();
        expect(screen.getByText("2025")).toBeInTheDocument();
    });

    test("shows loading message before data is ready", () => {
        tryLoginFromServiceToken.mockImplementation(() => {
            // intentionally do nothing
        });

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByText("Cargando tu Wrapped 2025...")
        ).toBeInTheDocument();
    });

    test("close button navigates to profile", async () => {
        resolveWrappedSuccessfully();

        render(
            <MemoryRouter initialEntries={["/users/1/wrapped"]}>
                <Routes>
                    <Route path="/users/:id/wrapped" element={<Wrapped />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByText("Tu año en");

        fireEvent.click(screen.getByText("✕"));

        expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
    });
});
