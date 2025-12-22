import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./Profile.module.css";
import { useNavigate, useParams } from "react-router-dom";
import {
    tryLoginFromServiceToken,
    getUser,
    becomePremium,
    deletePremium
} from "../../../../backend/userService";
import Popup from "../common/popup/Popup";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
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
import AchievementCard from "../achievements/AchievementCard";
import {getAllAchievementProgresses} from "../../../../backend/achievementService";

/* Helpers fuera del componente para reducir profundidad de funciones */

const getAuth = () =>
    new Promise((resolve, reject) =>
        tryLoginFromServiceToken(resolve, () => reject(new Error("AUTH_ERROR")))
    );

const getUserById = (id) =>
    new Promise((resolve, reject) => getUser(id, resolve, (err) => reject(err instanceof Error ? err : new Error(err))));
const checkIsBlocked = (userId) =>
    new Promise((resolve) =>
        isBlocked(
            userId,
            (blocked) => resolve(blocked),
            () => resolve(false)
        )
    );

const getFollowersCount = (userId) =>
    new Promise((resolve) =>
        getFollowers(userId, (f) => resolve(f.length))
    );

const getFollowingCount = (userId) =>
    new Promise((resolve) =>
        getFollowedTrainers(userId, (t) => resolve(t.length))
    );

const getIsFollowingTrainer = (meId, profileId) =>
    new Promise((resolve) =>
        getFollowedTrainers(meId, (trainers) =>
            resolve(trainers.some((t) => t.trainerId === profileId))
        )
    );

const getAchievements = (userId) =>
    new Promise(resolve =>
        getAllAchievementProgresses(
            userId,
            resolve,
            () => resolve([]) // fallback seguro
        )
    );

const getFollowText = (loadingFollow, isFollowing) => {
    if (loadingFollow) return "Cargando...";
    if (isFollowing) return "Dejar de seguir";
    return "Seguir";
};

const isWrappedAvailable = () => {
    const now = new Date();
    const wrappedStartDate = new Date(2025, 11, 22);

    return now >= wrappedStartDate;
};

/* Presentational components */

