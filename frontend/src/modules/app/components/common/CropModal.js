import React, { useState } from "react";
import Cropper from "react-easy-crop";
import styles from "./CropModal.module.css";

const CropModal = ({ imageSrc, onCancel, onSave }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Se llama cuando el usuario termina de mover/redimensionar
    const onCropComplete = (_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const getCroppedImg = (imageSrc, cropPixels) => {
        const image = new Image();
        image.src = imageSrc;

        return new Promise((resolve, reject) => {
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = cropPixels.width;
                canvas.height = cropPixels.height;

                ctx.drawImage(
                    image,
                    cropPixels.x, cropPixels.y, // origen
                    cropPixels.width, cropPixels.height, // tamaño recortado
                    0, 0, // destino en canvas
                    cropPixels.width, cropPixels.height // tamaño final
                );

                resolve(canvas.toDataURL("image/jpeg"));
            };

            image.onerror = (err) => reject(err);
        });
    };

    const handleSave = async () => {
        try {
            if (!croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onSave(croppedImage);
        } catch (e) {
            console.error("Error al recortar:", e);
        }
    };

    return (
        <div className={styles['crop-modal']}>
            <div className={styles['crop-box']}>
                <div className={styles['crop-container']}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // cuadrado
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className={styles['zoom-control']}>
                    <label>Zoom</label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                </div>

                <div className={styles['crop-actions']}>
                    <button className={styles['cancel-btn']} onClick={onCancel}>Cancelar</button>
                    <button className={styles['save-btn']} onClick={handleSave}>Guardar</button>
                </div>
            </div>
        </div>
    );
};

export default CropModal;
