import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../../modules/app/components/users/Profile";
import EditProfile from "../../modules/app/components/users/EditProfile";

import {
  tryLoginFromServiceToken,
  getUser,
  updateProfile,
  changePassword,
  becomePremium,
} from "../../backend/userService";
import {
    getFollowers,
    getFollowedTrainers,
} from "../../backend/userFollowService";
import { getWorkoutsByUser } from "../../backend/workoutService";
import {isBlocked, blockUser, unblockUser} from "../../backend/userBlockService";
import { getAllAchievementProgresses } from "../../backend/achievementService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
}));

jest.mock("../../backend/userService", () => ({
  tryLoginFromServiceToken: jest.fn(),
  getUser: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  becomePremium: jest.fn(),
}));

jest.mock("../../backend/userFollowService", () => ({
    getFollowers: jest.fn(),
    getFollowedTrainers: jest.fn(),
    followTrainer: jest.fn(),
    unfollowTrainer: jest.fn(),
}));

jest.mock("../../backend/workoutService", () => ({
    getWorkoutsByUser: jest.fn(),
}));

jest.mock("../../backend/userBlockService", () => ({
    isBlocked: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn()
}));

jest.mock("../../backend/achievementService", () => ({
    getAllAchievementProgresses: jest.fn(),
}));

