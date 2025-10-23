import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import CreateExercise from "../../modules/app/components/routines/CreateExercise";
import CreateRoutine from "../../modules/app/components/routines/CreateRoutine";
import EditExercise from "../../modules/app/components/routines/EditExercise";
import EditRoutine from "../../modules/app/components/routines/EditRoutine";
import ExerciseDetails from "../../modules/app/components/routines/ExerciseDetails";
import RoutineDetails from "../../modules/app/components/routines/RoutineDetails";
import Routines from "../../modules/app/components/routines/Routines";
import Exercises from "../../modules/app/components/routines/Exercises";

import { tryLoginFromServiceToken } from "../../backend/userService";
import * as exerciseService from "../../backend/exerciseService";
import * as routineService from "../../backend/routineService";
import * as routineExerciseService from "../../backend/routineExerciseService";
import * as workoutService from "../../backend/workoutService";
import * as userFollowService from "../../backend/userFollowService";
import * as routineLikeService from "../../backend/routineLikeService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
}));

jest.mock("../../backend/userService", () => ({
  tryLoginFromServiceToken: jest.fn(),
}));

jest.mock("../../backend/exerciseService", () => ({
  createExercise: jest.fn(),
  getExercise: jest.fn(),
  updateExercise: jest.fn(),
  deleteExercise: jest.fn(),
  updateExerciseStatus: jest.fn(),
  getAllExercises: jest.fn(),
  getExercisesByStatus: jest.fn(),
  getPendingExercises: jest.fn(),
}));

jest.mock("../../backend/routineService", () => ({
  createRoutine: jest.fn(),
  getRoutine: jest.fn(),
  updateRoutine: jest.fn(),
  deleteRoutine: jest.fn(),
  getAllRoutines: jest.fn(),
  getFilteredRoutines: jest.fn(),
}));

jest.mock("../../backend/routineExerciseService", () => ({
  createRoutineExercise: jest.fn(),
  getRoutineExercises: jest.fn(),
  updateRoutineExercise: jest.fn(),
  deleteRoutineExercise: jest.fn(),
}));

jest.mock("../../backend/workoutService", () => ({
  getWorkouts: jest.fn(),
  startWorkout: jest.fn(),
}));

jest.mock("../../backend/userFollowService", () => ({
  followTrainer: jest.fn(),
  unfollowTrainer: jest.fn(),
  getFollowedTrainers: jest.fn(),
}));

jest.mock("../../backend/routineLikeService", () => ({
  getLikes: jest.fn(),
  likeRoutine: jest.fn(),
  unlikeRoutine: jest.fn(),
}));

jest.mock("../../backend/appFetch", () => ({
  getServiceToken: jest.fn(),
}));

