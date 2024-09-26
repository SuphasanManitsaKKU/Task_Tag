'use client';
import { useEffect, useState } from 'react';
import Pomodoro from './components/Pomodoro/pomodoro';
import MusicPlayer from "./components/Playmusic/playmusic";
import VideoBackground from "./components/Background/VideoBackground";
import VideoPopup from "./components/Background/VideoPopup";
import VideoChatComponent from "./components/JoinRoom/join-room";


import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopwatch, faClipboard, faMusic, faGlobe, faUser,faVideo } from '@fortawesome/free-solid-svg-icons'; // Add FontAwesome icons
import TaskCard from './components/Task/TaskCard';
import Loading from './components/Loading/Loading';

export default function Home() {
  const [userId, setUserId] = useState("");  // Fetch userId from Context or API
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  // const [videoId, setVideoId] = useState(12);
  const [selectedVideoId, setSelectedVideoId] = useState(0);
  const [volume, setVolume] = useState(0.5); // เพิ่ม state สำหรับควบคุมเสียง
  const [muted, setMuted] = useState(false); // เพิ่ม state สำหรับปิด-เปิดเสียง

  const router = useRouter();

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/getCookie`);
      setUserId(response.data.userId);
      try {
        const userdata = await axios.get(`${process.env.NEXT_PUBLIC_MYHOST_API}/getuerdata/${response.data.userId}`, {
          withCredentials: true
        });
        setUsername(userdata.data.username);
      } catch (error) {
        console.error('There was an error fetching the userId:', error);
      }
      try {
        const response_v2 = await axios.get(`${process.env.NEXT_PUBLIC_MYHOST_API}/getvideoid/${response.data.userId}`, {
          withCredentials: true
        });
        console.log("fetch videoId success", response_v2.data.videoId);

        handleVideoSelect(response_v2.data.videoId);
      } catch (error) {
        console.error('There was an error fetching the userId:', error);
      }

    } catch (error) {
      console.error('There was an error fetching the userId:', error);
    }


  };

  useEffect(() => {
    fetchData();
  }, []);

  function handleLogout() {
    // ใช้ SweetAlert เพื่อถามการยืนยันก่อนทำการ logout
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // เมื่อผู้ใช้ยืนยันการ log out
        const fetchData = async () => {
          try {
            const response = await axios.get(`/api/removeCookie`);
            // แสดงข้อความสำเร็จหลังจากการ log out สำเร็จ
            Swal.fire({
              icon: 'success',
              title: 'Logged Out',
              text: 'You have successfully logged out!',
            }).then(() => {
              router.push('/'); // เปลี่ยนหน้าไปที่หน้าแรกหลัง log out สำเร็จ
            });
          } catch (error) {
            console.error('There was an error logging out:', error);
          }
        };
        fetchData();
      }
    });
  }

  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);

  const toggleMusicPlayer = () => {
    setIsMusicPlayerVisible(!isMusicPlayerVisible);
  };

  const [isPomodoroVisible, setIsPomodoroVisible] = useState(false); // State to show or hide TaskCard

  const togglePomodoroPlayer = () => {
    setIsPomodoroVisible(!isPomodoroVisible)
  }

  const [isTaskCardVisible, setIsTaskCardVisible] = useState(false); // State to show or hide TaskCard

  const toggleTaskCardPlayer = () => {
    setIsTaskCardVisible(!isTaskCardVisible)
  }
  const [isVideoChatVisible, setIsVideoChatVisible] = useState(false); // State to show or hide TaskCard

  const toggleVideoChatPopupPlayer = () => {
    setIsVideoChatVisible(!isVideoChatVisible)
  }

  const [isVideoPopupVisible, setIsVideoPopupVisible] = useState(false); // State to show or hide TaskCard

  const toggleVideoPopupPlayer = () => {
    setIsVideoPopupVisible(!isVideoPopupVisible)
  }

  const handleVideoSelect = (videoId: any) => {
    setSelectedVideoId(videoId); // เมื่อเลือก thumbnail จะเปลี่ยน videoId
    setMuted(false); // Reset ค่า muted เมื่อเลือกวิดีโอใหม่

    try {

      const response = axios.put(`${process.env.NEXT_PUBLIC_MYHOST_API}/changebackground`, {
        userId: userId,
        videoId: videoId
      }, {
        withCredentials: true
      });
      console.log("change background success", response);
    }
    catch (error) {
      console.error('There was an error sent the videoId:', error);
    }
    // เรียกฟังก์ชันเพื่อบันทึก videoId ที่เลือกไปยัง API
    // saveSelectedVideo(videoId); // comment ไว้รอทีมของคุณส่ง API มา
  };


  return (
    <div className="relative min-h-screen flex flex-col justify-between text-black">
      {!userId ? (
        <Loading />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="flex-grow">
          <div className="absolute top-4 right-4 flex justify-center items-center gap-2 z-40 bg-gray-800 p-2 rounded-lg border border-gray-400">
            <Link href="/app/profile" className=' flex justify-center rounded  hover:bg-gray-500'>
              <FontAwesomeIcon icon={faUser} size="lg" className="text-white px-2 py-1 me-1" /> {/* เปลี่ยนเป็นไอคอนเพลง */}
              <div className='text-white pe-2'>
              {username ? username : "Unknown"}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 z-40"
            >
              Logout
            </button>
          </div>

          {/* TaskCard Section */}
          <div className="flex justify-center items-center">
            {/* แสดง popup thumbnail ทางซ้าย พร้อมการควบคุมเสียง */}
            <VideoPopup
              onVideoSelect={handleVideoSelect}
              volume={volume}
              setVolume={setVolume}
              muted={muted}
              setMuted={setMuted}

              isVisible={isVideoPopupVisible} onClose={() => setIsVideoPopupVisible(false)}
            />
            {/* แสดงวิดีโอ background พร้อมการควบคุมเสียง */}
            <VideoBackground videoId={selectedVideoId} volume={volume} muted={muted} />
            <VideoChatComponent isVisible={isVideoChatVisible} onClose={() => setIsVideoChatVisible(false)} userID={userId} userName={username} />
            <TaskCard userId={userId} isVisible={isTaskCardVisible} onClose={() => setIsTaskCardVisible(false)} />
            <Pomodoro isVisible={isPomodoroVisible} onClose={() => setIsPomodoroVisible(false)} />
            <MusicPlayer isVisible={isMusicPlayerVisible} onClose={() => setIsMusicPlayerVisible(false)} />

          </div>
        </div>
      )}


      {/* ลิงก์ My Background ที่อยู่ด้านซ้ายล่างของจอ */}
      <Link
        href={`${process.env.NEXT_PUBLIC_MYHOST}/app/explore/${userId}`}
        className="fixed bottom-4 left-4 bg-violet-300 hover:bg-violet-500 border-gray-400 text-gray-800 px-4 py-2 rounded-lg"
      >
        Upload Video
      </Link>
      <div className="flex justify-center items-center p-3 bg-gray-900 border border-gray-400 rounded-xl fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-4 justify-between">
          <div className="flex gap-4">
            <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-700" onClick={() => toggleVideoPopupPlayer()} >
              <FontAwesomeIcon icon={faGlobe} size="lg" className={isVideoPopupVisible ? 'text-sky-300' : 'text-white'} /> {/* เปลี่ยนเป็นไอคอนวิดีโอ */}
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-500" onClick={() => togglePomodoroPlayer()} >
              <FontAwesomeIcon icon={faStopwatch} size="lg" className={isPomodoroVisible ? 'text-violet-300' : 'text-white'} /> {/* เปลี่ยนเป็นไอคอนนาฬิกาจับเวลา */}
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-500" onClick={() => toggleTaskCardPlayer()} >
              <FontAwesomeIcon icon={faClipboard} size="lg" className={isTaskCardVisible ? 'text-orange-300' : 'text-white'} /> {/* เปลี่ยนเป็นไอคอนบันทึกงาน */}
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-500" onClick={toggleMusicPlayer}>
              <FontAwesomeIcon icon={faMusic} size="lg" className={isMusicPlayerVisible ? 'text-rose-300' : 'text-white'} /> {/* เปลี่ยนเป็นไอคอนเพลง */}
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-500" onClick={toggleVideoChatPopupPlayer}>
              <FontAwesomeIcon icon={faVideo} size="lg" className={isVideoChatVisible ? 'text-lime-300' : 'text-white'} /> {/* เปลี่ยนเป็นไอคอนวิดีโอ */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}