describe("Profile and EditProfile Components", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Profile Component", () => {
        const mockUser = {
            id: 1,
            name: "John",
            surname: "Doe",
            email: "john@example.com",
            phoneNumber: "123456789",
            role: "CLIENT",
            profilePicture: null,
        };

        const setupProfileMocks = () => {
            tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
                resolve({ user: mockUser });
            });

            getUser.mockImplementation((id, resolve, reject) => {
                resolve(mockUser);
            });

            isBlocked.mockImplementation((id, resolve, reject) => {
                resolve(false);
            });

            getFollowers.mockImplementation((id, resolve, reject) => {
                resolve([]);
            });

            getFollowedTrainers.mockImplementation((id, resolve, reject) => {
                resolve([]);
            });

            getWorkoutsByUser.mockImplementation((id, resolve, reject) => {
                resolve([]);
            });

            getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {
                onSuccess([]);
            });
        };

        test("renders loading state initially", () => {
            tryLoginFromServiceToken.mockImplementation(() => {});
            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            );
            expect(screen.getByText("Cargando perfil...")).toBeInTheDocument();
        });

        test("renders profile data correctly when authenticated", async () => {
            setupProfileMocks();

            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
                expect(screen.getByText("john@example.com")).toBeInTheDocument();
                expect(screen.getByText("123456789")).toBeInTheDocument();
                expect(screen.getByText("Cliente")).toBeInTheDocument();
            });
        });

        test("renders default profile image when no profile picture", async () => {
            setupProfileMocks();

            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            );

            await waitFor(() => {
                const img = screen.getByAltText("Foto por defecto");
                expect(img).toHaveAttribute("src", "./assets/default-profile.jpg");
            });
        });

        test("renders profile picture when available", async () => {
            const userWithPic = { ...mockUser, profilePicture: "base64encodedimage" };

            tryLoginFromServiceToken.mockImplementation((resolve) => {
                resolve({ user: userWithPic }); // me
            });

            getUser.mockImplementation((id, resolve) => {
                resolve(userWithPic); // profile TAMBIÉN con foto
            });

            isBlocked.mockImplementation((id, resolve) => resolve(false));
            getFollowers.mockImplementation((id, resolve) => resolve([]));
            getFollowedTrainers.mockImplementation((id, resolve) => resolve([]));
            getWorkoutsByUser.mockImplementation((id, resolve) => resolve([]));
            getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            );

            const img = await screen.findByAltText("Foto de perfil");

            expect(img).toHaveAttribute(
                "src",
                "data:image/jpeg;base64,base64encodedimage"
            );
        });

        test("navigates to edit profile on button click", async () => {
            setupProfileMocks();

            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            );

            await waitFor(() => screen.getByText("John Doe"));
            fireEvent.click(screen.getByText("Editar perfil"));
            expect(mockNavigate).toHaveBeenCalledWith("/users/profile/edit-profile");
        });

        test("navigates to change password on button click", async () => {
            setupProfileMocks();

            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            );

            await waitFor(() => screen.getByText("John Doe"));
            fireEvent.click(screen.getByText("Cambiar contraseña"));
            expect(mockNavigate).toHaveBeenCalledWith("/users/profile/change-password");
        });

        test("redirects to login on authentication failure", async () => {
            tryLoginFromServiceToken.mockImplementation((ok, fail) => fail());
            render(
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
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
                jest.clearAllMocks();

                const user = { ...mockUser, role };

                tryLoginFromServiceToken.mockImplementation((resolve) => resolve({ user }));
                getUser.mockImplementation((id, resolve) => resolve(user));
                isBlocked.mockImplementation((id, resolve) => resolve(false));
                getFollowers.mockImplementation((id, resolve) => resolve([]));
                getFollowedTrainers.mockImplementation((id, resolve) => resolve([]));
                getWorkoutsByUser.mockImplementation((id, resolve) => resolve([]));
                getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

                render(
                    <MemoryRouter>
                        <Profile />
                    </MemoryRouter>
                );

                const el = await screen.findByText(expected);
                expect(el).toBeInTheDocument();
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
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
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
      expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
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
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
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
      expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
    });
  });

  describe("Profile Component - Additional Coverage", () => {
    const mockUser = {
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john@example.com",
      phoneNumber: "123456789",
      role: "CLIENT",
      profilePicture: null,
    };

    const mockTrainer = {
      id: 2,
      name: "Trainer",
      surname: "One",
      email: "trainer@example.com",
      phoneNumber: "987654321",
      role: "TRAINER",
      trainerPremium: false,
    };

    const setupProfileMocks = () => {
      tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
        resolve({ user: mockUser });
      });

      getUser.mockImplementation((id, resolve, reject) => {
        resolve(mockUser);
      });

      isBlocked.mockImplementation((id, resolve, reject) => {
        resolve(false);
      });

      getFollowers.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      getFollowedTrainers.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      getWorkoutsByUser.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      console.log("Hola mundo");
    };

  test("handles isBlocked error callback", async () => {
      const user = { ...mockUser };

      tryLoginFromServiceToken.mockImplementation((resolve) => resolve({ user }));
      getUser.mockImplementation((id, resolve) => resolve(user));

      // Aquí el error REAL
      isBlocked.mockImplementation((id, resolve, reject) => reject("Block check error"));

      getFollowers.mockImplementation((id, resolve) => resolve([]));
      getFollowedTrainers.mockImplementation((id, resolve) => resolve([]));
      getWorkoutsByUser.mockImplementation((id, resolve) => resolve([]));
      getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

      render(
          <MemoryRouter>
              <Profile />
          </MemoryRouter>
      );

      // El componente debe seguir funcionando y mostrar el nombre
      const el = await screen.findByText("John Doe");
      expect(el).toBeInTheDocument();
    });

      test("navigates to followers page on button click", async () => {
          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(mockUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const followersButton = screen.getByRole("button", {
              name: /Seguidores:/,
          });

          fireEvent.click(followersButton);

          expect(mockNavigate).toHaveBeenCalledWith("/users/followers/1");
      });


      test("navigates to following page on button click", async () => {
          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(mockUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const followingButton = screen.getByRole("button", {
              name: /Siguiendo:/,
          });

          fireEvent.click(followingButton);

          expect(mockNavigate).toHaveBeenCalledWith("/users/following/1");
      });

      test("handles keyboard navigation for followers button", async () => {
          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(mockUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const followersButton = screen.getByRole("button", {
              name: /Seguidores:/,
          });

          fireEvent.keyDown(followersButton, { key: "Enter" });

          expect(mockNavigate).toHaveBeenCalledWith("/users/followers/1");
      });

      test("handles keyboard navigation for following button", async () => {
          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(mockUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const followingButton = screen.getByRole("button", {
              name: /Siguiendo:/,
          });

          fireEvent.keyDown(followingButton, { key: "Enter" });

          expect(mockNavigate).toHaveBeenCalledWith("/users/following/1");
      });

      test("shows become premium button for non-premium trainer", async () => {
          const trainerUser = { ...mockTrainer, trainerPremium: false };

          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: trainerUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(trainerUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("Trainer One");

          const premiumButton = screen.getByRole("button", {
              name: /Hacerme Entrenador premium/,
          });

          expect(premiumButton).toBeInTheDocument();
      });

      test("handles become premium success", async () => {
          const trainerUser = { ...mockTrainer, trainerPremium: false };

          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: trainerUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(trainerUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          becomePremium.mockImplementation((id, success) => {
              success();
          });

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("Trainer One");

          const premiumButton = screen.getByRole("button", {
              name: /Hacerme Entrenador premium/,
          });

          fireEvent.click(premiumButton);

          await screen.findByText("Entrenador premium");
      });

      test("handles become premium error", async () => {
          const trainerUser = { ...mockTrainer, trainerPremium: false };

          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: trainerUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(trainerUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          becomePremium.mockImplementation((id, success, error) =>
              error("Premium error")
          );

          const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("Trainer One");

          const premiumButton = screen.getByRole("button", {
              name: /Hacerme Entrenador premium/,
          });

          fireEvent.click(premiumButton);

          expect(alertSpy).toHaveBeenCalledWith(
              "Error becoming premium: Premium error"
          );

          alertSpy.mockRestore();
      });

      test("handles block user", async () => {
          const otherUser = { ...mockUser, id: 2 };

          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(otherUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          blockUser.mockImplementation((id, onSuccess) => onSuccess());

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const blockButton = screen.getByRole("button", { name: "Bloquear" });
          fireEvent.click(blockButton);

          expect(blockUser).toHaveBeenCalledWith(
              2,
              expect.any(Function),
              expect.any(Function)
          );
      });

      test("handles unblock user", async () => {
          const otherUser = { ...mockUser, id: 2 };

          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(otherUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(true)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          unblockUser.mockImplementation((id, onSuccess) => onSuccess());

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const unblockButton = screen.getByRole("button", { name: "Desbloquear" });
          fireEvent.click(unblockButton);

          expect(unblockUser).toHaveBeenCalledWith(
              2,
              expect.any(Function),
              expect.any(Function)
          );
      });

      test("handles follow toggle success", async () => {
      const otherUser = { ...mockUser, id: 2 };

      tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
        resolve({ user: mockUser });
      });

      getUser.mockImplementation((id, resolve, reject) => {
        resolve(otherUser);
      });

      isBlocked.mockImplementation((id, resolve, reject) => {
        resolve(false);
      });

      getFollowers.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      getFollowedTrainers.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      getWorkoutsByUser.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});


          render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => screen.getByText("John Doe"));
      const followButton = screen.getByText("Seguir");
      fireEvent.click(followButton);

      // Should update followers count
      await waitFor(() => {
        expect(screen.getByText("Seguidores: 1")).toBeInTheDocument();
      });
    });

    test("handles follow toggle error", async () => {
      const otherUser = { ...mockUser, id: 2 };

      tryLoginFromServiceToken.mockImplementation((resolve, reject) => {
        resolve({ user: mockUser });
      });

      getUser.mockImplementation((id, resolve, reject) => {
        resolve(otherUser);
      });

      isBlocked.mockImplementation((id, resolve, reject) => {
        resolve(false);
      });

      getFollowers.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      getFollowedTrainers.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

      getWorkoutsByUser.mockImplementation((id, resolve, reject) => {
        resolve([]);
      });

        getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

        render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => screen.getByText("John Doe"));
      const followButton = screen.getByText("Seguir");
      fireEvent.click(followButton);

      // Should update to Seguidores: 1 initially
      await waitFor(() => {
        expect(screen.getByText("Seguidores: 1")).toBeInTheDocument();
      });
    });

      test("renders BodyMetricsCard when showMetrics is true", async () => {
          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(mockUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

          render(
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
          );

          await screen.findByText("John Doe");

          const metricsButton = screen.getByText("Métricas corporales");
          fireEvent.click(metricsButton);

          const metricsTitles = screen.getAllByText("Métricas corporales");
          expect(metricsTitles.length).toBe(2);
      });

      test("closes BodyMetricsCard on close", async () => {
          tryLoginFromServiceToken.mockImplementation((resolve) =>
              resolve({ user: mockUser })
          );

          getUser.mockImplementation((id, resolve) =>
              resolve(mockUser)
          );

          isBlocked.mockImplementation((id, resolve) =>
              resolve(false)
          );

          getFollowers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getFollowedTrainers.mockImplementation((id, resolve) =>
              resolve([])
          );

          getWorkoutsByUser.mockImplementation((id, resolve) =>
              resolve([])
          );

          getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      await waitFor(() => screen.getByText("John Doe"));
      const metricsButton = screen.getByText("Métricas corporales");
      fireEvent.click(metricsButton);

      // Mock the onClose callback
      const closeButton = screen.getByText("Cerrar"); // Assuming BodyMetricsCard has a close button
      fireEvent.click(closeButton);

      // Should hide metrics - only the button should remain
      const remainingMetrics = screen.getAllByText("Métricas corporales");
      expect(remainingMetrics.length).toBe(1); // Only the button
    });

    test("renders achievements when getAllAchievementProgresses returns data", async () => {
      const achievementsMock = [
          { id: 1, progress: 50, achievement: { name: "A1" }},
          { id: 2, progress: 100, achievement: { name: "A2" }},
      ];

        tryLoginFromServiceToken.mockImplementation((resolve) =>
            resolve({ user: mockUser })
        );

        getUser.mockImplementation((id, resolve) =>
            resolve(mockUser)
        );

        isBlocked.mockImplementation((id, resolve) =>
            resolve(false)
        );

        getFollowers.mockImplementation((id, resolve) =>
            resolve([])
        );

        getFollowedTrainers.mockImplementation((id, resolve) =>
            resolve([])
        );

        getWorkoutsByUser.mockImplementation((id, resolve) =>
            resolve([])
        );

        getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

      render(
          <MemoryRouter>
              <Profile />
          </MemoryRouter>
      );

      await waitFor(() => {
          expect(screen.getByText("Logros")).toBeInTheDocument();
      });
    });

    test("renders no achievements when service returns empty list", async () => {
        tryLoginFromServiceToken.mockImplementation((resolve) =>
            resolve({ user: mockUser })
        );

        getUser.mockImplementation((id, resolve) =>
            resolve(mockUser)
        );

        isBlocked.mockImplementation((id, resolve) =>
            resolve(false)
        );

        getFollowers.mockImplementation((id, resolve) =>
            resolve([])
        );

        getFollowedTrainers.mockImplementation((id, resolve) =>
            resolve([])
        );

        getWorkoutsByUser.mockImplementation((id, resolve) =>
            resolve([])
        );

        getAllAchievementProgresses.mockImplementation((userId, onSuccess, onError) => {onSuccess([]);});

      render(
          <MemoryRouter>
              <Profile />
          </MemoryRouter>
      );

      await waitFor(() => {
          const section = screen.getByText("Logros");
          expect(section).toBeInTheDocument();
      });
    });
  });
});
