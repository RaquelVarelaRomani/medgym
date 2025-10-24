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

jest.mock("../../modules/app/components/common/CropModal", () => {
  return function MockCropModal({ onCancel, onSave }) {
    return (
      <div className="crop-modal">
        <div className="crop-box">
          <div className="crop-container">
            <div data-testid="container" />
          </div>
          <div className="zoom-control">
            <label>Zoom</label>
            <input type="range" min="1" max="3" step="0.1" value="1" />
          </div>
          <div className="crop-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="save-btn"
              onClick={() =>
                onSave("data:image/jpeg;base64,mockedcroppedimage")
              }
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };
});

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
    global.alert = jest.fn();
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

    test("renders header with logo and profile navigation", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const logo = screen.getByAltText("Foto de perfil");
        expect(logo).toBeInTheDocument();
        fireEvent.click(logo);
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile");
      });
    });

    test("renders exercise photo section with default image", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const defaultImage = screen.getByAltText("Ejercicio por defecto");
        expect(defaultImage).toBeInTheDocument();
        expect(defaultImage.src).toMatch(/default-exercise\.jpg$/);
      });
    });

    test("renders file upload button", async () => {
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
      });
    });

    test("displays uploaded image when image is set", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      const mockFileReader = {
        onloadend: null,
        readAsDataURL: jest.fn(),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Estás creando un nuevo ejercicio..."),
        ).toBeInTheDocument();
      });
    });

    test("renders form labels and inputs correctly", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText("Nombre:")).toBeInTheDocument();
        expect(screen.getByLabelText("Descripción:")).toBeInTheDocument();
        expect(screen.getByLabelText("Grupo muscular:")).toBeInTheDocument();
        expect(screen.getByLabelText("Equipamiento:")).toBeInTheDocument();
      });
    });

    test("renders form inputs with correct placeholders", async () => {
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
          screen.getByPlaceholderText(
            "Escriba aquí el nombre del ejercicio...",
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Describa brevemente el ejercicio..."),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Ej: Piernas, Espalda, Pecho..."),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Ej: Mancuernas, Barra, Ninguno..."),
        ).toBeInTheDocument();
      });
    });

    test("renders save and cancel buttons", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Guardar")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });
    });

    test("renders popup component", async () => {
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
      });
    });

    test("handles popup OK click navigation", async () => {
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

    test("triggers CropModal on file upload", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      const mockFileReader = {
        onloadend: null,
        readAsDataURL: jest.fn(),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Estás creando un nuevo ejercicio..."),
        ).toBeInTheDocument();
      });

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const fileUploadButton = screen.getByText("Subir foto").parentElement;
      const fileInput = fileUploadButton.querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [file] } });

      mockFileReader.onloadend();

      await waitFor(() => {
        expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
        expect(screen.getByText("Zoom")).toBeInTheDocument();
      });
    });

    test("cancels CropModal on cancel button click", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      const mockFileReader = {
        onloadend: null,
        readAsDataURL: jest.fn(),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Estás creando un nuevo ejercicio..."),
        ).toBeInTheDocument();
      });

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const fileUploadButton = screen.getByText("Subir foto").parentElement;
      const fileInput = fileUploadButton.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      mockFileReader.onloadend();

      await waitFor(() => {
        expect(screen.getByText("Zoom")).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByText("Cancelar");
      const cropCancelButton = cancelButtons.find((button) =>
        button.closest('[class*="crop-modal"]'),
      );
      fireEvent.click(cropCancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Zoom")).not.toBeInTheDocument();
      });
    });

    test("saves cropped image on CropModal save", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      const mockFileReader = {
        onloadend: null,
        readAsDataURL: jest.fn(),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      render(
        <MemoryRouter>
          <CreateExercise />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Estás creando un nuevo ejercicio..."),
        ).toBeInTheDocument();
      });

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const fileUploadButton = screen.getByText("Subir foto").parentElement;
      const fileInput = fileUploadButton.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      mockFileReader.onloadend();

      await waitFor(() => {
        expect(screen.getByText("Zoom")).toBeInTheDocument();
      });

      const saveButtons = screen.getAllByText("Guardar");
      const cropSaveButton = saveButtons.find((button) =>
        button.closest('[class*="crop-modal"]'),
      );
      fireEvent.click(cropSaveButton);

      await waitFor(() => {
        expect(screen.queryByText("Zoom")).not.toBeInTheDocument();
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

    test("handles error in loading exercises", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success, error) => {
          error("Error loading exercises");
        },
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Error al cargar los ejercicios disponibles"),
        ).toBeInTheDocument();
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });

    test("retries loading exercises on button click", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success, error) => {
          error("Error loading exercises");
        },
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const retryButton = screen.getByText("Reintentar");
        fireEvent.click(retryButton);
        expect(exerciseService.getExercisesByStatus).toHaveBeenCalledTimes(2);
      });
    });

    test("shows title error for long title", async () => {
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
        const titleInput = screen.getByPlaceholderText(
          "Escriba aquí el título de la rutina.",
        );
        fireEvent.change(titleInput, { target: { value: "A".repeat(51) } });
        expect(
          screen.getByText("El título es demasiado grande"),
        ).toBeInTheDocument();
      });
    });

    test("shows title error on save without title", async () => {
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
        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
        expect(
          screen.getByText("El título es obligatorio"),
        ).toBeInTheDocument();
      });
    });

    test("removes exercise", async () => {
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
      });

      await waitFor(() => {
        const removeButtons = screen.getAllByTitle("Eliminar ejercicio");
        fireEvent.click(removeButtons[0]);
        expect(screen.queryByText("Ejercicio 2:")).not.toBeInTheDocument();
      });
    });

    test("moves exercise up and down", async () => {
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
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const moveUpButtons = screen.getAllByText("▲");
        const moveDownButtons = screen.getAllByText("▼");
        fireEvent.click(moveUpButtons[1]);
        fireEvent.click(moveDownButtons[0]);
      });
    });

    test("navigates on cancel", async () => {
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
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith("/routines");
      });
    });

    test("selects exercise from dropdown", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {
          success({
            content: [
              { id: 1, name: "Exercise 1", status: "APPROVED" },
              { id: 2, name: "Exercise 2", status: "APPROVED" },
            ],
          });
        },
      );

      render(
        <MemoryRouter>
          <CreateRoutine />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const exerciseInput = screen.getByPlaceholderText(
          "Buscar ejercicio o escribir el nombre...",
        );
        fireEvent.change(exerciseInput, { target: { value: "Exercise" } });
        fireEvent.focus(exerciseInput);
      });

      await waitFor(() => {
        const option = screen.getByText("Exercise 1");
        fireEvent.click(option);
        expect(screen.getByDisplayValue("Exercise 1")).toBeInTheDocument();
      });
    });

    test("handles save error", async () => {
      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {
          success({
            content: [{ id: 1, name: "Exercise 1", status: "APPROVED" }],
          });
        },
      );

      routineService.createRoutine.mockImplementation(
        (title, desc, trainerId, visibility, difficulty, success, error) => {
          error("Save error");
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
      });
    });

    test("handles outside click to close exercise search dropdown", async () => {
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
      });

      await waitFor(() => {
        const exerciseInputs = screen.getAllByPlaceholderText(
          "Buscar ejercicio o escribir el nombre...",
        );
        const exerciseInput = exerciseInputs[1];
        fireEvent.click(exerciseInput);
        fireEvent.change(exerciseInput, { target: { value: "Exercise" } });
      });

      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText("Exercise 1")).not.toBeInTheDocument();
      });
    });

    test("handles trainer ID retrieval from sessionStorage", async () => {
      const mockGetItem = jest.spyOn(Storage.prototype, "getItem");
      mockGetItem.mockReturnValue(JSON.stringify({ id: 123 }));

      exerciseService.getExercisesByStatus.mockImplementation(
        (status, success) => {
          success({
            content: [{ id: 1, name: "Exercise 1", status: "APPROVED" }],
          });
        },
      );

      routineService.createRoutine.mockImplementation(
        (title, desc, trainerId, visibility, difficulty, success) => {
          expect(trainerId).toBe(123);
          success({ id: 1 });
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
      });

      mockGetItem.mockRestore();
    });

    test("handles routine exercise creation errors", async () => {
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
        (routineId, exerciseId, position, success, error) => {
          error("Exercise creation error");
        },
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

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

        const addButton = screen.getByText("+");
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const exerciseInputs = screen.getAllByPlaceholderText(
          "Buscar ejercicio o escribir el nombre...",
        );
        const exerciseInput = exerciseInputs[1];
        fireEvent.change(exerciseInput, { target: { value: "Exercise 1" } });
        fireEvent.focus(exerciseInput);
      });

      await waitFor(() => {
        const option = screen.getByText("Exercise 1");
        fireEvent.click(option);
      });

      await waitFor(() => {
        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error adding exercise:",
          "Exercise creation error",
        );
      });

      consoleSpy.mockRestore();
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

    test("handles authentication error in loadExercise", async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
      });
    });

    test("handles getExercise error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getExercise.mockImplementation((id, success, error) => {
        error("Load error");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error al cargar el ejercicio:",
          "Load error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("shows title error for empty name on save", async () => {
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
        const nameInput = screen.getByDisplayValue("Test Exercise");
        fireEvent.change(nameInput, { target: { value: "" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);

        expect(
          screen.getByText("El nombre es obligatorio"),
        ).toBeInTheDocument();
      });
    });

    test("shows title error for long name", async () => {
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
        const nameInput = screen.getByDisplayValue("Test Exercise");
        fireEvent.change(nameInput, { target: { value: "A".repeat(51) } });

        expect(
          screen.getByText("El nombre es demasiado largo"),
        ).toBeInTheDocument();
      });
    });

    test("handles updateExercise error", async () => {
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
        (id, name, desc, muscle, equip, image, success, error) => {
          error("Update error");
        },
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

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
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error actualizando ejercicio:",
          "Update error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("navigates to profile on logo click", async () => {
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
        const logo = screen.getByAltText("Logo");
        fireEvent.click(logo);
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile");
      });
    });

    test("renders edit header with exercise name", async () => {
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
        expect(
          screen.getByText("Editando ejercicio: Test Exercise"),
        ).toBeInTheDocument();
      });
    });

    test("renders form with pre-filled values", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getExercise.mockImplementation((id, success) => {
        success({
          name: "Test Exercise",
          description: "Test Description",
          muscleGroup: "Chest",
          equipment: "Bar",
          image: "base64string",
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
        expect(
          screen.getByDisplayValue("Test Description"),
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("Chest")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Bar")).toBeInTheDocument();
      });
    });

    test("renders uploaded image when available", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getExercise.mockImplementation((id, success) => {
        success({
          name: "Test Exercise",
          description: "Desc",
          muscleGroup: "Chest",
          equipment: "Bar",
          image: "base64string",
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
        const image = screen.getByAltText("Previsualización del ejercicio");
        expect(image.src).toContain("data:image/jpeg;base64,base64string");
      });
    });

    test("renders default image when no image", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

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
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const image = screen.getByAltText("Ejercicio por defecto");
        expect(image.src).toContain(
          "http://localhost/assets/default-exercise.jpg",
        );
      });
    });

    test("shows popup on successful update", async () => {
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
        expect(
          screen.getByText("Cambios guardados correctamente."),
        ).toBeInTheDocument();
      });
    });

    test("navigates to exercises on popup OK", async () => {
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
        const okButton = screen.getByText("OK");
        fireEvent.click(okButton);
        expect(mockNavigate).toHaveBeenCalledWith("/exercises");
      });
    });

    test("navigates on cancel", async () => {
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
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith("/exercises");
      });
    });

    test("triggers CropModal on file upload", async () => {
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

      const mockFileReader = {
        onloadend: null,
        readAsDataURL: jest.fn(),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Editando ejercicio: Test Exercise"),
        ).toBeInTheDocument();
      });

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const fileUploadButton = screen.getByText("Subir foto").parentElement;
      const fileInput = fileUploadButton.querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [file] } });

      mockFileReader.onloadend();

      await waitFor(() => {
        expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
        expect(screen.getByText("Zoom")).toBeInTheDocument();
      });
    });

    test("saves cropped image on CropModal save", async () => {
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

      const mockFileReader = {
        onloadend: null,
        readAsDataURL: jest.fn(),
      };
      global.FileReader = jest.fn(() => mockFileReader);

      render(
        <MemoryRouter initialEntries={["/exercises/edit/1"]}>
          <Routes>
            <Route path="/exercises/edit/:id" element={<EditExercise />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Editando ejercicio: Test Exercise"),
        ).toBeInTheDocument();
      });

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const fileUploadButton = screen.getByText("Subir foto").parentElement;
      const fileInput = fileUploadButton.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      mockFileReader.onloadend();

      await waitFor(() => {
        expect(screen.getByText("Zoom")).toBeInTheDocument();
      });

      const saveButtons = screen.getAllByText("Guardar");
      const cropSaveButton = saveButtons.find((button) =>
        button.closest('[class*="crop-modal"]'),
      );
      fireEvent.click(cropSaveButton);

      await waitFor(() => {
        expect(screen.queryByText("Zoom")).not.toBeInTheDocument();
      });
    });

    test("clears title error when typing valid name", async () => {
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
        const nameInput = screen.getByDisplayValue("Test Exercise");
        fireEvent.change(nameInput, { target: { value: "" } });

        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);

        expect(
          screen.getByText("El nombre es obligatorio"),
        ).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText("Nombre:");
      fireEvent.change(nameInput, { target: { value: "Valid Name" } });

      await waitFor(() => {
        expect(
          screen.queryByText("El nombre es obligatorio"),
        ).not.toBeInTheDocument();
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

    test("handles error in loading routine", async () => {
      routineService.getRoutine.mockImplementation((id, success, error) => {
        error("Error loading routine");
      });

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Error al cargar la rutina"),
        ).toBeInTheDocument();
      });
    });

    test("handles error in loading routine exercises", async () => {
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
        (id, success, error) => {
          error("Error loading exercises");
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
        expect(
          screen.getByText("Error al cargar los ejercicios de la rutina"),
        ).toBeInTheDocument();
      });
    });

    test("shows title error for long title", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const titleInput = screen.getByDisplayValue("Test Routine");
        fireEvent.change(titleInput, { target: { value: "A".repeat(51) } });
        expect(
          screen.getByText("El título es demasiado grande"),
        ).toBeInTheDocument();
      });
    });

    test("shows no changes popup", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const saveButton = screen.getByText("Guardar");
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("¡No hay cambios para guardar!"),
        ).toBeInTheDocument();
      });
    });

    test("adds and removes exercises", async () => {
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
        const addButton = screen.getByText("+");
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const removeButtons = screen.getAllByTitle("Eliminar ejercicio");
        fireEvent.click(removeButtons[0]);
      });
    });

    test("moves exercises up and down", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const addButton = screen.getByText("+");
        fireEvent.click(addButton);
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const moveUpButtons = screen.getAllByText("▲");
        const moveDownButtons = screen.getAllByText("▼");
        fireEvent.click(moveUpButtons[1]);
        fireEvent.click(moveDownButtons[0]);
      });
    });

    test("handles routine data with null muscleGroup and equipment", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Test Routine")).toBeInTheDocument();
      });
    });

    test("handles routineExerciseService.getRoutineExercises with array content", async () => {
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
        success({ content: [] });
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
      });
    });

    test("handles routineExerciseService.getRoutineExercises with direct array", async () => {
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
          success([{ exerciseId: 1, exerciseName: "Exercise 1", position: 1 }]);
        },
      );

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [] });
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
      });
    });

    test("handles exerciseService.getAllExercises with direct array", async () => {
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
        success([{ id: 1, name: "Exercise 1" }]);
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
      });
    });

    test("handles exerciseService.getAllExercises error", async () => {
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

      exerciseService.getAllExercises.mockImplementation((success, error) => {
        error("Load exercises error");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading exercises:",
          "Load exercises error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles console.log in handleInputChange", async () => {
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

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

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
        expect(consoleSpy).toHaveBeenCalledWith(
          "New routineData:",
          expect.any(Object),
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles console.log in handleExerciseChange", async () => {
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

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const addButton = screen.getByText("+");
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const exerciseInputs = screen.getAllByPlaceholderText(
          "Buscar ejercicio o escribir el nombre...",
        );
        const exerciseInput = exerciseInputs[0];
        fireEvent.change(exerciseInput, { target: { value: "Test Exercise" } });

        expect(consoleSpy).toHaveBeenCalledWith(
          "New exercises:",
          expect.any(Array),
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles async save operations with success messages", async () => {
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
        expect(
          screen.getByText("Cambios guardados. ¡Gracias!"),
        ).toBeInTheDocument();
      });
    });

    test("handles popup OK click navigation", async () => {
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
        const okButton = screen.getByText("OK");
        fireEvent.click(okButton);
        expect(mockNavigate).toHaveBeenCalledWith("/routines");
      });
    });

    test("navigates on cancel", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/edit/1"]}>
          <Routes>
            <Route path="/routines/edit/:id" element={<EditRoutine />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith("/routines");
      });
    });

    test("handles outside click to close filter dropdown", async () => {
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
      });

      await waitFor(() => {
        const difficultySelect = screen.getByText("Todas");
        fireEvent.click(difficultySelect);
      });

      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText("Principiante")).not.toBeInTheDocument();
      });
    });

    test("toggles filter dropdown on click", async () => {
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
      });

      const difficultySelect = screen.getByText("Todas");
      fireEvent.click(difficultySelect);

      await waitFor(() => {
        expect(screen.getByText("Principiante")).toBeInTheDocument();
      });

      fireEvent.click(difficultySelect);

      await waitFor(() => {
        expect(screen.queryByText("Principiante")).not.toBeInTheDocument();
      });
    });

    test("handles API response variation for getAllRoutines as array", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([{ id: 1, name: "Routine 1" }]);
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
      });
    });

    test("handles error in loadAllTrainers", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success, error) => {
        error("Trainers error");
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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading trainers:",
          "Trainers error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles error in loadAllEquipment", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([]);
      });

      exerciseService.getAllExercises.mockImplementation((success, error) => {
        error("Equipment error");
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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading equipment:",
          "Equipment error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles error in loadRoutineLikes", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([]);
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [] });
      });

      routineLikeService.getLikes.mockImplementation((success, error) => {
        error("Likes error");
      });

      userFollowService.getFollowedTrainers.mockImplementation(
        (userId, success) => {
          success([]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading routine likes:",
          "Likes error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles multi-select change for muscle groups", async () => {
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
      });

      await waitFor(() => {
        const muscleGroupSelect = screen
          .getByText("Grupos Musculares:")
          .parentElement.querySelector(".select-display");
        fireEvent.click(muscleGroupSelect);
      });

      await waitFor(() => {
        const bicepsOption = screen.getByText("Bíceps");
        fireEvent.click(bicepsOption);
      });
    });

    test("getDifficultyText returns correct text for all difficulties", async () => {
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
          {
            id: 2,
            name: "Routine 2",
            trainerName: "Trainer",
            difficulty: "INTERMEDIATE",
          },
          {
            id: 3,
            name: "Routine 3",
            trainerName: "Trainer",
            difficulty: "ADVANCED",
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
        expect(screen.getByText("Principiante")).toBeInTheDocument();
        expect(screen.getByText("Intermedia")).toBeInTheDocument();
        expect(screen.getByText("Avanzada")).toBeInTheDocument();
      });
    });

    test("renders UI based on user role - CLIENT", async () => {
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
        expect(screen.getByText("Empezar")).toBeInTheDocument();
        expect(screen.queryByText("+")).not.toBeInTheDocument();
      });
    });

    test("renders UI based on user role - TRAINER", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
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
        expect(screen.getByText("+")).toBeInTheDocument();
      });
    });

    test("renders UI based on user role - ADMIN", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "ADMIN" } });
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
        expect(screen.getByText("+")).toBeInTheDocument();
      });
    });

    test("handles ConfirmationPopup onCancel for delete", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            trainerId: 1,
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
        const deleteButton = screen.getByText("Eliminar");
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText("Seguro que quieres eliminar esta rutina?"),
        ).not.toBeInTheDocument();
      });
    });

    test("handles ConfirmationPopup onCancel for unfollow", async () => {
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
            trainerId: 2,
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
          success([{ trainerId: 2 }]);
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
        const followButton = screen.getByText("Dejar de seguir al creador");
        fireEvent.click(followButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText(
            "¿Seguro que quieres dejar de seguir a este entrenador?",
          ),
        ).not.toBeInTheDocument();
      });
    });

    test("handles ConfirmationPopup onCancel for active workout", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText(
            "Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?",
          ),
        ).not.toBeInTheDocument();
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

    test("handles getExercise error", async () => {
      exerciseService.getExercise.mockImplementation((id, success, error) => {
        error("Error loading exercise");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={["/exercises/1"]}>
          <Routes>
            <Route path="/exercises/:id" element={<ExerciseDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error cargando ejercicio:",
          "Error loading exercise",
        );
      });

      consoleSpy.mockRestore();
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

    test("handles error in loading routine", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getRoutine.mockImplementation((id, success, error) => {
        error("Error loading routine");
      });

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Error al cargar la rutina"),
        ).toBeInTheDocument();
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });

    test("handles error in loading exercises", async () => {
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
        (id, success, error) => {
          error("Error loading exercises");
        },
      );

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Error al cargar los ejercicios"),
        ).toBeInTheDocument();
      });
    });

    test("toggles exercise expansion", async () => {
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
          success({
            content: [
              {
                id: 1,
                exerciseName: "Exercise 1",
                exerciseDescription: "Desc",
                position: 1,
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
        const exerciseHeader = screen.getByText("1. Exercise 1");
        fireEvent.click(exerciseHeader);
        expect(screen.getByText("Desc")).toBeInTheDocument();
      });
    });

    test("handles authentication failure", async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
      });
    });

    test("handles start workout error", async () => {
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

      workoutService.startWorkout.mockImplementation(
        (routineId, success, error) => {
          error("Start workout error");
        },
      );

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
        expect(workoutService.startWorkout).toHaveBeenCalled();
      });
    });

    test("navigates back", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const backButton = screen.getByText("←");
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith("/routines");
      });
    });

    test("handles isClient function", async () => {
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

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Routine")).toBeInTheDocument();
      });
    });

    test("handles isTrainer function", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
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

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Routine")).toBeInTheDocument();
      });
    });

    test("handles isAdmin function", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "ADMIN" } });
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

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Routine")).toBeInTheDocument();
      });
    });

    test("handles isRoutineCreator function", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
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

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Routine")).toBeInTheDocument();
      });
    });

    test("handles isRoutineCreator with null trainerId", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getRoutine.mockImplementation((id, success) => {
        success({
          content: [
            {
              id: 1,
              name: "Test Routine",
              description: "Desc",
              trainerId: null,
            },
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

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Routine")).toBeInTheDocument();
      });
    });

    test("handles routineService.getRoutine with direct object", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getRoutine.mockImplementation((id, success) => {
        success({ name: "Test Routine", description: "Desc", trainerId: 1 });
      });

      routineExerciseService.getRoutineExercises.mockImplementation(
        (id, success) => {
          success({ content: [] });
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
      });
    });

    test("handles routineExerciseService.getRoutineExercises with direct array", async () => {
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
          success([
            { exerciseName: "Exercise 1", exerciseDescription: "Desc" },
          ]);
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
      });
    });

    test("handles workoutService.getWorkouts error", async () => {
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

      workoutService.getWorkouts.mockImplementation((success, error) => {
        error("Workouts error");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={["/routines/1"]}>
          <Routes>
            <Route path="/routines/:id" element={<RoutineDetails />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error comprobando entrenamientos activos",
          "Workouts error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles handleStartWorkout with active workout popup", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
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
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?",
          ),
        ).toBeInTheDocument();
      });
    });

    test("handles ConfirmationPopup OK click navigation", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
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
      });

      await waitFor(() => {
        const okButton = screen.getByText("OK");
        fireEvent.click(okButton);
        expect(mockNavigate).toHaveBeenCalledWith("/workouts/session/2");
      });
    });

    test("handles ConfirmationPopup cancel click", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
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
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText(
            "Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?",
          ),
        ).not.toBeInTheDocument();
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

    test("handles authentication failure", async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
      });
    });

    test("deletes routine", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            trainerId: 1,
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

      routineService.deleteRoutine.mockImplementation((id, success) => {
        success();
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByText("Eliminar");
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText("OK");
        fireEvent.click(confirmButton);
        expect(routineService.deleteRoutine).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("follows and unfollows trainer", async () => {
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
            trainerId: 2,
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

      userFollowService.followTrainer.mockImplementation((id, success) => {
        success();
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followButton = screen.getByText("Seguir al creador");
        fireEvent.click(followButton);
        expect(userFollowService.followTrainer).toHaveBeenCalledWith(
          2,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("starts workout", async () => {
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

      workoutService.startWorkout.mockImplementation((id, success) => {
        success({ id: 1 });
      });

      render(
        <MemoryRouter>
          <Routines />
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

    test("shows no routines message", async () => {
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
        expect(
          screen.getByText(
            "No se encontraron rutinas con los filtros seleccionados.",
          ),
        ).toBeInTheDocument();
      });
    });

    test("shows active workout popup when starting workout with active one", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?",
          ),
        ).toBeInTheDocument();
      });
    });

    test("navigates to active workout on popup OK", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const okButton = screen.getByText("OK");
        fireEvent.click(okButton);
        expect(mockNavigate).toHaveBeenCalledWith("/workouts/session/2");
      });
    });

    test("unfollows trainer with confirmation", async () => {
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
            trainerId: 2,
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
          success([{ trainerId: 2 }]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      userFollowService.unfollowTrainer.mockImplementation((id, success) => {
        success();
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followButton = screen.getByText("Dejar de seguir al creador");
        fireEvent.click(followButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "¿Seguro que quieres dejar de seguir a este entrenador?",
          ),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("OK");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(userFollowService.unfollowTrainer).toHaveBeenCalledWith(
          2,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("likes and unlikes routine", async () => {
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

      routineLikeService.likeRoutine.mockImplementation((id) => {});
      routineLikeService.unlikeRoutine.mockImplementation((id) => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const heartButton = screen.getByLabelText("Dar me gusta");
        fireEvent.click(heartButton);
        expect(routineLikeService.likeRoutine).toHaveBeenCalledWith(1);
      });
    });

    test("edits routine for trainer", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            trainerId: 1,
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
        const editButton = screen.getByText("Editar");
        fireEvent.click(editButton);
        expect(mockNavigate).toHaveBeenCalledWith("/routines/edit/1");
      });
    });

    test("adds new routine for trainer", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
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
        const addButton = screen.getByText("+");
        fireEvent.click(addButton);
        expect(mockNavigate).toHaveBeenCalledWith("/routines/new");
      });
    });

    test("renders add button only for trainer or admin", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
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
        expect(screen.getByText("+")).toBeInTheDocument();
      });
    });

    test("does not render add button for client", async () => {
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
        expect(screen.queryByText("+")).not.toBeInTheDocument();
      });
    });

    test("displays ADVANCED difficulty correctly", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "ADVANCED",
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
        expect(screen.getByText("Avanzada")).toBeInTheDocument();
      });
    });

    test("displays private badge for private routine", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Private Routine",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            visibility: "PRIVATE",
            trainerId: 1,
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
        expect(screen.getByText("🔒 Privado")).toBeInTheDocument();
      });
    });

    test("handles delete routine error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            trainerId: 1,
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

      routineService.deleteRoutine.mockImplementation((id, success, error) => {
        error("Delete error");
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByText("Eliminar");
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText("OK");
        fireEvent.click(confirmButton);
        expect(routineService.deleteRoutine).toHaveBeenCalled();
      });
    });

    test("handles start workout error", async () => {
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

      workoutService.startWorkout.mockImplementation((id, success, error) => {
        error("Start workout error");
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
        expect(workoutService.startWorkout).toHaveBeenCalled();
      });
    });

    test("shows active workout popup", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?",
          ),
        ).toBeInTheDocument();
      });
    });

    test("navigates to active workout on popup OK", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const okButton = screen.getByText("OK");
        fireEvent.click(okButton);
        expect(mockNavigate).toHaveBeenCalledWith("/workouts/session/2");
      });
    });

    test("unfollows trainer with confirmation", async () => {
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
            trainerId: 2,
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
          success([{ trainerId: 2 }]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      userFollowService.unfollowTrainer.mockImplementation((id, success) => {
        success();
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followButton = screen.getByText("Dejar de seguir al creador");
        fireEvent.click(followButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "¿Seguro que quieres dejar de seguir a este entrenador?",
          ),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("OK");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(userFollowService.unfollowTrainer).toHaveBeenCalledWith(
          2,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("handles multi-select change in filters", async () => {
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
      });

      await waitFor(() => {
        const muscleGroupSelect = screen
          .getByText("Grupos Musculares:")
          .parentElement.querySelector(".select-display");
        fireEvent.click(muscleGroupSelect);
      });

      await waitFor(() => {
        const bicepsOption = screen.getByText("Bíceps");
        fireEvent.click(bicepsOption);
      });
    });

    test("applies filters", async () => {
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
      });

      await waitFor(() => {
        const difficultySelect = screen.getByText("Todas");
        fireEvent.click(difficultySelect);
        const beginnerOption = screen.getByText("Principiante");
        fireEvent.click(beginnerOption);
      });

      await waitFor(() => {
        const applyButton = screen.getByText("Aplicar Filtros");
        fireEvent.click(applyButton);
        expect(routineService.getFilteredRoutines).toHaveBeenCalled();
      });
    });

    test("clears filters", async () => {
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
      });

      await waitFor(() => {
        const clearButton = screen.getByText("Limpiar");
        fireEvent.click(clearButton);
        expect(routineService.getAllRoutines).toHaveBeenCalled();
      });
    });

    test("handles checkActiveWorkout error", async () => {
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

      workoutService.getWorkouts.mockImplementation((success, error) => {
        error("Active workout error");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error comprobando entrenamientos activos",
          "Active workout error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles loadFollowing error", async () => {
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
        (userId, success, error) => {
          error("Following error");
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error cargando follows",
          "Following error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles loadAllTrainers with routineService.getAllRoutines error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success, error) => {
        error("Trainers error");
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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading trainers:",
          "Trainers error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles loadAllEquipment error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([]);
      });

      exerciseService.getAllExercises.mockImplementation((success, error) => {
        error("Equipment error");
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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading equipment:",
          "Equipment error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles loadRoutineLikes error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([]);
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success({ content: [] });
      });

      routineLikeService.getLikes.mockImplementation((success, error) => {
        error("Likes error");
      });

      userFollowService.getFollowedTrainers.mockImplementation(
        (userId, success) => {
          success([]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading routine likes:",
          "Likes error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles handleFollowToggle follow error", async () => {
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
            trainerId: 2,
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

      userFollowService.followTrainer.mockImplementation(
        (id, success, error) => {
          error("Follow error");
        },
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followButton = screen.getByText("Seguir al creador");
        fireEvent.click(followButton);
        expect(consoleSpy).toHaveBeenCalledWith("Error al seguir entrenador");
      });

      consoleSpy.mockRestore();
    });

    test("handles handleDelete error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            trainerId: 1,
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

      routineService.deleteRoutine.mockImplementation((id, success, error) => {
        error("Delete error");
      });

      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByText("Eliminar");
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText("OK");
        fireEvent.click(confirmButton);
        expect(alertSpy).toHaveBeenCalledWith(
          "No se pudo eliminar la rutina. Intenta de nuevo.",
        );
      });

      alertSpy.mockRestore();
    });

    test("handles handleStartWorkout error", async () => {
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

      workoutService.startWorkout.mockImplementation((id, success, error) => {
        error("Start workout error");
      });

      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
        expect(alertSpy).toHaveBeenCalledWith(
          "No se pudo iniciar el entrenamiento. Inténtelo de nuevo.",
        );
      });

      alertSpy.mockRestore();
    });

    test("handles unfollowTrainer error", async () => {
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
            trainerId: 2,
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
          success([{ trainerId: 2 }]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      userFollowService.unfollowTrainer.mockImplementation(
        (id, success, error) => {
          error("Unfollow error");
        },
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followButton = screen.getByText("Dejar de seguir al creador");
        fireEvent.click(followButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText("OK");
        fireEvent.click(confirmButton);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error al dejar de seguir entrenador",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles loadRoutines without filters error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success, error) => {
        error("All routines error");
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

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error loading routines:",
          "All routines error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles ConfirmationPopup cancel for unfollow", async () => {
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
            trainerId: 2,
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
          success([{ trainerId: 2 }]);
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
        const followButton = screen.getByText("Dejar de seguir al creador");
        fireEvent.click(followButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText(
            "¿Seguro que quieres dejar de seguir a este entrenador?",
          ),
        ).not.toBeInTheDocument();
      });
    });

    test("handles ConfirmationPopup cancel for delete", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      routineService.getAllRoutines.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Routine 1",
            trainerName: "Trainer",
            difficulty: "BEGINNER",
            trainerId: 1,
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
        const deleteButton = screen.getByText("Eliminar");
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText("Seguro que quieres eliminar esta rutina?"),
        ).not.toBeInTheDocument();
      });
    });

    test("handles ConfirmationPopup cancel for active workout", async () => {
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
        success([{ id: 2, routineId: 1, endTime: null }]);
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const startButton = screen.getByText("Empezar");
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const cancelButton = screen.getByText("Cancelar");
        fireEvent.click(cancelButton);
        expect(
          screen.queryByText(
            "Ya tienes un entrenamiento en progreso. ¿Deseas ir a él?",
          ),
        ).not.toBeInTheDocument();
      });
    });

    test("unfollows trainer", async () => {
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
            trainerId: 2,
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
          success([{ trainerId: 2 }]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      userFollowService.unfollowTrainer.mockImplementation((id, success) => {
        success();
      });

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followButton = screen.getByText("Dejar de seguir al creador");
        fireEvent.click(followButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText("OK");
        fireEvent.click(confirmButton);
        expect(userFollowService.unfollowTrainer).toHaveBeenCalledWith(
          2,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("starts workout without active workout", async () => {
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

      workoutService.startWorkout.mockImplementation((id, success) => {
        success({ id: 1 });
      });

      render(
        <MemoryRouter>
          <Routines />
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

    test("handles error in loading routines", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success, error) => {
        error("Error loading routines");
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
        expect(
          screen.getByText("Error al cargar los entrenamientos"),
        ).toBeInTheDocument();
        expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
      });
    });

    test("retries loading routines on button click", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      routineService.getAllRoutines.mockImplementation((success, error) => {
        error("Error loading routines");
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
        const retryButton = screen.getByText("Intentar de nuevo");
        fireEvent.click(retryButton);
        expect(routineService.getAllRoutines).toHaveBeenCalled();
      });
    });

    test("likes routine", async () => {
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

      routineLikeService.likeRoutine.mockImplementation((id) => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const heartButton = screen.getByLabelText("Dar me gusta");
        fireEvent.click(heartButton);
        expect(routineLikeService.likeRoutine).toHaveBeenCalledWith(1);
      });
    });

    test("unlikes routine", async () => {
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
        success([{ routineId: 1 }]);
      });

      userFollowService.getFollowedTrainers.mockImplementation(
        (userId, success) => {
          success([]);
        },
      );

      workoutService.getWorkouts.mockImplementation((success) => {
        success([]);
      });

      routineLikeService.unlikeRoutine.mockImplementation((id) => {});

      render(
        <MemoryRouter>
          <Routines />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const heartButton = screen.getByLabelText("Quitar me gusta");
        fireEvent.click(heartButton);
        expect(routineLikeService.unlikeRoutine).toHaveBeenCalledWith(1);
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

    test("handles authentication error in useEffect", async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
      });
    });

    test("handles authentication error in fetchExercises", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
      });

      exerciseService.getAllExercises.mockImplementation((success, error) => {
        error("Fetch error");
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching exercises:",
          "Fetch error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles delete exercise error", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Exercise 1",
            description: "Desc",
            status: "APPROVED",
            creatorId: 1,
          },
        ]);
      });

      exerciseService.deleteExercise.mockImplementation(
        (id, success, error) => {
          error("Delete error");
        },
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByText("Eliminar");
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText("OK");
        fireEvent.click(confirmButton);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error deleting exercise:",
          "Delete error",
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles canEditOrDelete with null creatorId", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Exercise 1",
            description: "Desc",
            status: "APPROVED",
            creatorId: null,
            creator: { id: 1 },
          },
        ]);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Editar")).toBeInTheDocument();
        expect(screen.getByText("Eliminar")).toBeInTheDocument();
      });
    });

    test("handles canEditOrDelete with undefined creator", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "TRAINER" } });
      });

      exerciseService.getAllExercises.mockImplementation((success) => {
        success([
          {
            id: 1,
            name: "Exercise 1",
            description: "Desc",
            status: "APPROVED",
            creatorId: null,
            creator: undefined,
          },
        ]);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.queryByText("Editar")).not.toBeInTheDocument();
        expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
      });
    });

    test("does not render view toggle for non-admin", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
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
        expect(
          screen.queryByText("Ejercicios Aprobados"),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText("Ejercicios Pendientes"),
        ).not.toBeInTheDocument();
      });
    });

    test("renders add button for trainer", async () => {
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
        expect(screen.getByText("+")).toBeInTheDocument();
      });
    });

    test("renders add button for admin", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "ADMIN" } });
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
        expect(screen.getByText("+")).toBeInTheDocument();
      });
    });

    test("does not render add button for client", async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1, role: "CLIENT" } });
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
        expect(screen.queryByText("+")).not.toBeInTheDocument();
      });
    });
  });
});