describe("Routines Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CreateExercise Component", () => {
    test("renders loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation((success) => {});

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando ejercicio...")).toBeInTheDocument();
    });

    test("redirects to login on authentication failure", () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      expect(mockNavigate).toHaveBeenCalledWith("/users/login");
    });

    test("renders form after authentication", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Estás creando un nuevo ejercicio..."),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(
            "Escriba aquí el nombre del ejercicio...",
          ),
        ).toBeInTheDocument();
        expect(screen.getByText("Guardar")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });
    });

    test("updates form fields correctly", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(
          "Escriba aquí el nombre del ejercicio...",
        );
        const descriptionInput = screen.getByPlaceholderText(
          "Describa brevemente el ejercicio...",
        );

        fireEvent.change(nameInput, { target: { value: "Test Exercise" } });
        fireEvent.change(descriptionInput, {
          target: { value: "Test Description" },
        });

        expect(nameInput.value).toBe("Test Exercise");
        expect(descriptionInput.value).toBe("Test Description");
      });
    });

    test("shows error for empty name on save", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);

        expect(
          screen.getByText("El nombre es obligatorio"),
        ).toBeInTheDocument();
      });
    });

    test("shows error for long name", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(
          "Escriba aquí el nombre del ejercicio...",
        );
        fireEvent.change(nameInput, { target: { value: "A".repeat(51) } });

        expect(
          screen.getByText("El nombre es demasiado largo"),
        ).toBeInTheDocument();
      });
    });

    test("calls createExercise on valid save", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.createExercise.mockImplementation(
        (name, desc, muscle, equip, image, success) => {
          success();
        },
      );

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(
          "Escriba aquí el nombre del ejercicio...",
        );
        fireEvent.change(nameInput, { target: { value: "Test Exercise" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(exerciseService.createExercise).toHaveBeenCalledWith(
          "Test Exercise",
          "",
          "",
          "",
          null,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("shows popup on successful creation", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.createExercise.mockImplementation(
        (name, desc, muscle, equip, image, success) => {
          success();
        },
      );

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(
          "Escriba aquí el nombre del ejercicio...",
        );
        fireEvent.change(nameInput, { target: { value: "Test Exercise" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Ejercicio creado correctamente/),
        ).toBeInTheDocument();
      });
    });

    test("navigates to exercises on popup OK", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.createExercise.mockImplementation(
        (name, desc, muscle, equip, image, success) => {
          success();
        },
      );

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(
          "Escriba aquí el nombre del ejercicio...",
        );
        fireEvent.change(nameInput, { target: { value: "Test Exercise" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        const okButton = screen.getByText("OK");
        fireEvent.click(okButton);
        expect(mockNavigate).toHaveBeenCalledWith("/exercises");
      });
    });

    test("handles save error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.createExercise.mockImplementation(
        (name, desc, muscle, equip, image, success, error) => {
          error("Error");
        },
      );

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(
          "Escriba aquí el nombre del ejercicio...",
        );
        fireEvent.change(nameInput, { target: { value: "Test Exercise" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Error al crear el ejercicio. Intenta de nuevo."),
        ).toBeInTheDocument();
      });
    });

    test("navigates on cancel", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith("/exercises");
      });
    });
  });

  describe("CreateRoutine Component", () => {
    test("renders loading state initially", () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {},
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando ejercicios...")).toBeInTheDocument();
    });

    test("renders form after loading exercises", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {
          success({
            content: [{ id: 1, name: "Exercise 1", status: "APPROVED" }],
          });
        },
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Estás creando un nuevo entrenamiento..."),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Escriba aquí el título de la rutina."),
        ).toBeInTheDocument();
      });
    });

    test("adds and removes exercises", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {
          success({
            content: [{ id: 1, name: "Exercise 1", status: "APPROVED" }],
          });
        },
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const addButton = screen.getByText("+");
        fireEvent.click(addButton);

        expect(screen.getByText("Ejercicio 2:")).toBeInTheDocument();
      });
    });

    test("saves routine successfully", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {
          success({
            content: [{ id: 1, name: "Exercise 1", status: "APPROVED" }],
          });
        },
      );

      routineService.createRoutine.mockImplementation(
        (title, desc, trainerId, visibility, difficulty, success) => {
          success({ id: 1 });
        },
      );

      routineExerciseService.createRoutineExercise.mockImplementation(
        (routineId, exerciseId, position, success) => {
          success();
        },
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText(
          "Escriba aquí el título de la rutina.",
        );
        fireEvent.change(titleInput, { target: { value: "Test Routine" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(routineService.createRoutine).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/routines");
      });
    });
  });

  describe("EditExercise Component", () => {
    test("renders loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation((success) => {});

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando ejercicio...")).toBeInTheDocument();
    });

    test("loads and displays exercise data", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getExercise.mockImplementation((id, success) => {
        success({
          name: "Test Exercise",
          description: "Desc",
          muscleGroup: "Chest",
          equipment: "Bar",
        });
      });

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Exercise")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
      });
    });

    test("updates exercise successfully", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getExercise.mockImplementation((id, success) => {
        success({
          name: "Test Exercise",
          description: "Desc",
          muscleGroup: "Chest",
          equipment: "Bar",
        });
      });

      exerciseService.updateExercise.mockImplementation(
        (id, name, desc, muscle, equip, image, success) => {
          success();
        },
      );

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const nameInput = screen.getByDisplayValue("Test Exercise");
        fireEvent.change(nameInput, { target: { value: "Updated Exercise" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(exerciseService.updateExercise).toHaveBeenCalledWith(
          "1",
          "Updated Exercise",
          "Desc",
          "Chest",
          "Bar",
          null,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });
  });

  describe("EditRoutine Component", () => {
    test("renders loading state initially", () => {
      routineService.getRoutine.mockImplementation((id, success) => {});

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando rutina...")).toBeInTheDocument();
    });

    test("loads and displays routine data", async () => {
      routineService.getRoutine.mockImplementation((id, success) => {
        success({
          content: [
            {
              name: "Test Routine",
              description: "Desc",
              visibility: "PUBLIC",
              difficulty: "INTERMEDIATE",
            },
          ],
        });
      });

      routineExerciseService.getRoutineExercises.mockImplementation(
        (id, success) => {
          success({
            content: [
              { exerciseId: 1, exerciseName: "Exercise 1", position: 1 },
            ],
          });
        },
      );

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [{ id: 1, name: "Exercise 1" }] });
      });

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Routine")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
      });
    });

    test("saves changes successfully", async () => {
      routineService.getRoutine.mockImplementation((id, success) => {
        success({
          content: [
            {
              name: "Test Routine",
              description: "Desc",
              visibility: "PUBLIC",
              difficulty: "INTERMEDIATE",
            },
          ],
        });
      });

      routineExerciseService.getRoutineExercises.mockImplementation(
        (id, success) => {
          success({ content: [] });
        },
      );

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [] });
      });

      routineService.updateRoutine.mockImplementation(
        (id, name, desc, visibility, difficulty, success) => {
          success();
        },
      );

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const titleInput = screen.getByDisplayValue("Test Routine");
        fireEvent.change(titleInput, { target: { value: "Updated Routine" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(routineService.updateRoutine).toHaveBeenCalled();
      });
    });
  });

  describe("ExerciseDetails Component", () => {
    test("renders loading state initially", () => {
      exerciseService.getExercise.mockImplementation((id, success) => {});

      render(
        <MemoryRouter initialEntries={["/exercises/1"]}>
          <Routes>
            <Route path="/exercises/:id" element={<ExerciseDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando ejercicio...")).toBeInTheDocument();
    });

    test("displays exercise details", async () => {
      exerciseService.getExercise.mockImplementation((id, success) => {
        success({
          name: "Test Exercise",
          description: "Desc",
          muscleGroup: "Chest",
          equipment: "Bar",
          image: null,
        });
      });

      render(
        <MemoryRouter initialEntries={["/exercises/1"]}>
          <Routes>
            <Route path="/exercises/:id" element={<ExerciseDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Exercise")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
        expect(screen.getByText("Chest")).toBeInTheDocument();
        expect(screen.getByText("Bar")).toBeInTheDocument();
      });
    });

    test("navigates back on button click", async () => {
      exerciseService.getExercise.mockImplementation((id, success) => {
        success({ name: "Test Exercise", description: "Desc" });
      });

      render(
        <MemoryRouter initialEntries={["/exercises/1"]}>
          <Routes>
            <Route path="/exercises/:id" element={<ExerciseDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const backButton = screen.getByText("←");
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith("/exercises");
      });
    });
  });

  describe("RoutineDetails Component", () => {
    test("renders loading state initially", () => {
      routineService.getRoutine.mockImplementation((id, success) => {});

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando rutina...")).toBeInTheDocument();
    });

    test("displays routine and exercises", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getRoutine.mockImplementation((id, success) => {
        success({
          content: [
            { name: "Test Routine", description: "Desc", trainerId: 1 },
          ],
        });
      });

      routineExerciseService.getRoutineExercises.mockImplementation(
        (id, success) => {
          success({
            content: [
              {
                id: 1,
                exerciseName: "Exercise 1",
                exerciseDescription: "Desc",
              },
            ],
          });
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Routine")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
        expect(screen.getByText("1. Exercise 1")).toBeInTheDocument();
      });
    });

    test("starts workout on button click", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getRoutine.mockImplementation((id, success) => {
        success({
          content: [
            { id: 1, name: "Test Routine", description: "Desc", trainerId: 1 },
          ],
        });
      });

      routineExerciseService.getRoutineExercises.mockImplementation(
        (id, success) => {
          success({ content: [] });
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      workoutService.startWorkout.mockImplementation((routineId, success) => {
        success({ id: 1 });
      });

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
        expect(workoutService.startWorkout).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });
  });

  describe("Routines Component", () => {
    test("renders loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation((success) => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      expect(
        screen.getByText("Cargando entrenamientos..."),
      ).toBeInTheDocument();
    });

    test("displays routines list", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
          },
        ]);
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [] });
      });

      routineLikeService.getLikes.mockImplementation((success) => {
        success([]);
      });

      userFollowService.getFollowedTrainers.mockImplementation(
        (userId, success) => {
          success([]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Routine 1")).toBeInTheDocument();
        expect(screen.getByText("Generado por Trainer")).toBeInTheDocument();
      });
    });

    test("filters routines", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([]);
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [] });
      });

      routineLikeService.getLikes.mockImplementation((success) => {
        success([]);
      });

      userFollowService.getFollowedTrainers.mockImplementation(
        (userId, success) => {
          success([]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const filterButton = screen.getByText("Filtrar");
        fireEvent.click(filterButton);

        const difficultySelect = screen.getByText("Todas");
        fireEvent.click(difficultySelect);
        const beginnerOption = screen.getByText("Principiante");
        fireEvent.click(beginnerOption);

        const applyButton = screen.getByText("Aplicar Filtros");
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(routineService.getFilteredRoutines).toHaveBeenCalled();
      });
    });
  });

  describe("Exercises Component", () => {
    test("renders loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation((success) => {});

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando ejercicios...")).toBeInTheDocument();
    });

    test("displays exercises list", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Exercise 1",
            description: "Desc",
            status: "APPROVED",
          },
        ]);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Exercise 1")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
      });
    });

    test("navigates to create exercise", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success([]);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const addButton = screen.getByText("+");
        fireEvent.click(addButton);
        expect(mockNavigate).toHaveBeenCalledWith("/exercises/new");
      });
    });
  });
});
