// ImageUpload.js
import React from 'react';

const ImageUpload = ({ onUpload }) => {

    const handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            onUpload({"imageSrc":e.target.result, "file": file, "imageName":file.name}); // Pass the uploaded image source to the parent component
        };

        reader.readAsDataURL(file);
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
    <h2 style={{ marginBottom: '10px' }}>Upload Image</h2>
    <input type="file" onChange={handleChange} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
</div>
    );
};

export default ImageUpload;
