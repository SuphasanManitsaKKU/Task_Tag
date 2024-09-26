'use client';

import { useEffect, useState, useRef } from 'react';

export default function VideoBackground({ videoId, volume, muted }) {
    const [videoSrc, setVideoSrc] = useState('');
    const videoRef = useRef(null); // สร้าง ref สำหรับ video

    // ฟังก์ชันสำหรับดึง URL ของวิดีโอจาก videoId
    const fetchVideoSrc = (id) => {
        const url = `${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/${id}`;  // แทนที่ด้วย API URL จริง
        console.log("Generated video URL:", url);  // ตรวจสอบ URL ที่สร้างขึ้น
        return url;
    };

    useEffect(() => {
        if (videoId) {
            console.log("Video ID updated:", videoId);  // ตรวจสอบว่าฟังก์ชันนี้ถูกเรียกเมื่อใด
            setVideoSrc(fetchVideoSrc(videoId));
        }
    }, [videoId]);

    // ปรับระดับเสียงและสถานะปิดเสียงเมื่อค่า volume หรือ muted เปลี่ยน
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = muted;
        }
    }, [volume, muted]);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {videoSrc ? (
                <video
                    ref={videoRef}  // ผูก ref กับ video
                    key={videoSrc}  // เพิ่ม key เพื่อล้างวิดีโอเก่า
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    playsInline
                >
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="flex justify-center items-center w-full h-full text-white">
                    <p>Loading video...</p>
                </div>
            )}
        </div>
    );
}
