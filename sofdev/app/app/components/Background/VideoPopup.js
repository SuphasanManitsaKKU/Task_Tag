'use client';

import { useState, useEffect } from 'react';
import "./scrollbar.css";

export default function VideoPopup({ onVideoSelect, volume, setVolume, muted, setMuted, isVisible, onClose }) {
    const [videos, setVideos] = useState([]);

    // ดึงข้อมูลวิดีโอจาก API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/videos`); // ดึงข้อมูลจาก API
                const data = await response.json();
                setVideos(data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    return (

        <div
            className={`absolute top-2 left-2 h-5/6 w-72 bg-gray-800 bg-opacity-100 rounded-lg shadow-lg flex flex-col                 
            transform transition-transform duration-700 ease-out z-30 
            ${isVisible ? 'translate-x-0' : '-translate-x-full -left-[50%]'}`}
        >

            {/* <div className="absolute top-2 left-2 h-5/6 w-72 bg-white bg-opacity-100 p-4 rounded-lg shadow-lg flex flex-col z-30"> */}

            {/* ส่วนคำว่า Select a Video */}
            <div className="flex-none border-b border-gray-500 px-4">
                <div className="cursor-move bg-gray-800 text-white p-2 flex justify-between items-center select-none">
                    Select a Video
                    <div className="flex gap-2">
                        <button className="text-white bg-transparent rounded-full w-6 h-6 flex items-center justify-center" onClick={onClose}>
                            &#8212;
                        </button>
                    </div>
                </div>
            </div>

            {/* ส่วน thumbnail ที่สามารถเลื่อนขึ้นลงได้ */}
            <div className="flex-grow overflow-y-auto grid grid-cols-2 gap-4 px-4 mt-2 no-scrollbar">
                {videos.map((video) => (
                    <div
                        key={video.id}
                        className="cursor-pointer hover:bg-gray-500 p-2 rounded"
                        onClick={() => onVideoSelect(video.id)} // เมื่อคลิก thumbnail จะเรียก onVideoSelect เพื่อเปลี่ยนวิดีโอ
                    >
                        <img
                            src={`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream${video.thumbnailUrl}`} // ดึง thumbnail ตามตัวอย่าง index.html
                            alt={video.title}
                            className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-white mt-2 text-sm text-center">{video.title}</p>
                    </div>
                ))}
            </div>

            {/* ส่วนการควบคุมเสียง */}
            <div className="flex-none mt-4 px-4">
                <label className="text-white block mb-2">Volume</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="
                        w-full h-1 rounded-lg appearance-none cursor-pointer 
                        bg-gray-300  
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-300
                        [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-500
                    "
                    style={{
                        background: `linear-gradient(to right, #c4b5fd ${volume * 100}%, gray ${volume * 100}%)`,
                    }}
                />
                <div className="flex items-center mt-2 mb-4">
                    <input
                        type="checkbox"
                        checked={muted}
                        onChange={() => setMuted(!muted)}
                    />
                    <label className="ml-2 text-white">Mute</label>
                </div>
            </div>
        </div>
    );
}