function ProfileHeader(props) {
    const {
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
    } = props;

    const showSelfActions = me && profile && me.id === profile.id;
    const showOtherActions = me && profile && me.id !== profile.id;

    const followText = getFollowText(loadingFollow, isFollowing);
    const blockText = isBlockedByMe ? "Desbloquear" : "Bloquear";

    const isPremiumTrainer =
        profile?.role === "TRAINER" &&
        profile?.trainerPremium;

    const canBecomePremium =
        showSelfActions &&
        me.role === "TRAINER";

    const showWrapped = isWrappedAvailable();

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
                        {profile?.streak > 0 && (
                             <span className={profile?.trainedToday ? styles["training-indicator"] : styles["training-indicator-gray"]} title="Racha de entrenamientos">
                                🔥 {profile.streak}
                             </span>
                        )}
                        {!profile?.trainedToday && profile?.streak > 0 && (
                             <span className={styles["training-indicator-clock"]} title="¡No has entrenado hoy!">
                                🕒
                             </span>
                        )}
                        {isPremiumTrainer && (
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
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        navigate(`/users/followers/${profile.id}`);
                                    }
                                }}
                            >
                                Seguidores: {followers}
                            </button>

                            <button
                                type="button"
                                className={styles["follow-side"]}
                                onClick={() => navigate(`/users/following/${profile.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        navigate(`/users/following/${profile.id}`);
                                    }
                                }}
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
                        {showWrapped && (
                            <button
                                className={styles["wrapped-button"]}
                                onClick={() => navigate(`/users/${profile.id}/wrapped`)}
                            >
                                Wrapped 2025
                            </button>
                        )}
                        {canBecomePremium && (
                            <button
                                className={styles["premium-button"]}
                                onClick={handleBecomePremium}
                            >
                                {isPremiumTrainer ? "Dejar de ser premium" : "Hacerme Entrenador premium"}
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
                            {followText}
                        </button>

                        <button
                            className={styles["edit-profile-button"]}
                            onClick={handleBlockToggle}
                        >
                            {blockText}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function ProfileData({ profile, roleString }) {
    if (!profile) return <p>Cargando datos...</p>;

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

/* Componente principal */

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [me, setMe] = useState(null);
    const [profile, setProfile] = useState(null);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [showBlockPopup, setShowBlockPopup] = useState(false);
    const [showPopupBlocked, setShowPopupBlocked] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [showMetrics, setShowMetrics] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [loading, setLoading] = useState(true);

    /* Carga inicial */

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const auth = await getAuth();
                if (!isMounted) return;

                const meUser = auth.user;
                setMe(meUser);

                const user = await getUserById(id);
                if (!isMounted) return;

                setProfile(user);

                const blocked = await checkIsBlocked(user.id);
                if (isMounted) {
                    setIsBlockedByMe(blocked);
                }

                const [followersCount, followingCount, followingFlag, myAchievements] =
                    await Promise.all([
                        getFollowersCount(user.id),
                        getFollowingCount(user.id),
                        getIsFollowingTrainer(meUser.id, user.id),
                        getAchievements(user.id)
                    ]);

                if (!isMounted) return;

                setFollowers(followersCount);
                setFollowing(followingCount);
                setIsFollowing(followingFlag);
                setAchievements(myAchievements);
                setLoading(false);
            } catch (e) {
                if(e instanceof Error && e.message === "AUTH_ERROR") {
                    setShowPopup(true);
                    navigate("/users/login");
                    setLoading(false);
                    return;
                }

                setShowPopupBlocked(true);
                setLoading(false);
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    /* Actualización cuando cambia el follow */

    useEffect(() => {
        const updateFollowInfo = async () => {
            if (!profile || !me) return;

            const [followersCount, followingCount, followingFlag] =
                await Promise.all([
                    getFollowersCount(profile.id),
                    getFollowingCount(profile.id),
                    getIsFollowingTrainer(me.id, profile.id)
                ]);

            setFollowers(followersCount);
            setFollowing(followingCount);
            setIsFollowing(followingFlag);
        };

        const onFollowChange = () => {
            updateFollowInfo();
        };

        window.addEventListener("followChanged", onFollowChange);
        return () => {
            window.removeEventListener("followChanged", onFollowChange);
        };
    }, [profile, me]);

    /* Handlers */

    const handleEditProfile = () => {
        navigate("/users/profile/edit-profile");
    };

    const handleChangePassword = () => {
        navigate("/users/profile/change-password");
    };

    const handleBecomePremium = () => {
        if (!me) return;

        if (me.trainerPremium) {
            setShowConfirmationPopup(true);
        } else {
            becomePremium(
                me.id,
                () => {
                    const newPremium = !me.trainerPremium;
                    setMe((prev) => ({ ...prev, trainerPremium: newPremium }));
                    setProfile((prev) => ({ ...prev, trainerPremium: newPremium }));
                },
                (err) => alert("Error: " + err)
            );
        }
    };

    const handleConfirmStopPremium = () => {
        setShowConfirmationPopup(false);
        deletePremium(
            me.id,
            () => {
                const newPremium = !me.trainerPremium;
                setMe((prev) => ({ ...prev, trainerPremium: newPremium }));
                setProfile((prev) => ({ ...prev, trainerPremium: newPremium }));
            },
            (err) => alert("Error: " + err)
        );
    };

    const handleBlockToggle = () => {
        if (!profile) return;

        if (isBlockedByMe) {
            unblockUser(
                profile.id,
                () => setIsBlockedByMe(false),
                (err) => console.error(err)
            );
            return;
        }

        setShowBlockPopup(true);
    };

    const confirmBlockUser = () => {
        blockUser(
            profile.id,
            () => {
                if (isFollowing) {
                    setIsFollowing(false);
                    setFollowers(n => Math.max(0, n - 1));
                    window.dispatchEvent(new Event("followChanged"));
                }
                setIsBlockedByMe(true);
                setShowBlockPopup(false);
            },
            (err) => {
                console.error(err);
                setShowBlockPopup(false);
            }
        );
    }

    const cancelBlockUser = () => setShowBlockPopup(false);

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
            () => {
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
                text="Sesión cerrada. ¡Vuelva pronto!"
                show={showPopup}
                onOk={() => {
                    setShowPopup(false);
                    navigate("/users/login");
                }}
            />

            <ConfirmationPopup
                show={showBlockPopup}
                text="¿Seguro que quieres bloquear a este usuario?"
                onOk={confirmBlockUser}
                onCancel={cancelBlockUser}
            />

            <Popup
                text="No puedes acceder al perfil de este usuario porque te ha bloqueado."
                show={showPopupBlocked}
                onOk={() => {
                    setShowPopupBlocked(false);
                    navigate("/users/profile");
                }}
            />
            
            <ConfirmationPopup
                show={showConfirmationPopup}
                text="¿Estás seguro de que quieres dejar de ser premium?"
                onOk={handleConfirmStopPremium}
                onCancel={() => setShowConfirmationPopup(false)}
            />

            {profile &&
                <div className={styles.achievementsSection}>
                    <h3 className={styles.achievementsTitle}>Logros</h3>

                    <div className={styles.achievementsList}>
                        {achievements.map((a) => (
                            <AchievementCard key={a.id} achievement={a} />
                        ))}
                    </div>
                </div>
            }

            {profile && <UserWorkoutHistory id={profile.id.toString()} />}

            {showMetrics && profile && (
                <BodyMetricsCard
                    userId={profile.id.toString()}
                    initialWeightKg={profile.weightKg}
                    initialHeightCm={profile.heightCm}
                    initialGender={profile.gender}
                    initialBmi={profile.bmi}
                    onSaved={(partial) =>
                        setProfile((prev) => ({ ...prev, ...partial }))
                    }
                    onClose={() => setShowMetrics(false)}
                />
            )}
        </div>
    );
};
/* PropTypes */

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
