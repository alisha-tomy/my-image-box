import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageList = ({ onSelectedImage }) => { // corrected prop name
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/overview');
            setImages(response.data.images);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching images:', error);
            setLoading(false);
        }
    };

    const handleImageClick = async (imageId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/load/${imageId}`);
            const imageSrc = "http://127.0.0.1:5000/" + response.data.url;
            onSelectedImage({ "imageSrc": imageSrc, "boxes": response.data.boxes, "imageId": imageId, "imageName":response.data.name }); // corrected prop name
        } catch (error) {
            console.error('Error fetching image data:', error);
        }
    };

    return (
        <div>
            <h2>Image List</h2>
            {loading ? (
                <p>Loading...</p>
            ) : images.length === 0 ? (
                <p>No images available</p>
            ) : (
                <ul style={{ paddingLeft: '20px' }}>
                    {images.map((image) => (
                        <li key={image.id} onClick={() => handleImageClick(image.id)} style={{ cursor: 'pointer', textAlign: 'left' }}>
                            <p>{image.name}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ImageList;
