// ParentComponent.js
import React, { useState } from 'react';
import ImageList from './ImageList';
import ImageCanvas from './ImageCanvas';
import ImageUpload from './ImageUpload';

const ParentComponent = () => {
    const [selectedCanvasImage, setSelectedCanvasImage] = useState(null);
    const [canvasFile, setCanvasFile] = useState(null);
    const [sBoxes, setSBoxes] = useState([]);
    const [imageSName, setImageSName] = useState(null);
    const [imageId, setImageId] = useState(null);

    const handleCloseImage = () => {
        setSelectedCanvasImage(null); // Set selectedCanvasImage to null when closing the image
    };

    const handleImageSelect = (imageData) => {
        setImageSName(imageData.imageName);
        setSBoxes(imageData.boxes);
        setImageId(imageData.imageId)
        setCanvasFile(null)
        setSelectedCanvasImage(imageData.imageSrc); // Update the selected image in the parent component

    };

    const handleImageUpload = (imageData) => {
        setSBoxes([]);
        setImageId(null)
        setImageSName(imageData.imageName);
        setCanvasFile(imageData.file);
        setImageSName(imageData.imageName);
        setSelectedCanvasImage(imageData.imageSrc); // Update the selected image in the parent component

    };
    return (
        <div className="parent-container">
        <div className="parent-box">
            <h1>Bounding Box Drawer</h1>
            {selectedCanvasImage ? (
        <ImageCanvas imageSrc={selectedCanvasImage} sBoxes={sBoxes} setSBoxes={setSBoxes} sFile={canvasFile} imageId={imageId} onClose={handleCloseImage} imageSName={imageSName} />
    ) : (
        <div className="app-container">
            <div className="left-side">
                <ImageUpload onUpload={handleImageUpload} /> {/* Pass handleImageUpload to ImageUpload */}
            </div>
            <div className="right-side">
                <ImageList onSelectedImage={handleImageSelect} />
            </div>
        </div>
    )}
        </div>
        </div>
    );
};

export default ParentComponent;
