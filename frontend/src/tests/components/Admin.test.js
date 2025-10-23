import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserModeration from "../../modules/app/components/users/UserModeration";
import Exercises from "../../modules/app/components/routines/Exercises";

import { tryLoginFromServiceToken } from "../../backend/userService";
import {
  getAllUsers,
  blockUser,
  unblockUser,
} from "../../backend/adminService";
import {
  getPendingExercises,
  getAllExercises,
  updateExerciseStatus,
} from "../../backend/exerciseService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
  tryLoginFromServiceToken: jest.fn(),
}));

jest.mock("../../backend/adminService", () => ({
  getAllUsers: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
}));

jest.mock("../../backend/exerciseService", () => ({
  getPendingExercises: jest.fn(),
  getAllExercises: jest.fn(),
  updateExerciseStatus: jest.fn(),
}));

jest.mock("../../modules/app/components/common/popup/ConfirmationPopup", () => {
  return function MockConfirmationPopup({ text, show, onOk, onCancel }) {
    if (!show) return null;
    return (
      <div data-testid="confirmation-popup">
        <p>{text}</p>
        <button onClick={onOk} data-testid="confirm-ok">
          OK
        </button>
        <button onClick={onCancel} data-testid="confirm-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

describe("Admin Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("UserModeration Component", () => {
    test("redirects to home if user is not admin", () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "CLIENT" } });
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("redirects to login if token is invalid", () => {
      tryLoginFromServiceToken.mockImplementation(
        (successCallback, errorCallback) => {
          errorCallback();
        },
      );

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      expect(mockNavigate).toHaveBeenCalledWith("/users/login");
    });

    test("renders loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation(() => {});

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando usuarios...")).toBeInTheDocument();
    });

    test("renders user list correctly for admin", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "TRAINER",
          status: "BLOCKED",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
        expect(screen.getByText("Total de usuarios: 2")).toBeInTheDocument();
      });
    });

    test("displays blocked users with different styling", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "BLOCKED",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const userCard = screen
          .getByText("John Doe")
          .closest('div[class*="user-card"]');
        expect(userCard).toHaveClass("blocked");
      });
    });

    test("filters users based on search term", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "TRAINER",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText(
          "Buscar por nombre, correo electrónico o usuario...",
        ),
        {
          target: { value: "john" },
        },
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
        expect(screen.getByText("Total de usuarios: 1")).toBeInTheDocument();
      });
    });

    test("shows no users message when filtered list is empty", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText(
          "Buscar por nombre, correo electrónico o usuario...",
        ),
        {
          target: { value: "nonexistent" },
        },
      );

      await waitFor(() => {
        expect(
          screen.getByText("No se encontraron usuarios"),
        ).toBeInTheDocument();
      });
    });

    test("handles block user confirmation and success", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      blockUser.mockImplementation((userId, successCallback) => {
        successCallback();
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Bloquear")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Bloquear"));

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-popup")).toBeInTheDocument();
        expect(
          screen.getByText("¿Estás seguro de que quieres bloquear a John Doe?"),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("confirm-ok"));

      await waitFor(() => {
        expect(blockUser).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
        expect(getAllUsers).toHaveBeenCalledTimes(2);
      });
    });

    test("handles block user error", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      blockUser.mockImplementation((userId, successCallback, errorCallback) => {
        errorCallback("Block failed");
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bloquear"));
      });

      fireEvent.click(screen.getByTestId("confirm-ok"));

      await waitFor(() => {
        expect(blockUser).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
        expect(
          screen.queryByTestId("confirmation-popup"),
        ).not.toBeInTheDocument();
      });
    });

    test("handles unblock user confirmation and success", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "BLOCKED",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      unblockUser.mockImplementation((userId, successCallback) => {
        successCallback();
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Desbloquear")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Desbloquear"));

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-popup")).toBeInTheDocument();
        expect(
          screen.getByText(
            "¿Estás seguro de que quieres desbloquear a John Doe?",
          ),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("confirm-ok"));

      await waitFor(() => {
        expect(unblockUser).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
        expect(getAllUsers).toHaveBeenCalledTimes(2);
      });
    });

    test("cancels block confirmation", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bloquear"));
      });

      fireEvent.click(screen.getByTestId("confirm-cancel"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-popup"),
        ).not.toBeInTheDocument();
        expect(blockUser).not.toHaveBeenCalled();
      });
    });

    test("disables block button for admin users", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "ADMIN",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const blockButton = screen.getByText("Admin");
        expect(blockButton).toBeDisabled();
      });
    });

    test("handles getAllUsers error", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback, errorCallback) => {
        errorCallback("Fetch failed");
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
        expect(screen.getByText("Total de usuarios: 0")).toBeInTheDocument();
      });
    });

    test("shows userName fallback when name is not available", async () => {
      const mockUsers = [
        {
          id: 1,
          userName: "johndoe",
          email: "john@example.com",
          role: "CLIENT",
          status: "ACTIVE",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllUsers.mockImplementation((successCallback) => {
        successCallback(mockUsers);
      });

      render(
        <MemoryRouter>
          <UserModeration />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("johndoe")).toBeInTheDocument();
      });
    });
  });

  describe("Exercises Component - Admin Approval Features", () => {
    test("shows approval buttons only for admins in pending view", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Approved Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      const mockPendingExercises = [
        {
          id: 2,
          name: "Push Up",
          description: "Basic exercise",
          status: "PENDING",
          creatorId: 3,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation((successCallback) => {
        successCallback(mockPendingExercises);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Ejercicios Pendientes")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        expect(screen.getByText("Aprobar")).toBeInTheDocument();
        expect(screen.getByText("Rechazar")).toBeInTheDocument();
      });
    });

    test("does not show approval buttons for non-admins", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "TRAINER" } });
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.queryByText("Ejercicios Pendientes"),
        ).not.toBeInTheDocument();
      });
    });

    test("handles approve exercise success", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Approved Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      const mockPendingExercises = [
        {
          id: 2,
          name: "Push Up",
          description: "Basic exercise",
          status: "PENDING",
          creatorId: 3,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation((successCallback) => {
        successCallback(mockPendingExercises);
      });

      updateExerciseStatus.mockImplementation((id, status, successCallback) => {
        successCallback();
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Aprobar"));
      });

      await waitFor(() => {
        expect(updateExerciseStatus).toHaveBeenCalledWith(
          2,
          "APPROVED",
          expect.any(Function),
          expect.any(Function),
        );
        expect(getPendingExercises).toHaveBeenCalledTimes(2);
      });
    });

    test("handles approve exercise error", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Approved Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      const mockPendingExercises = [
        {
          id: 2,
          name: "Push Up",
          description: "Basic exercise",
          status: "PENDING",
          creatorId: 3,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation((successCallback) => {
        successCallback(mockPendingExercises);
      });

      updateExerciseStatus.mockImplementation(
        (id, status, successCallback, errorCallback) => {
          errorCallback("Approve failed");
        },
      );

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Aprobar"));
      });

      await waitFor(() => {
        expect(updateExerciseStatus).toHaveBeenCalledWith(
          2,
          "APPROVED",
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("handles reject exercise confirmation and success", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Approved Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      const mockPendingExercises = [
        {
          id: 2,
          name: "Push Up",
          description: "Basic exercise",
          status: "PENDING",
          creatorId: 3,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation((successCallback) => {
        successCallback(mockPendingExercises);
      });

      updateExerciseStatus.mockImplementation((id, status, successCallback) => {
        successCallback();
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Rechazar"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-popup")).toBeInTheDocument();
        expect(
          screen.getByText("¿Seguro que quieres rechazar este ejercicio?"),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("confirm-ok"));

      await waitFor(() => {
        expect(updateExerciseStatus).toHaveBeenCalledWith(
          2,
          "REJECTED",
          expect.any(Function),
          expect.any(Function),
        );
        expect(getPendingExercises).toHaveBeenCalledTimes(2);
      });
    });

    test("cancels reject exercise confirmation", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Approved Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      const mockPendingExercises = [
        {
          id: 2,
          name: "Push Up",
          description: "Basic exercise",
          status: "PENDING",
          creatorId: 3,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation((successCallback) => {
        successCallback(mockPendingExercises);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Rechazar"));
      });

      fireEvent.click(screen.getByTestId("confirm-cancel"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-popup"),
        ).not.toBeInTheDocument();
        expect(updateExerciseStatus).not.toHaveBeenCalled();
      });
    });

    test("handles getPendingExercises error", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Approved Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation(
        (successCallback, errorCallback) => {
          errorCallback("Fetch failed");
        },
      );

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        expect(screen.getByText("Ejercicios Pendientes")).toBeInTheDocument();
      });
    });

    test("switches between approved and pending views", async () => {
      const mockApprovedExercises = [
        {
          id: 1,
          name: "Push Up",
          description: "Basic exercise",
          status: "APPROVED",
          creatorId: 2,
        },
      ];

      const mockPendingExercises = [
        {
          id: 2,
          name: "Pull Up",
          description: "Advanced exercise",
          status: "PENDING",
          creatorId: 3,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: { id: 1, role: "ADMIN" } });
      });

      getAllExercises.mockImplementation((successCallback) => {
        successCallback(mockApprovedExercises);
      });

      getPendingExercises.mockImplementation((successCallback) => {
        successCallback(mockPendingExercises);
      });

      render(
        <MemoryRouter>
          <Exercises />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Push Up")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Ejercicios Pendientes"));

      await waitFor(() => {
        expect(screen.getByText("Pull Up")).toBeInTheDocument();
        expect(screen.queryByText("Push Up")).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Ejercicios Aprobados"));

      await waitFor(() => {
        expect(screen.getByText("Push Up")).toBeInTheDocument();
        expect(screen.queryByText("Pull Up")).not.toBeInTheDocument();
      });
    });
  });
});
