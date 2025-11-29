import React, { useRef } from "react";
import styles from "./FileUploadButton.module.css";
import PropTypes from "prop-types";


const FileUploadButton = ({ onFileSelect }) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Simula clic en input oculto
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && onFileSelect) {
            onFileSelect(file); // Llama al callback con el archivo seleccionado
        }
    };

    return (
        <div>
            <button className={styles['file-upload-btn']} type="button" onClick={handleButtonClick}>
                Subir foto
            </button>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }} // ocultamos el input
            />
        </div>
    );
};

export default FileUploadButton;

FileUploadButton.propTypes = {
    onFileSelect: PropTypes.func.isRequired
};
