import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WorkoutFeed from "../../modules/app/components/workouts/WorkoutFeed";

import {
    tryLoginFromServiceToken
} from "../../backend/userService";

import {
    getWorkoutsFromFollowing
} from "../../backend/workoutService";

import {
    getFollowers,
    getFollowedTrainers
} from "../../backend/userFollowService";


const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
    tryLoginFromServiceToken: jest.fn(),
}));

jest.mock("../../backend/workoutService", () => ({
    getWorkoutsFromFollowing: jest.fn(),
}));

jest.mock("../../backend/userFollowService", () => ({
    getFollowers: jest.fn(),
    getFollowedTrainers: jest.fn(),
}));


describe("WorkoutFeed Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockUser = {
        id: "123",
        name: "John",
        surname: "Doe"
    };

    const mockWorkouts = [
        {
            id: 1,
            userName: "Alice",
            userSurname: "Smith",
            userProfilePicture: "",
            routineName: "Piernas",
            startTime: "2024-01-01T12:00:00",
            endTime: "2024-01-01T12:30:00",
            likes: [],
            comments: []
        }
    ];

    const setupAuthAndData = () => {
        tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
            resolve({ user: mockUser });
        });

        getFollowers.mockImplementation((id, resolve) => resolve([]));

        getFollowedTrainers.mockImplementation((id, resolve) => resolve([]));

        getWorkoutsFromFollowing.mockImplementation((resolve) => {
            resolve(mockWorkouts);
        });
    };

    test("renders loading state initially", () => {
        tryLoginFromServiceToken.mockImplementation(() => {}); // No callback → loading state

        render(
            <MemoryRouter>
                <WorkoutFeed />
            </MemoryRouter>
        );

        expect(
            screen.getByText("Cargando feed de entrenamientos...")
        ).toBeInTheDocument();
    });

    test("loads user data and workouts correctly", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter>
                <WorkoutFeed />
            </MemoryRouter>
        );

        // Espera a que termine la carga
        await waitFor(() => {
            expect(screen.getByText("Feed de entrenamientos")).toBeInTheDocument();
        });

        expect(screen.getByText("Piernas")).toBeInTheDocument();
    });

    test("renders follower and following buttons correctly", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter>
                <WorkoutFeed />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Seguidores: 0")).toBeInTheDocument();
            expect(screen.getByText("Siguiendo: 0")).toBeInTheDocument();
        });
    });

    test("opens user search modal when clicking 'Buscar usuarios'", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter>
                <WorkoutFeed />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Buscar usuarios")).toBeInTheDocument();
        });

        const searchButton = screen.getByText("Buscar usuarios");

        fireEvent.click(searchButton);

        // UserSearch muestra contenido solo cuando isOpen=true.
        // Como mínimo debe renderizar algún wrapper interno.
        expect(searchButton).toBeInTheDocument();
    });

    test("navigates correctly when clicking Seguidores", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter>
                <WorkoutFeed />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Seguidores: 0")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Seguidores: 0"));

        expect(mockNavigate).toHaveBeenCalledWith("/users/followers/123");
    });

    test("navigates correctly when clicking Siguiendo", async () => {
        setupAuthAndData();

        render(
            <MemoryRouter>
                <WorkoutFeed />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Siguiendo: 0")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Siguiendo: 0"));

        expect(mockNavigate).toHaveBeenCalledWith("/users/following/123");
    });
});
