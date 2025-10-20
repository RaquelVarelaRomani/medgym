import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../modules/app/components/users/Login';
import Register from '../../modules/app/components/users/Register';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../backend/userService', () => ({
  login: jest.fn(),
  signUp: jest.fn(),
  tryLoginFromServiceToken: jest.fn(),
}));

import { login, signUp } from '../../backend/userService';

describe('Authentication Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Component', () => {
    test('renders login form correctly', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      expect(screen.getByText('Inicia sesión')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });

    test('handles successful login', async () => {
      login.mockImplementation((email, password, successCallback) => {
        successCallback({ user: { id: 1, email } });
      });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Correo electrónico'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Contraseña'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByText('Entrar'));

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith('test@example.com', 'password123', expect.any(Function), expect.any(Function));
        expect(mockNavigate).toHaveBeenCalledWith('/routines');
      });
    });

    test('displays error on login failure', async () => {
      login.mockImplementation((email, password, successCallback, errorCallback) => {
        errorCallback({ globalError: 'project.exceptions.IncorrectLoginException' });
      });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Correo electrónico'), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Contraseña'), {
        target: { value: 'wrongpass' },
      });
      fireEvent.click(screen.getByText('Entrar'));

      await waitFor(() => {
        expect(screen.getByText('Usuario o contraseña incorrectos.')).toBeInTheDocument();
      });
    });

    test('displays blocked user error', async () => {
      login.mockImplementation((email, password, successCallback, errorCallback) => {
        errorCallback({ globalError: 'project.exceptions.BlockedUserException' });
      });

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Correo electrónico'), {
        target: { value: 'blocked@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Contraseña'), {
        target: { value: 'password' },
      });
      fireEvent.click(screen.getByText('Entrar'));

      await waitFor(() => {
        expect(screen.getByText('Tu cuenta ha sido bloqueada.')).toBeInTheDocument();
      });
    });

    test('toggles password visibility', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const passwordInput = screen.getByLabelText('Contraseña');
      const toggleButton = passwordInput.nextElementSibling;

      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Register Component', () => {
    test('renders register form correctly', () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      expect(screen.getByText('Regístrate')).toBeInTheDocument();
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    test('handles successful registration', async () => {
      signUp.mockImplementation((user, successCallback) => {
        successCallback({ user });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '123456789' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            phoneNumber: '123456789',
            password: 'password123',
            role: 'CLIENT',
            status: 'ACTIVE',
          }),
          expect.any(Function),
          expect.any(Function)
        );
        expect(mockNavigate).toHaveBeenCalledWith('/routines');
      });
    });

    test('validates phone number', async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: 'invalid' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(screen.getByText('El número de teléfono no es válido. Debe contener entre 9 y 15 dígitos.')).toBeInTheDocument();
      });
    });

    test('validates password confirmation', async () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '123456789' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'different' } });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(screen.getByText('Las contraseñas no coinciden. Inténtelo de nuevo.')).toBeInTheDocument();
      });
    });

    test('displays registration error', async () => {
      signUp.mockImplementation((user, successCallback, errorCallback) => {
        errorCallback({ globalError: 'DuplicateInstanceException' });
      });

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '123456789' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(screen.getByText('El email o teléfono ya existe')).toBeInTheDocument();
      });
    });

    test('toggles password visibility', () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      const passwordInput = screen.getByLabelText('Contraseña');
      const toggleButton = passwordInput.nextElementSibling;

      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });
});
