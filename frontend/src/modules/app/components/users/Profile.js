import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./Profile.module.css";
import { useNavigate, useParams } from "react-router-dom";
import {
    tryLoginFromServiceToken,
    getUser,
    becomePremium
} from "../../../../backend/userService";
import Popup from "../common/popup/Popup";
import {
    getFollowedTrainers,
    getFollowers,
    followTrainer,
    unfollowTrainer
} from "../../../../backend/userFollowService";
import UserWorkoutHistory from "../workouts/UserWorkoutHistory";
import BodyMetricsCard from "./BodyMetricsCard";
import LoadingMessage from "../common/LoadingMessage";
import { isBlocked, blockUser, unblockUser } from "../../../../backend/userBlockService";

function ProfileHeader({
                           profile,
                           me,
                           followers,
                           following,
                           loading,
                           loadingFollow,
                           isFollowing,
                           isBlockedByMe,
                           setShowMetrics,
                           handleFollowToggle,
                           handleBlockToggle,
                           handleEditProfile,
                           handleChangePassword,
                           handleBecomePremium,
                           navigate
                       }) {
    const showSelfActions = me && profile && me.id === profile.id;
    const showOtherActions = me && profile && me.id !== profile.id;

    return (
        <div className={styles["profile-header"]}>
            <div className={styles["profile-info"]}>
                <div className={styles["profile-photo"]}>
                    {profile?.profilePicture ? (
                        <img
                            src={`data:image/jpeg;base64,${profile.profilePicture}`}
                            alt="Foto de perfil"
                            className={styles["profile-image"]}
                        />
                    ) : (
                        <img
                            src="./assets/default-profile.jpg"
                            alt="Foto por defecto"
                            className={styles["profile-image"]}
                        />
                    )}
                </div>

                <div>
                    <h2 className={styles["profile-name"]}>
                        {profile ? `${profile.name} ${profile.surname}` : "Cargando..."}
                        {profile &&
                            profile.role === "TRAINER" &&
                            profile.trainerPremium && (
                                <span className={styles["premium-badge"]}>
                                    Entrenador premium
                                </span>
                            )}
                    </h2>

                    {!loading && (
                        <div className={styles["profile-info"]}>
                            <button
                                type="button"
                                className={styles["follow-side"]}
                                onClick={() => navigate(`/users/followers/${profile.id}`)}
                                onKeyDown={(e) => e.key === "Enter" && navigate(`/users/followers/${profile.id}`)}
                            >
                                Seguidores: {followers}
                            </button>
                            <button
                                type="button"
                                className={styles["follow-side"]}
                                onClick={() => navigate(`/users/following/${profile.id}`)}
                                onKeyDown={(e) => e.key === "Enter" && navigate(`/users/following/${profile.id}`)}
                            >
                                Siguiendo: {following}
                            </button>

                        </div>
                    )}
                </div>
            </div>

            <div className={styles["profile-actions"]}>
                {showSelfActions && (
                    <>
                        <button
                            className={styles["edit-profile-button"]}
                            onClick={handleEditProfile}
                        >
                            Editar perfil
                        </button>

                        <button
                            className={styles["edit-profile-button"]}
                            onClick={handleChangePassword}
                        >
                            Cambiar contraseña
                        </button>

                        <button
                            className={styles["edit-profile-button"]}
                            onClick={() => setShowMetrics(true)}
                        >
                            Métricas corporales
                        </button>

                        {me.role === "TRAINER" && !me.trainerPremium && (
                            <button
                                className={styles["premium-button"]}
                                onClick={handleBecomePremium}
                            >
                                Hacerme Entrenador premium
                            </button>
                        )}
                    </>
                )}

                {showOtherActions && (
                    <>
                        <button
                            className={styles["edit-profile-button"]}
                            onClick={handleFollowToggle}
                            disabled={loadingFollow}
                        >
                            {loadingFollow
                                ? "Cargando..."
                                : isFollowing
                                    ? "Dejar de seguir"
                                    : "Seguir"}
                        </button>

                        <button
                            className={styles["edit-profile-button"]}
                            onClick={handleBlockToggle}
                        >
                            {isBlockedByMe ? "Desbloquear" : "Bloquear"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function ProfileData({ profile, roleString }) {
    if (!profile)
        return <p>Cargando datos...</p>;

    return (
        <div className={styles["profile-data"]}>
            <p><strong>Correo electrónico:</strong> {profile.email}</p>
            <p><strong>Teléfono:</strong> {profile.phoneNumber}</p>
            <p><strong>Rol:</strong> {roleString()}</p>

            <p><strong>Peso:</strong> {profile.weightKg ?? "—"} kg</p>
            <p><strong>Altura:</strong> {profile.heightCm ?? "—"} cm</p>
            <p><strong>Género:</strong> {profile.gender ?? "—"}</p>
            <p><strong>IMC:</strong> {profile.bmi ?? "—"}</p>
        </div>
    );
}

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [me, setMe] = useState(null);
    const [profile, setProfile] = useState(null);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);

    const [showMetrics, setShowMetrics] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let meTemp = null;
        let profileTemp = null;

        tryLoginFromServiceToken(
            (auth) => {
                meTemp = auth.user;
                setMe(meTemp);

                getUser(id, (user) => {
                    profileTemp = user;
                    setProfile(profileTemp);

                    isBlocked(
                        profileTemp.id,
                        (blocked) => setIsBlockedByMe(blocked),
                        () => setIsBlockedByMe(false)
                    );

                    Promise.all([
                        new Promise((resolve) =>
                            getFollowers(profileTemp.id, (f) => {
                                setFollowers(f.length);
                                resolve();
                            })
                        ),
                        new Promise((resolve) =>
                            getFollowedTrainers(profileTemp.id, (t) => {
                                setFollowing(t.length);
                                resolve();
                            })
                        ),
                        new Promise((resolve) =>
                            getFollowedTrainers(meTemp.id, (trainers) => {
                                setIsFollowing(
                                    trainers.some(
                                        (t) =>
                                            t.trainerId === profileTemp.id
                                    )
                                );
                                resolve();
                            })
                        )
                    ]).then(() => setLoading(false));
                });
            },
            () => navigate("/users/login")
        );
    }, [id, navigate]);


    useEffect(() => {
        const onFollowChange = () => {
            if (!profile || !me) return;

            getFollowers(profile.id, (f) => setFollowers(f.length));
            getFollowedTrainers(profile.id, (t) => setFollowing(t.length));
            getFollowedTrainers(me.id, (trainers) =>
                setIsFollowing(
                    trainers.some((t) => t.trainerId === profile.id)
                )
            );
        };

        window.addEventListener("followChanged", onFollowChange);
        return () => window.removeEventListener("followChanged", onFollowChange);
    }, [profile, me]);


    const handleEditProfile = () => navigate("/users/profile/edit-profile");
    const handleChangePassword = () =>
        navigate("/users/profile/change-password");

    const handleBecomePremium = () => {
        becomePremium(
            me.id,
            () => {
                setMe((p) => ({ ...p, trainerPremium: true }));
                setProfile((p) => ({ ...p, trainerPremium: true }));
            },
            (err) => alert("Error becoming premium: " + err)
        );
    };

    const handleBlockToggle = () => {
        if (!profile) return;

        if (isBlockedByMe) {
            unblockUser(
                profile.id,
                () => setIsBlockedByMe(false),
                (err) => console.error("Error desbloqueando:", err)
            );
            return;
        }

        blockUser(
            profile.id,
            () => {
                setIsBlockedByMe(true);
                setIsFollowing(false);
            },
            (err) => console.error("Error bloqueando:", err)
        );
    };

    const handleFollowToggle = () => {
        if (!profile || loadingFollow) return;

        setLoadingFollow(true);

        const next = !isFollowing;

        setIsFollowing(next);
        setFollowers((n) => n + (next ? 1 : -1));

        const action = next ? followTrainer : unfollowTrainer;

        action(
            profile.id,
            () => {
                window.dispatchEvent(new Event("followChanged"));
                setTimeout(() => setLoadingFollow(false), 500);
            },
            (err) => {
                console.error(err);
                setIsFollowing(!next);
                setFollowers((n) => n - (next ? 1 : -1));
                setLoadingFollow(false);
            }
        );
    };

    const roleString = () => {
        if (!profile) return "—";
        if (profile.role === "CLIENT") return "Cliente";
        if (profile.role === "TRAINER") return "Entrenador";
        if (profile.role === "ADMIN") return "Administrador";
        return "Indefinido";
    };


    if (loading) return <LoadingMessage text="Cargando perfil..." />;

    return (
        <div className={styles.profile}>
            <div className={styles["profile-container"]}>
                <ProfileHeader
                    profile={profile}
                    me={me}
                    followers={followers}
                    following={following}
                    loading={loading}
                    loadingFollow={loadingFollow}
                    isFollowing={isFollowing}
                    isBlockedByMe={isBlockedByMe}
                    setShowMetrics={setShowMetrics}
                    handleFollowToggle={handleFollowToggle}
                    handleBlockToggle={handleBlockToggle}
                    handleEditProfile={handleEditProfile}
                    handleChangePassword={handleChangePassword}
                    handleBecomePremium={handleBecomePremium}
                    navigate={navigate}
                />

                <ProfileData profile={profile} roleString={roleString} />
            </div>

            <Popup
                text={"Sesión cerrada. ¡Vuelva pronto!"}
                show={showPopup}
                onOk={() => {
                    setShowPopup(false);
                    navigate("/users/login");
                }}
            />

            {profile && <UserWorkoutHistory id={profile.id} />}

            {showMetrics && profile && (
                <BodyMetricsCard
                    userId={profile.id}
                    initialWeightKg={profile.weightKg}
                    initialHeightCm={profile.heightCm}
                    initialGender={profile.gender}
                    initialBmi={profile.bmi}
                    onSaved={(partial) =>
                        setProfile((p) => ({ ...p, ...partial }))
                    }
                    onClose={() => setShowMetrics(false)}
                />
            )}
        </div>
    );
};

ProfileHeader.propTypes = {
    profile: PropTypes.object,
    me: PropTypes.object,
    followers: PropTypes.number.isRequired,
    following: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    loadingFollow: PropTypes.bool.isRequired,
    isFollowing: PropTypes.bool.isRequired,
    isBlockedByMe: PropTypes.bool.isRequired,
    setShowMetrics: PropTypes.func.isRequired,
    handleFollowToggle: PropTypes.func.isRequired,
    handleBlockToggle: PropTypes.func.isRequired,
    handleEditProfile: PropTypes.func.isRequired,
    handleChangePassword: PropTypes.func.isRequired,
    handleBecomePremium: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired
};

ProfileData.propTypes = {
    profile: PropTypes.object,
    roleString: PropTypes.func.isRequired
};

export default Profile;
