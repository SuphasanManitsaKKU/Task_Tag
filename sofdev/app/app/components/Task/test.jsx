'use client';
import { useState, useEffect, useRef } from 'react';

const MusicPlayer = ({ isVisible, onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ right: '2rem', top: '2rem', left: 'auto' });
    const [size, setSize] = useState({ width: 400, height: 300 });
    const [isResizing, setIsResizing] = useState(false);


    useEffect(() => {
        const savedPosition = JSON.parse(localStorage.getItem('widgetPosition'));
        const savedSize = JSON.parse(localStorage.getItem('widgetSize'));

        if (savedPosition) setPosition(savedPosition);
        if (savedSize) setSize(savedSize);
    }, []);

    useEffect(() => {
        localStorage.setItem('widgetPosition', JSON.stringify(position));
        localStorage.setItem('widgetSize', JSON.stringify(size));
    }, [position, size]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const maxLeft = windowWidth - size.width;
                const maxTop = windowHeight - size.height;
                let newLeft = e.clientX - offset.x;
                let newTop = e.clientY - offset.y;

                if (newLeft >= maxLeft) newLeft = maxLeft;
                if (newLeft <= 0) newLeft = 0;
                if (newTop <= 0) newTop = 0;
                if (newTop >= maxTop) newTop = maxTop;

                setPosition({ left: `${newLeft}px`, top: `${newTop}px`, right: 'auto' });
            } else if (isResizing) {
                handleResize(e);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, offset, size]);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setOffset({ x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top });
    };

    const handleResize = (e) => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const newWidth = e.clientX - document.getElementById("playerWindow").getBoundingClientRect().left;
        const newHeight = e.clientY - document.getElementById("playerWindow").getBoundingClientRect().top;

        if (newWidth > 200 && newWidth + document.getElementById("playerWindow").getBoundingClientRect().left <= windowWidth) {
            setSize((prevSize) => ({
                ...prevSize,
                width: newWidth,
            }));
        }

        if (newHeight > 200 && newHeight + document.getElementById("playerWindow").getBoundingClientRect().top <= windowHeight) {
            setSize((prevSize) => ({
                ...prevSize,
                height: newHeight,
            }));
        }
    };

    return (
        <div>
            <div
                id="playerWindow"
                className="absolute overflow-hidden resize-y border border-gray-300 rounded-lg shadow-lg min-w-[352px] min-h-[300px] max-w-full max-h-full bg-gray-800"
                style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    top: position.top,
                    right: position.right,
                    left: position.left,
                    display: isVisible ? 'block' : 'none' // ซ่อนหน้าต่างโดยไม่ถอดออกจาก DOM
                }}
            >
                <div className="cursor-move bg-gray-800 text-white p-2 flex justify-between items-center select-none" onMouseDown={handleDragStart}>
                    Music Player
                    <div className="flex gap-2">
                        <button className="text-white bg-transparent rounded-full w-6 h-6 flex items-center justify-center" onClick={onClose}>
                            &#8212;
                        </button>
                    </div>
                </div>
                <div id="musicPlayerContent" className="flex flex-col h-full border-t border-y-white-600">
                //----------------------------------------------------------------------------------------------------------

                //----------------------------------------------------------------------------------------------------------
                </div>
            </div>
            <div
                id="resizeHandle"
                className="absolute bottom-0 right-0 w-6 h-6 bg-gray-600 cursor-nwse-resize"
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                }}
            ></div>
        </div>
    );
};

export default MusicPlayer;