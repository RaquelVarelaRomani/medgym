import "./ProfilePhoto.css";

const ProfilePhoto = ({ profilePicture, alt = "Foto de perfil" }) => {
    return (
        <div className="profile-photo">
            {profilePicture ? (
                <img
                    src={`data:image/jpeg;base64,${profilePicture}`}
                    alt={alt}
                    className="profile-image"
                />
            ) : (
                <img
                    src={process.env.PUBLIC_URL + "/assets/default-profile.jpg"}
                    alt="Foto por defecto"
                    className="profile-image"
                />
            )}
        </div>
    );
};

export default ProfilePhoto;
