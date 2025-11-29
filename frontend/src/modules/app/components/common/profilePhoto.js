import styles from "./ProfilePhoto.module.css";
import PropTypes from "prop-types";

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
                    alt={alt}
                    className={imageClass}
                />
            )}
        </div>
    );
};

export default ProfilePhoto;

ProfilePhoto.propTypes = {
    profilePicture: PropTypes.string,
    alt: PropTypes.string,
    size: PropTypes.oneOf(['small', 'large'])
};