"use client";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

const MusicPlayer = ({ isVisible, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    right: "20%",
    top: "52%",
    left: "auto",
  });
  const [musicLink, setMusicLink] = useState("");
  const iframeRef = useRef(null);
  const defaultSpotifyPlaylist =
    "https://open.spotify.com/embed/playlist/1oM4GinvFYRN9PLvWyEdZd?utm_source=generator";

  useEffect(() => {
    const savedMusicLink = localStorage.getItem("musicLink");
    if (savedMusicLink) {
      setMusicLink(savedMusicLink);
      playMusic(savedMusicLink);
    } else {
      if (iframeRef.current) {
        iframeRef.current.src = defaultSpotifyPlaylist;
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("musicLink", musicLink);
  }, [musicLink]);

  useEffect(() => {
    localStorage.setItem("widgetPosition", JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const maxLeft = windowWidth - 400; // Use fixed width
        const maxTop = windowHeight - 300; // Use fixed height
        let newLeft = e.clientX - offset.x;
        let newTop = e.clientY - offset.y;

        if (newLeft >= maxLeft) newLeft = maxLeft;
        if (newLeft <= 0) newLeft = 0;
        if (newTop <= 0) newTop = 0;
        if (newTop >= maxTop) newTop = maxTop;

        setPosition({
          left: `${newLeft}px`,
          top: `${newTop}px`,
          right: "auto",
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - e.currentTarget.getBoundingClientRect().left,
      y: e.clientY - e.currentTarget.getBoundingClientRect().top,
    });
  };

  const [isBug, setIsBug] = useState(false);

  const playMusic = (link) => {
    let videoId;
    if (iframeRef.current) {
      if (link.includes("youtube.com")) {
        videoId = link.split("v=")[1];
        const ampersandPosition = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
        iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?controls=1`;
      } else if (link.includes("youtu.be")) {
        videoId = link.split("youtu.be/")[1];
        const questionMarkPosition = videoId.indexOf("?");
        if (questionMarkPosition !== -1) {
          videoId = videoId.substring(0, questionMarkPosition);
        }
        iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?controls=1`;
      } else if (link.includes("spotify.com")) {
        iframeRef.current.src = `https://open.spotify.com/embed${link.split("spotify.com")[1]
          }`;
      } else if (link.includes("music.apple.com")) {
        const embedLink = link.replace(
          "https://music.apple.com/",
          "https://embed.music.apple.com/"
        );
        iframeRef.current.src = embedLink;
      } else {
        setIsBug(true);
        iframeRef.current.src = "";
      }
    }
  };

  const restartSpotify = () => {
    if (iframeRef.current) {
      iframeRef.current.src = defaultSpotifyPlaylist;
    }
    setMusicLink("");
  };

  return (
    <div>
      <div
        id="playerWindow"
        className="absolute rounded-lg shadow-lg bg-gray-800"
        style={{
          width: "352px", // Fixed width
          height: "206px", // Fixed height
          top: position.top,
          right: position.right,
          left: position.left,
          display: isVisible ? "block" : "none", // ซ่อนหน้าต่างโดยไม่ถอดออกจาก DOM
        }}
      >
        <div
          className="cursor-move rounded-t-lg bg-gray-800 border-b border-gray-500 text-white p-2 flex justify-between items-center select-none"
          onMouseDown={handleDragStart}
        >
          Music Player
          <div className="flex gap-2">
            <button
              className="text-white bg-transparent rounded-full w-6 h-6 flex items-center justify-center"
              onClick={onClose}
            >
              &#8212;
            </button>
          </div>
        </div>

        <div
          id="musicPlayerContent"
          className="h-full flex flex-col bg-gray-800 rounded-lg"
        >

          {!isBug ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full rounded-lg"
              src={defaultSpotifyPlaylist}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex justify-center items-center h-full text-white text-sm">Music can play only Youtube Spotify Apple music</div>
          )}
          {/* div ข้างล่างสำหรับ input และปุ่ม */}
          <div className="flex gap-4 w-full bg-gray-800 py-2 px-2 rounded-lg flex-shrink-0">
            <input
              type="text"
              id="musicLink"
              placeholder="Enter YouTube, Spotify, or Apple Music link"
              className="border border-gray-400 bg-gray-700 text-sm text-white rounded-md px-2 py-1 shadow focus:outline-none focus:border-gray-400 w-64"
              value={musicLink}
              onChange={(e) => setMusicLink(e.target.value)}
            />
            <button
              onClick={() => playMusic(musicLink)}
              className="text-sm py-1 px-2.5 text-gray-800 bg-violet-300 hover:bg-violet-500 rounded-md"
            >
              Play
            </button>
            <button
              onClick={restartSpotify}
              className="text-white text-left bg-transparent rounded-md"
            >
              <FontAwesomeIcon icon={faRotateLeft} size="md" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
