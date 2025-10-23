import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Profile from "../../modules/app/components/users/Profile";
import EditProfile from "../../modules/app/components/users/EditProfile";

import {
  tryLoginFromServiceToken,
  updateProfile,
  changePassword,
} from "../../backend/userService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
  tryLoginFromServiceToken: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

describe("Profile Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Profile Component", () => {
    test("renders loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation(() => {});

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });

    test("renders profile data correctly when authenticated", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        role: "CLIENT",
        profilePicture: null,
      };

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("123456789")).toBeInTheDocument();
        expect(screen.getByText("Cliente")).toBeInTheDocument();
      });
    });

    test("renders default profile image when no profile picture", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        role: "CLIENT",
        profilePicture: null,
      };

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const img = screen.getByAltText("Foto por defecto");
        expect(img).toHaveAttribute("src", "./assets/default-profile.jpg");
      });
    });

    test("renders profile picture when available", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        role: "CLIENT",
        profilePicture: "base64encodedimage",
      };

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const img = screen.getByAltText("Foto de perfil");
        expect(img).toHaveAttribute(
          "src",
          "data:image/jpeg;base64,base64encodedimage",
        );
      });
    });

    test("navigates to edit profile on button click", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        role: "CLIENT",
        profilePicture: null,
      };

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Editar perfil"));
      expect(mockNavigate).toHaveBeenCalledWith("/users/profile/edit-profile");
    });

    test("navigates to change password on button click", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        role: "CLIENT",
        profilePicture: null,
      };

      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cambiar contraseña"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/users/profile/change-password",
      );
    });

    test("redirects to login on authentication failure", async () => {
      tryLoginFromServiceToken.mockImplementation(
        (successCallback, errorCallback) => {
          errorCallback();
        },
      );

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
      });
    });

    test("displays correct role strings", async () => {
      const roles = [
        { role: "CLIENT", expected: "Cliente" },
        { role: "TRAINER", expected: "Entrenador" },
        { role: "ADMIN", expected: "Administrador" },
        { role: "UNKNOWN", expected: "Indefinido" },
      ];

      for (const { role, expected } of roles) {
        const mockUser = {
          id: 1,
          name: "John",
          surname: "Doe",
          email: "john@example.com",
          phoneNumber: "123456789",
          role,
          profilePicture: null,
        };

        tryLoginFromServiceToken.mockImplementation((successCallback) => {
          successCallback({ user: mockUser });
        });

        render(
          <MemoryRouter key={role}>
            <Profile />
          </MemoryRouter>,
        );

        await waitFor(() => {
          expect(screen.getByText(expected)).toBeInTheDocument();
        });
      }
    });
  });

  describe("EditProfile Component - Profile Editing", () => {
    const mockUser = {
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john@example.com",
      phoneNumber: "123456789",
      role: "CLIENT",
      profilePicture: null,
    };

    test("renders edit profile form correctly", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Editar perfil")).toBeInTheDocument();
        expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
        expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
        expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
        expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
        expect(screen.getByText("Guardar")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });
    });

    test("loads user data into form fields", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(
          screen.getByDisplayValue("john@example.com"),
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("123456789")).toBeInTheDocument();
      });
    });

    test("handles successful profile update", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      updateProfile.mockImplementation((user, successCallback) => {
        successCallback();
      });

      render(
        <MemoryRouter>
          <EditProfile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "Jane" },
      });
      fireEvent.click(screen.getByText("Guardar"));
      fireEvent.click(screen.getByText("OK"));

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            name: "Jane",
            surname: "Doe",
            email: "john@example.com",
            phoneNumber: "123456789",
          }),
          expect.any(Function),
          expect.any(Function),
        );
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile");
      });
    });

    test("displays error on profile update failure", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      updateProfile.mockImplementation(
        (user, successCallback, errorCallback) => {
          errorCallback({
            response: { data: { globalError: "Email already exists" } },
          });
        },
      );

      render(
        <MemoryRouter>
          <EditProfile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });
    });

    test("navigates back to profile on cancel", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancelar"));
      expect(mockNavigate).toHaveBeenCalledWith("/users/profile");
    });
  });

  describe("EditProfile Component - Password Change", () => {
    const mockUser = {
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john@example.com",
      phoneNumber: "123456789",
      role: "CLIENT",
      profilePicture: null,
    };

    test("renders change password form correctly", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
        expect(screen.getByLabelText("Contraseña actual")).toBeInTheDocument();
        expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
        expect(
          screen.getByLabelText("Confirmar nueva contraseña"),
        ).toBeInTheDocument();
        expect(screen.getByText("Guardar")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });
    });

    test("handles successful password change", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      changePassword.mockImplementation(
        (id, oldPassword, newPassword, successCallback) => {
          successCallback();
        },
      );

      updateProfile.mockImplementation((user, successCallback) => {
        successCallback();
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText("Contraseña actual"), {
        target: { value: "oldpass123" },
      });
      fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
        target: { value: "newpass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
        target: { value: "newpass123" },
      });
      fireEvent.click(screen.getByText("Guardar"));
      fireEvent.click(screen.getByText("OK"));

      await waitFor(() => {
        expect(changePassword).toHaveBeenCalledWith(
          1,
          "oldpass123",
          "newpass123",
          expect.any(Function),
          expect.any(Function),
        );
        expect(updateProfile).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile");
      });
    });

    test("validates password confirmation mismatch", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText("Contraseña actual"), {
        target: { value: "oldpass123" },
      });
      fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
        target: { value: "newpass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
        target: { value: "differentpass" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Las contraseñas nuevas no coinciden. Inténtelo de nuevo.",
          ),
        ).toBeInTheDocument();
      });

      expect(changePassword).not.toHaveBeenCalled();
    });

    test("validates old password same as new password", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText("Contraseña actual"), {
        target: { value: "samepass123" },
      });
      fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
        target: { value: "samepass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
        target: { value: "samepass123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "La nueva contraseña no puede ser igual a la actual.",
          ),
        ).toBeInTheDocument();
      });

      expect(changePassword).not.toHaveBeenCalled();
    });

    test("displays error on incorrect old password", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      changePassword.mockImplementation(
        (id, oldPassword, newPassword, successCallback, errorCallback) => {
          errorCallback();
        },
      );

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText("Contraseña actual"), {
        target: { value: "wrongoldpass" },
      });
      fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
        target: { value: "newpass123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
        target: { value: "newpass123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña actual no es correcta"),
        ).toBeInTheDocument();
      });
    });

    test("prevents submission with empty password fields", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Guardar"));

      expect(changePassword).not.toHaveBeenCalled();
    });

    test("toggles password visibility", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      const oldPasswordInput = screen.getByLabelText("Contraseña actual");
      const newPasswordInput = screen.getByLabelText("Nueva contraseña");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirmar nueva contraseña",
      );

      expect(oldPasswordInput).toHaveAttribute("type", "password");
      expect(newPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      const toggleButtons = screen.getAllByText("👁");
      fireEvent.click(toggleButtons[0]);
      expect(oldPasswordInput).toHaveAttribute("type", "text");

      fireEvent.click(toggleButtons[1]);
      expect(newPasswordInput).toHaveAttribute("type", "text");

      fireEvent.click(toggleButtons[2]);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });

    test("navigates back to profile on cancel", async () => {
      tryLoginFromServiceToken.mockImplementation((successCallback) => {
        successCallback({ user: mockUser });
      });

      render(
        <MemoryRouter>
          <EditProfile isPasswordMode={true} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancelar"));
      expect(mockNavigate).toHaveBeenCalledWith("/users/profile");
    });
  });
});
