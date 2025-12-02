import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../../modules/app/components/users/Login";
import Register from "../../modules/app/components/users/Register";
import RequiresLogin from "../../modules/app/components/common/RequiresLogin";

import { login, signUp } from "../../backend/userService";
import { getServiceToken } from "../../backend/appFetch";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
  login: jest.fn(),
  signUp: jest.fn(),
  tryLoginFromServiceToken: jest.fn(),
}));

jest.mock("../../backend/appFetch", () => ({
  getServiceToken: jest.fn(),
}));

describe("Authentication Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Component", () => {
    test("renders login form correctly", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      expect(screen.getByText("Inicia sesión")).toBeInTheDocument();
      expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
      expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
      expect(screen.getByText("Entrar")).toBeInTheDocument();
    });

    test("handles successful login", async () => {
      login.mockImplementation((email, password, successCallback) => {
        successCallback({ user: { id: 1, email } });
      });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
          expect.any(Function),
          expect.any(Function),
        );
        expect(mockNavigate).toHaveBeenCalledWith("/workouts/feed");
      });
    });

    test("displays error on login failure", async () => {
      login.mockImplementation(
        (email, password, successCallback, errorCallback) => {
          errorCallback({
            body: { globalError: "project.exceptions.IncorrectLoginException" },
          });
        },
      );

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "wrong@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "wrongpass" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      await waitFor(() => {
        expect(
          screen.getByText("Usuario o contraseña incorrectos."),
        ).toBeInTheDocument();
      });
    });

    test("displays blocked user error", async () => {
      login.mockImplementation(
        (email, password, successCallback, errorCallback) => {
          errorCallback({
            body: { globalError: "project.exceptions.BlockedUserException" },
          });
        },
      );

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "blocked@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      await waitFor(() => {
        expect(
          screen.getByText("Tu cuenta está bloqueada."),
        ).toBeInTheDocument();
      });
    });

    test("toggles password visibility", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      const passwordInput = screen.getByLabelText("Contraseña");
      const toggleButton = passwordInput.nextElementSibling;

      expect(passwordInput).toHaveAttribute("type", "password");
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
    });

    test("prevents submission with empty email", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      expect(login).not.toHaveBeenCalled();
    });

    test("prevents submission with empty password", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "test@example.com" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      expect(login).not.toHaveBeenCalled();
    });

    test("prevents submission with invalid email format", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "invalid-email" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      expect(login).not.toHaveBeenCalled();
    });

    test("trims email on submission", async () => {
      login.mockImplementation((email, password, successCallback) => {
        successCallback({ user: { id: 1, email } });
      });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "  test@example.com  " },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Entrar"));

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
          expect.any(Function),
          expect.any(Function),
        );
      });
    });
  });

  describe("RequiresLogin Component", () => {
    test("renders when service token exists", () => {
      getServiceToken.mockReturnValue("mock-token");

      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<RequiresLogin />}>
              <Route index element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    test("redirects to /users/login when no service token exists", () => {
      getServiceToken.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<RequiresLogin />}>
              <Route index element={<div>Protected Content</div>} />
            </Route>
            <Route path="/users/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  describe("Register Component", () => {
    test("renders register form correctly", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      expect(screen.getByText("Regístrate")).toBeInTheDocument();
      expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
      expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
      expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
      expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
      expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    test("handles successful registration", async () => {
      signUp.mockImplementation((user, successCallback) => {
        successCallback({ user });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phoneNumber: "123456789",
            password: "password123",
            role: "CLIENT",
            status: "ACTIVE",
          }),
          expect.any(Function),
          expect.any(Function),
        );
        expect(mockNavigate).toHaveBeenCalledWith("/workouts/feed");
      });
    });

    test("validates phone number", async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "invalid" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "El número de teléfono no es válido. Debe contener entre 9 y 15 dígitos.",
          ),
        ).toBeInTheDocument();
      });
    });

    test("validates password confirmation", async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "different" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText("Las contraseñas no coinciden. Inténtelo de nuevo."),
        ).toBeInTheDocument();
      });
    });

    test("displays registration error", async () => {
      signUp.mockImplementation((user, successCallback, errorCallback) => {
        errorCallback({ globalError: "DuplicateInstanceException" });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText("El email o teléfono ya existe"),
        ).toBeInTheDocument();
      });
    });

    test("toggles password visibility", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      const passwordInput = screen.getByLabelText("Contraseña");
      const toggleButton = passwordInput.nextElementSibling;

      expect(passwordInput).toHaveAttribute("type", "password");
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
    });
    test("prevents submission with empty required fields", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with empty name", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with empty surname", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with empty email", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with empty phone number", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with empty password", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with empty confirm password", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("prevents submission with invalid email format", () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "invalid-email" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      expect(signUp).not.toHaveBeenCalled();
    });

    test("validates phone number with less than 9 digits", async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "12345678" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "El número de teléfono no es válido. Debe contener entre 9 y 15 dígitos.",
          ),
        ).toBeInTheDocument();
      });
    });

    test("validates phone number with more than 15 digits", async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "1234567890123456" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "El número de teléfono no es válido. Debe contener entre 9 y 15 dígitos.",
          ),
        ).toBeInTheDocument();
      });
    });

    test("validates phone number with non-numeric characters", async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123-456-789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "El número de teléfono no es válido. Debe contener entre 9 y 15 dígitos.",
          ),
        ).toBeInTheDocument();
      });
    });

    test("validates phone number with leading plus sign", async () => {
      signUp.mockImplementation((user, successCallback) => {
        successCallback({ user });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "+123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            phoneNumber: "+123456789",
          }),
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("validates password confirmation mismatch", async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "differentpassword" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText("Las contraseñas no coinciden. Inténtelo de nuevo."),
        ).toBeInTheDocument();
      });
    });

    test("trims name, surname, email, and phone number on submission", async () => {
      signUp.mockImplementation((user, successCallback) => {
        successCallback({ user });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "  John  " },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "  Doe  " },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "  john@example.com  " },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "  123456789  " },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(
        () => {
          expect(signUp).toHaveBeenCalledWith(
            expect.objectContaining({
              name: "John",
              surname: "Doe",
              email: "john@example.com",
              phoneNumber: "123456789",
            }),
            expect.any(Function),
            expect.any(Function),
          );
        },
        { timeout: 2000 },
      );
    });

    test("displays error on invalid email format from backend during registration", async () => {
      signUp.mockImplementation((user, successCallback, errorCallback) => {
        errorCallback({ globalError: "InvalidEmailFormatException" });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText("InvalidEmailFormatException"),
        ).toBeInTheDocument();
      });
    });

    test("displays error on password too weak from backend during registration", async () => {
      signUp.mockImplementation((user, successCallback, errorCallback) => {
        errorCallback({ globalError: "PasswordTooWeakException" });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "weak" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "weak" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(
          screen.getByText("PasswordTooWeakException"),
        ).toBeInTheDocument();
      });
    });

    test("displays error on network failure during registration", async () => {
      signUp.mockImplementation((user, successCallback, errorCallback) => {
        errorCallback({ globalError: "NetworkError" });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(screen.getByText("NetworkError")).toBeInTheDocument();
      });
    });

    test("displays error on malformed error response during registration", async () => {
      signUp.mockImplementation((user, successCallback, errorCallback) => {
        errorCallback({});
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Apellidos"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText("Correo electrónico"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Teléfono"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("Contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(screen.getByText("Error en el registro")).toBeInTheDocument();
      });
    });
  });
});
