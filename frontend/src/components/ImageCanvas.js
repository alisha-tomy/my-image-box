// ImageCanvas.js
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';


const ImageCanvas = ({ imageSrc, sBoxes, setSBoxes, sFile, imageId, onClose, imageSName }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(null);
    const [startY, setStartY] = useState(null);
    const [endX, setEndX] = useState(null);
    const [endY, setEndY] = useState(null);
    const [canvasVisible, setCanvasVisible] = useState(false);
    const [boxes, setBoxes] = useState([]); // New state to store boxes
    const [selectedBoxIndex, setSelectedBoxIndex] = useState(null); // New state to store the index of the selected box
    const [dragging, setDragging] = useState(false); // State to indicate if dragging is occurring
    const [dragStartX, setDragStartX] = useState(null); // State to store initial X position for dragging
    const [dragStartY, setDragStartY] = useState(null); // State to store initial Y position for dragging
    const [resizing, setResizing] = useState(false); // State to indicate if resizing is occurring
    const [resizeEdgeX, setResizeEdgeX] = useState(null); // State to store which edge is being resized
    const [resizeEdgeY, setResizeEdgeY] = useState(null); // State to store which edge is being resized
    const [file, setFile] = useState(null);
    const [canvasReady, setCanvasReady] = useState(false);
    const [imageName, setImageName] = useState(null);
    const [imageWidth, setImageWidth] = useState(null);
    const [imageHeight, setImageHeight] = useState(null);
    const [tempBox, setTempBox] = useState(null);

    const handleMouseDown = (event) => {
        if (!canvasRef.current) return; // Ensure canvasRef.current is not null
        const rect = event.target.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        if (mouseX >= 0 && mouseX <= imageWidth && mouseY >= 0 && mouseY <= imageHeight) {

            const handleSize = 15;
            // Check if the click is inside any existing bounding box
            const clickedBoxIndex = boxes.findIndex((box) => {
                const minX = Math.min(box.startX, box.endX) - handleSize;
                const maxX = Math.max(box.startX, box.endX) + handleSize;
                const minY = Math.min(box.startY, box.endY) - handleSize;
                const maxY = Math.max(box.startY, box.endY) + handleSize;

                return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
            });
            if (clickedBoxIndex !== -1) {
                // Clicked inside an existing box
                setSelectedBoxIndex(clickedBoxIndex)
                if (clickedBoxIndex !== null) {
                    // If clicked on a box, initiate dragging
                    setDragging(true);
                    setDragStartX(mouseX);
                    setDragStartY(mouseY);
                    // Check if clicked near any edge for resizing
                    const clickedBox = boxes[clickedBoxIndex];
                    const tolerance = 15; // Tolerance in pixels for detecting resize
                    const middleX = (clickedBox.startX + clickedBox.endX) / 2;
                    const middleY = (clickedBox.startY + clickedBox.endY) / 2;
                    if ((Math.abs(mouseX - middleX) == tolerance) || (Math.abs(middleX - mouseX) == tolerance)) {
                        setResizing(true);
                        setResizeEdgeX('middle');
                        setDragging(false);
                    }
                    // else 
                    else if (Math.abs(mouseX - clickedBox.startX) <= tolerance) {
                        setResizing(true);
                        setResizeEdgeX('left');
                        setDragging(false);
                    } else if (Math.abs(mouseX - clickedBox.endX) <= tolerance) {
                        setResizing(true);
                        setResizeEdgeX('right');
                        setDragging(false);
                    }

                    if ((Math.abs(mouseY - middleY) == tolerance) || (Math.abs(middleY - mouseY) == tolerance)) {
                        setResizing(true);
                        setResizeEdgeY('middle');
                        setDragging(false);
                    }
                    else if (Math.abs(mouseY - clickedBox.startY) <= tolerance) {
                        setResizing(true);
                        setResizeEdgeY('top');
                        setDragging(false);
                    } else if (Math.abs(mouseY - clickedBox.endY) <= tolerance) {
                        setResizing(true);
                        setResizeEdgeY('bottom');
                        setDragging(false);
                    }
                }
                return;
            }
            // Clicked outside any box, deselect any selected box
            setSelectedBoxIndex(null);
            setIsDrawing(true);
            setStartX(mouseX);
            setStartY(mouseY);
            setEndX(mouseX); // Update endX with initial mouseX
            setEndY(mouseY); // Update endY with initial mouseY
        }
    };

    const handleMouseMove = (event) => {
        if (!canvasRef.current) return; // Ensure canvasRef.current is not null
        const rect = event.target.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        // const mouseX = event.clientX - rect.left;
        // const mouseY = event.clientY - rect.top;
        mouseX = Math.max(0, Math.min(mouseX, imageWidth));
        mouseY = Math.max(0, Math.min(mouseY, imageHeight));

        // if (mouseX >= 0 && mouseX <= imageWidth && mouseY >= 0 && mouseY <= imageHeight) {
        if (isDrawing && selectedBoxIndex === null) {
            setEndX(mouseX);
            setEndY(mouseY);
            const newTempBox = {
                startX: Math.min(startX, endX),
                startY: Math.min(startY, endY),
                endX: Math.max(startX, endX),
                endY: Math.max(startY, endY),
            };

            setTempBox(() => ({
                startX: Math.min(startX, mouseX),
                startY: Math.min(startY, mouseY),
                endX: Math.max(startX, mouseX),
                endY: Math.max(startY, mouseY),
            }));
            if (!canvasRef.current) return; // Ensure canvasRef.current is not null
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (imageSrc) {
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    // ctx.drawImage(img, 0, 0);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    boxes.forEach((box, index) => {
                        ctx.beginPath();
                        const startX = Math.min(box.startX, box.endX);
                        const startY = Math.min(box.startY, box.endY);
                        const width = Math.abs(box.endX - box.startX);
                        const height = Math.abs(box.endY - box.startY);
                        ctx.rect(startX, startY, width, height);
                        if (index === selectedBoxIndex) {
                            // Highlight the selected box with a different color
                            ctx.strokeStyle = 'blue';
                            // Draw resize handles
                            const handleSize = 15;
                            ctx.fillStyle = 'blue';

                            ctx.fillRect(startX - handleSize / 2, startY - handleSize / 2, handleSize, handleSize); // Top-left handle
                            ctx.fillRect(startX + width - handleSize / 2, startY - handleSize / 2, handleSize, handleSize); // Top-right handle
                            ctx.fillRect(startX - handleSize / 2, startY + height - handleSize / 2, handleSize, handleSize); // Bottom-left handle
                            ctx.fillRect(startX + width - handleSize / 2, startY + height - handleSize / 2, handleSize, handleSize); // Bottom-right handle
                        } else {
                            ctx.strokeStyle = 'red';
                        }
                        ctx.stroke();
                    });
                    ctx.beginPath();
                    const startX = Math.min(newTempBox.startX, newTempBox.endX);
                    const startY = Math.min(newTempBox.startY, newTempBox.endY);
                    const width = Math.abs(newTempBox.endX - newTempBox.startX);
                    const height = Math.abs(newTempBox.endY - newTempBox.startY);
                    ctx.rect(startX, startY, width, height);

                    ctx.strokeStyle = 'blue';
                    ctx.stroke();
                };
                img.src = imageSrc;
            }


        }

        if (isDrawing && selectedBoxIndex !== null) {
            const updatedBoxes = [...boxes];
            const selectedBox = updatedBoxes[selectedBoxIndex];

            // Calculate the distance moved
            const deltaX = mouseX - startX;
            const deltaY = mouseY - startY;

            // Update the position of the selected box
            selectedBox.startX += deltaX;
            selectedBox.startY += deltaY;
            selectedBox.endX += deltaX;
            selectedBox.endY += deltaY;

            // Update startX, startY, endX, endY for next mouse move
            setStartX(mouseX);
            setStartY(mouseY);
            setEndX(selectedBox.endX);
            setEndY(selectedBox.endY);

            // Update the boxes state with the modified box
            updatedBoxes[selectedBoxIndex] = selectedBox;
            setBoxes(updatedBoxes);
        }
        if (dragging && selectedBoxIndex !== null && !resizing) {
            const updatedBoxes = [...boxes];
            const selectedBox = updatedBoxes[selectedBoxIndex];
            const handleSize = 15;
            // Calculate the distance moved
            const deltaX = mouseX - dragStartX;
            const deltaY = mouseY - dragStartY;

            // Update the position of the selected box
            const boxWidth = Math.abs(selectedBox.endX - selectedBox.startX);
            const boxHeight = Math.abs(selectedBox.endY - selectedBox.startY);
            const canvasRightEdge = imageWidth - boxWidth;
            const canvasBottomEdge = imageHeight - boxHeight;
            const newStartX = selectedBox.startX + deltaX;
            const newStartY = selectedBox.startY + deltaY;
            const newEndX = selectedBox.endX + deltaX;
            const newEndY = selectedBox.endY + deltaY;
            if (newStartX >= 0 && newEndX <= imageWidth && newStartY >= 0 && newEndY <= imageHeight) {
                // Update the position of the selected box if it's within the canvas boundaries
                selectedBox.startX = newStartX;
                selectedBox.startY = newStartY;
                selectedBox.endX = newEndX;
                selectedBox.endY = newEndY;
            } else {
                // If the new position is outside the canvas boundaries, clamp it to the edges
                selectedBox.startX = Math.max(0, Math.min(newStartX, canvasRightEdge));
                selectedBox.startY = Math.max(0, Math.min(newStartY, canvasBottomEdge));
                selectedBox.endX = Math.max(boxWidth, Math.min(newEndX, imageWidth));
                selectedBox.endY = Math.max(boxHeight, Math.min(newEndY, imageHeight));
            }
            // Update drag start position for next mouse move
            setDragStartX(mouseX);
            setDragStartY(mouseY);

            // Update the boxes state with the modified box
            updatedBoxes[selectedBoxIndex] = selectedBox;
            setBoxes(updatedBoxes);
        }
        if (resizing && selectedBoxIndex !== null) {
            const updatedBoxes = [...boxes];
            const selectedBox = updatedBoxes[selectedBoxIndex];
            switch (resizeEdgeX) {
                case 'middle':
                    switch (resizeEdgeY) {
                        case 'top':
                            selectedBox.startY = mouseY;
                            break;
                        case 'bottom':
                            selectedBox.endY = mouseY;
                            break;
                        default:
                            break;
                    }
                    break;
                case 'left':
                    selectedBox.startX = mouseX;
                    break;
                case 'right':
                    selectedBox.endX = mouseX;
                    break;
                default:
                    break;
            }
            switch (resizeEdgeY) {
                case 'middle':
                    switch (resizeEdgeX) {
                        case 'left':
                            selectedBox.startX = mouseX;
                            break;
                        case 'right':
                            selectedBox.endX = mouseX;
                            break;
                        default:
                            break;
                    }
                    break;
                case 'top':
                    selectedBox.startY = mouseY;
                    selectedBox.endY += mouseY - selectedBox.startY;
                    break;
                case 'bottom':
                    selectedBox.endY = mouseY;
                    break;
                default:
                    break;
            }
            // Update the boxes state with the modified box
            updatedBoxes[selectedBoxIndex] = selectedBox;
            setBoxes(updatedBoxes);
        }
    };

    const handleMouseUp = (event) => {
        setIsDrawing(false);
        setDragging(false); // Reset dragging state
        setResizing(false); // Reset resizing state
        if (!canvasRef.current) return; // Ensure canvasRef.current is not null
        if (isDrawing) {
            // Draw bounding box here using startX, startY, endX, endY
            if (!(startX == endX) && !(endX == endY)) {
                const newBox = {
                    startX: Math.min(startX, endX),
                    startY: Math.min(startY, endY),
                    endX: Math.max(startX, endX),
                    endY: Math.max(startY, endY),
                };
                setBoxes([...boxes, newBox]); // Add the new box to the list of boxes
                setStartX(null);
                setStartY(null);
                setEndX(null);
                setEndY(null);
            }
        }
        setResizeEdgeX(null);
        setResizeEdgeY(null);
    };

    const handleDeleteSelectedBox = () => {
        if (selectedBoxIndex !== null) {
            const updatedBoxes = [...boxes];
            updatedBoxes.splice(selectedBoxIndex, 1);
            setBoxes(updatedBoxes);
            setSelectedBoxIndex(null); // Deselect the box after deletion
        }
    };
    const handleSave = async () => {
        const formData = new FormData();
        if (imageId) {
            formData.append('image_id', imageId);
        }
        else {
            formData.append('file', file);
        }

        formData.append('boxes', JSON.stringify(boxes));
        try {
            const response = await axios.post('http://127.0.0.1:5000/save', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onClose();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    const handleClose = () => {
        onClose(); // Call the onClose function provided by the parent component
    };
    const drawCanvas = () => {
        if (!canvasRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 500;
            canvas.id = 'imageCanvas';
            canvasRef.current = canvas;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image
        const img = new Image();
        img.onload = () => {
            // ctx.drawImage(img, 0, 0);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
        img.src = imageSrc;
        setImageName(imageSName);
        setCanvasReady(true);
        setCanvasVisible(true);
    };
    const drawBoxes = () => {
        if (!canvasRef.current) return; // Ensure canvasRef.current is not null
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (imageSrc) {
            const img = new Image();
            img.onload = () => {
                // ctx.drawImage(img, 0, 0);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                boxes.forEach((box, index) => {
                    ctx.beginPath();
                    const startX = Math.min(box.startX, box.endX);
                    const startY = Math.min(box.startY, box.endY);
                    const width = Math.abs(box.endX - box.startX);
                    const height = Math.abs(box.endY - box.startY);
                    ctx.rect(startX, startY, width, height);
                    if (index === selectedBoxIndex) {
                        // Highlight the selected box with a different color
                        ctx.strokeStyle = 'blue';
                        // Draw resize handles
                        const handleSize = 15;
                        ctx.fillStyle = 'blue';
                        ctx.fillRect(startX - handleSize / 2, startY - handleSize / 2, handleSize, handleSize); // Top-left handle
                        ctx.fillRect(startX + width - handleSize / 2, startY - handleSize / 2, handleSize, handleSize); // Top-right handle
                        ctx.fillRect(startX - handleSize / 2, startY + height - handleSize / 2, handleSize, handleSize); // Bottom-left handle
                        ctx.fillRect(startX + width - handleSize / 2, startY + height - handleSize / 2, handleSize, handleSize); // Bottom-right handle
                        ctx.fillRect(startX + width / 2 - handleSize / 2, startY - handleSize / 2, handleSize, handleSize); // Top middle handle
                        ctx.fillRect(startX + width - handleSize / 2, startY + height / 2 - handleSize / 2, handleSize, handleSize); // Right middle handle
                        ctx.fillRect(startX + width / 2 - handleSize / 2, startY + height - handleSize / 2, handleSize, handleSize); // Bottom middle handle
                        ctx.fillRect(startX - handleSize / 2, startY + height / 2 - handleSize / 2, handleSize, handleSize); // Left middle handle
                    } else {
                        ctx.strokeStyle = 'red';
                    }
                    ctx.stroke();
                });
            };
            img.src = imageSrc;
        }
    };

    const getImageDimensions = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.onerror = (error) => {
                reject(error);
            };
            img.src = src;
        });
    };
    useEffect(() => {
        if (imageSrc) {
            drawCanvas();
            if (sBoxes && sBoxes.length > 0) {
                setBoxes(sBoxes);
            }
            else {
                setBoxes(null)
                setBoxes([])
            }
            if (imageId) {
                setFile(null);
            }
            else {
                setFile(sFile);
            }
            setSBoxes([])
            setSBoxes(null);
            getImageDimensions(imageSrc)
                .then(dimensions => {
                    const { width, height } = dimensions;
                    setImageWidth(width);
                    setImageHeight(height);
                })
                .catch(error => {
                    setImageWidth(800);
                    setImageHeight(600);
                });
        }
    }, [imageSrc]);
    useEffect(() => {
        if (canvasReady) {
            drawBoxes();
        }
    }, [canvasReady, boxes, selectedBoxIndex]);

    useEffect(() => {
        const handleClickOutsideCanvas = (event) => {
            if (canvasRef.current && !canvasRef.current.contains(event.target)) {
                // Clicked outside the canvas
                setIsDrawing(false);
                setDragging(false); // Reset dragging state
                setResizing(false); // Reset resizing state
                setStartX(null);
                setStartY(null);
                setEndX(null);
                setEndY(null);
                setResizeEdgeX(null);
                setResizeEdgeY(null);
                if (isDrawing){
                if (tempBox !== null) {
                    setBoxes(prevBoxes => [...prevBoxes, tempBox]); // Use callback function to ensure tempBox is not null
                    setTempBox(null);
                }
            }


                // Perform your desired actions here
            }
        };

        // Attach click event listener to the document
        document.addEventListener('click', handleClickOutsideCanvas);

        return () => {
            // Clean up the event listener on component unmount
            document.removeEventListener('click', handleClickOutsideCanvas);
        };
    }, [tempBox, dragging, isDrawing, resizing]);

    return (
        <div>
            {canvasVisible && (
                <div>
                    <div className='canvas-box-container'>
                        <div className='canvas-box-header'>
                            <div className="image-name">{imageName}</div>

                            <div className='canvas-box'>
                                <canvas
                                    ref={canvasRef}
                                    width={800} // Set canvas width
                                    height={500} // Set canvas height
                                    style={{}}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    handleDeleteSelectedBox={handleDeleteSelectedBox}
                                    selectedBoxIndex={selectedBoxIndex}
                                />
                            </div>
                        </div>
                    </div>
                    <br />
                    <div
                        style={{
                            padding: '10px',
                        }}
                    >
                        <button
                            onClick={handleDeleteSelectedBox}
                            style={{
                                backgroundColor: selectedBoxIndex === null ? '#ccc' : '#007bff',
                                color: '#fff',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginRight: '10px', // Add some space between buttons
                            }}
                        >
                            Delete Selected Box
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                backgroundColor: '#007bff',
                                color: '#fff',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginRight: '10px', // Add some space between buttons
                            }}
                        >
                            Save Image and Boxes
                        </button>
                        <button
                            onClick={handleClose}
                            style={{
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        >
                            Close Image
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ImageCanvas;
