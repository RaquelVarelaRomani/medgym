import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { logout, tryLoginFromServiceToken, getUser } from "../../../../backend/userService";
import Popup from "../common/popup/Popup";
import { getFollowedTrainers, getFollowers, followTrainer, unfollowTrainer } from "../../../../backend/userFollowService";

const Profile = () => {
    const { id } = useParams()
    const navigate = useNavigate();
    const [me, setMe] = useState(null)
    const [profile, setProfile] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [followers, setFollowers] = useState(0)
    const [following, setFollowing] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)

    useEffect(() => {
        getUser(id, (user) => setProfile(user));
        tryLoginFromServiceToken(
            (authenticatedUser) => setMe(authenticatedUser.user),
            () => navigate("/users/login")
        );
    }, [id, navigate]);

    useEffect(() => {
        if (!me || !profile) return;

        getFollowers(profile.id, (f) => setFollowers(f.length));
        
        getFollowedTrainers(profile.id, (trainers) => {
            setFollowing(trainers.length);
        });

        getFollowedTrainers(me.id,
            (trainers) => {
                const following = trainers.some(t => t.trainerId === profile.id);
                setIsFollowing(following);
            }
        )
    }, [me, profile, isFollowing]);

    const handleEditProfile = () => {
        navigate("/users/profile/edit-profile"); // Redirige a la página de editar perfil
    }

    const handleChangePassword = () => {
        navigate("/users/profile/change-password");
    }

    const handleFollowToggle = () => {
        if (!profile) return;

        if (isFollowing) {
            unfollowTrainer(profile.id,
                () => setIsFollowing(false),
                (err) => console.error(err)
            );
        } else {
            followTrainer(profile.id,
                () => setIsFollowing(true),
                (err) => console.error(err)
            );
        }
    };

    const roleString = () => {
        if (profile.role === "CLIENT") return "Cliente";
        if (profile.role === "TRAINER") return "Entrenador";
        if (profile.role === "ADMIN") return "Administrador";
        return "Indefinido";
    }

    return (
        <div className={styles.profile}>
            <div className={styles['profile-container']}>
                <div className={styles['profile-header']}>
                    <div className={styles['profile-info']}>
                        <div className={styles['profile-photo']}>
                            {profile?.profilePicture ? (
                                <img
                                    src={`data:image/jpeg;base64,${profile.profilePicture}`}
                                    alt="Foto de perfil"
                                    className={styles['profile-image']}
                                />
                            ) : (
                                <img
                                    src="./assets/default-profile.jpg"
                                    alt="Foto por defecto"
                                    className={styles['profile-image']}
                                />
                            )}
                        </div>
                        <div>
                            <h2 className={styles['profile-name']}>
                                {profile ? `${profile.name} ${profile.surname}` : "Cargando..."}
                            </h2>
                            <div className={styles['profile-info']}>
                                {profile && <p className={styles['follow-side']} onClick={() => navigate(`/users/followers/${profile.id}`)}>Seguidores: {followers}</p>}
                                {profile && <p className={styles['follow-side']} onClick={() => navigate(`/users/following/${profile.id}`)}>Siguiendo: {following}</p>}
                            </div>                      
                        </div> 

                    </div>
                
                    <div className={styles['profile-actions']}>
                        {me && profile && me.id === profile.id && (
                            <>
                                <button className={styles['edit-profile-button']} onClick={handleEditProfile}> Editar perfil </button>
                                <button className={styles['edit-profile-button']} onClick={handleChangePassword}> Cambiar contraseña </button>
                            </>
                        )}
                        {me && profile && me.id !== profile.id && (
                            <>
                                <button className={styles['edit-profile-button']} onClick={handleFollowToggle}>{isFollowing ? "Dejar de seguir" : "Seguir"}</button>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles['profile-data']}>
                    {profile ? (
                        <>
                            <p><strong>Correo electrónico:</strong> {profile.email}</p>
                            <p><strong>Teléfono:</strong> {profile.phoneNumber}</p>
                            <p><strong>Rol:</strong> {roleString()}</p>
                        </>
                    ) : (
                        <p>Cargando datos...</p>
                    )}
                </div>
                
            </div>

            <Popup text={"Sesión cerrada. ¡Vuelva pronto!"} show={showPopup} onOk={() => {
                setShowPopup(false);
                navigate("/users/login");
            }} />
        </div>
    );
};

export default Profile;
