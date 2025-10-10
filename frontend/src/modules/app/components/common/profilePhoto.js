import styles from "./ProfilePhoto.module.css";

const ProfilePhoto = ({ profilePicture, alt = "Foto de perfil", size = "large" }) => {
    const containerClass = size === 'small' ? styles['profile-photo-small'] : styles['profile-photo'];
    const imageClass = size === 'small' ? styles['profile-image-small'] : styles['profile-image'];

    return (
        <div className={containerClass}>
            {profilePicture ? (
                <img
                    src={`data:image/jpeg;base64,${profilePicture}`}
                    alt={alt}
                    className={imageClass}
                />
            ) : (
                <img
                    src={process.env.PUBLIC_URL + "/assets/default-profile.jpg"}
                    alt="Foto por defecto"
                    className={imageClass}
                />
            )}
        </div>
    );
};

export default ProfilePhoto;
