"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft ,faGear } from '@fortawesome/free-solid-svg-icons';

export default function Pomodoro({ isVisible, onClose }) {

  // ============================ Start ส่วนการทำงานของ Pomodoro ============================

  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState("pomodoro");
  const [timeLeft, setTimeLeft] = useState(0);
  const [pomodoroRounds, setPomodoroRounds] = useState(0);
  const [volume, setVolume] = useState(25);
  const [timerSound, setTimerSound] = useState("parinyajai");
  const [timer, setTimer] = useState(null);

  const [pomodoroTime, setPomodoroTime] = useState(0.4); // minutes
  const [shortBreakTime, setShortBreakTime] = useState(0.25); // minutes
  const [longBreakTime, setLongBreakTime] = useState(0.3); // minutes
  const [showSettings, setShowSettings] = useState(false);
  const [showTimer, setShowTimer] = useState(true);

  const clearTimerInterval = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const startTimer = () => {
    clearTimerInterval();
    const newTimer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    setTimer(newTimer);
  };

  useEffect(() => {
    if (timeLeft <= 0 && isRunning) {
      clearTimerInterval();
      playSound();
      handleRoundCompletion();
    }
  }, [timeLeft, isRunning]);

  const resetTimer = () => {
    clearTimerInterval();
    setIsRunning(false);
    setPomodoroRounds(0);
    setTimerMode(currentMode);
  };

  const startPauseTimer = () => {
    if (isRunning) {
      clearTimerInterval();
      setIsRunning(false);
    } else {
      startTimer();
      setIsRunning(true);
    }
  };

  const handleRoundCompletion = () => {
    if (currentMode === "pomodoro") {
      setPomodoroRounds((prevPomodoroRounds) => {
        const newRounds = prevPomodoroRounds + 1;
        if (newRounds % 4 === 0) {
          setTimerMode("longBreak");
          console.log("Switching to long break");
        } else {
          setTimerMode("shortBreak");
          console.log("Switching to short break");
        }
        return newRounds;
      });

      if (isRunning) {
        startTimer();
      }
    } else if ((currentMode === "shortBreak") && (pomodoroRounds % 4 === 0)) {
      setIsRunning(false);
      clearTimerInterval();
      console.log("Short break ended, stopping timer");

      setPomodoroRounds(0);
      setTimerMode("pomodoro");

    } else if (currentMode === "shortBreak") {
      setTimerMode("pomodoro");

      if (isRunning) {
        startTimer();
      }

    } else if (currentMode === "longBreak") {
      setIsRunning(false);
      clearTimerInterval();
      console.log("Long break ended, stopping timer");

      setPomodoroRounds(0);
      setTimerMode("pomodoro");
    }
  };

  const playSound = () => {
    const audio = new Audio(`/sounds/${timerSound}.mp3`);
    audio.volume = volume / 100;
    audio.play();
  };

  const setTimerMode = (mode) => {
    setCurrentMode(mode);
    switch (mode) {
      case "pomodoro":
        setTimeLeft(pomodoroTime * 60);
        break;
      case "shortBreak":
        setTimeLeft(shortBreakTime * 60);
        break;
      case "longBreak":
        setTimeLeft(longBreakTime * 60);
        break;
      default:
        setTimeLeft(pomodoroTime * 60);
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    setTimerMode(currentMode);
  }, [currentMode, pomodoroTime, shortBreakTime, longBreakTime]);
  // ============================ End ส่วนการทำงานของ Pomodoro ============================


  //============================ Start ส่วนของการย้ายตำแหน่งของ widget และหน้าต่าง ============================
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ right: 'auto', top: '1%', left: '22%' });
  const [size, setSize] = useState({ width: 300, height: 170 });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // const savedPosition = JSON.parse(localStorage.getItem('widgetPosition'));
    const savedSize = JSON.parse(localStorage.getItem('widgetSize'));

    // if (savedPosition) setPosition(savedPosition);
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

  const saveSettings = () => {
    setShowSettings(false);
    setSize({ width: 300, height: 170 });
    resetTimer();
  };

  const toggleSettings = () => {
    setShowSettings((prevShowSettings) => !prevShowSettings);
    if (showSettings) {
      setSize({ width: 300, height: 170 });
    } else {
      setSize({ width: 300, height: 430 });
    }
  };

  //============================  End ส่วนของการย้ายตำแหน่งของ widget และหน้าต่าง ============================ 

  return (
    <div >
      <div
        id="playerWindow"
        className="absolute overflow-hidden rounded-lg shadow-lg bg-gray-800" // min-w-[300px] min-h-[170px] max-w-[300px] max-h-[430px]
        style={{
          // width: `${size.width}px`,
          // height: `${size.height}px`,
          minWidth: '300px', // กำหนด min-width
          maxWidth: '300px', // กำหนด max-width
          minHeight: '170px', // กำหนด min-height
          maxHeight: '430px', // กำหนด max-height
          top: position.top,
          right: position.right,
          left: position.left,
          display: isVisible ? 'block' : 'none' // ซ่อนหน้าต่างโดยไม่ถอดออกจาก DOM
        }}
      >
        <div className="cursor-move bg-gray-800 border-b border-gray-500 text-white p-2 flex justify-between items-center select-none"
          onMouseDown={handleDragStart}>
          Pomodoro Timer
          <span className="text-sm">
            {Array(pomodoroRounds)
              .fill("●")
              .join("")}
          </span>
          <div className="flex gap-2">
            <button className="text-white bg-transparent rounded-full w-6 h-6 flex items-center justify-center"
              onClick={onClose}
            >
              &#8212;
            </button>
          </div>
        </div>

        <div id="PomodoroContent" className="flex flex-col h-full p-4 bg-gray-800">
          <div>
            <div className="flex justify-center items-center mb-4 gap-4">
              <span className="text-4xl text-white">{formatTime()}</span>
              <button
                className="bg-violet-300 hover:bg-violet-500 text-gray-800 py-2 px-3 rounded-lg text-sm"
                onClick={startPauseTimer}
              >
                {isRunning ? "Pause" : "Start"}
              </button>
              <button
                className="text-white text-2xl"
                onClick={resetTimer}
              >
                <FontAwesomeIcon icon={faRotateLeft} size="xs"/>
              </button>
              <button
                className="text-2xl text-white ms-1"
                onClick={toggleSettings}
              >
                <FontAwesomeIcon icon={faGear} size="xs" />
              </button>
            </div>
            <div className="flex">
              <button
                className={`flex-1 py-1 text-sm ${currentMode === "pomodoro"
                  ? "bg-gray-800 border-b-2 text-white font-semibold"
                  : "bg-gray-800 text-white"
                  }`}
                onClick={() => {
                  setTimerMode("pomodoro");
                  if (isRunning) {
                    startTimer();
                  }
                }}
              >
                Pomodoro
              </button>
              <button
                className={`flex-1 py-1 text-sm ${currentMode === "shortBreak"
                  ? "bg-gray-800 border-b-2 text-white font-semibold"
                  : "bg-gray-800 text-white"
                  }`}
                onClick={() => {
                  setTimerMode("shortBreak");
                  if (isRunning) {
                    startTimer();
                  }
                }}
              >
                Short Break
              </button>
              <button
                className={`flex-1 py-1 text-sm ${currentMode === "longBreak"
                  ? "bg-gray-800 border-b-2 text-white font-semibold"
                  : "bg-gray-800 text-white"
                  }`}
                onClick={() => {
                  setTimerMode("longBreak");
                  if (isRunning) {
                    startTimer();
                  }
                }}
              >
                Long Break
              </button>
            </div>

            {showSettings && (
              <div className="flex flex-col mt-4 ">
                <div className="flex flex-col mb-1">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-white">Pomodoro :</label>
                    <input
                      type="number"
                      className=" rounded p-1 text-center w-44 "
                      value={pomodoroTime}
                      onChange={(e) =>
                        setPomodoroTime(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-white">Short Break :</label>
                    <input
                      type="number"
                      className=" rounded p-1 text-center w-44"
                      value={shortBreakTime}
                      onChange={(e) =>
                        setShortBreakTime(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-white">Long Break :</label>
                    <input
                      type="number"
                      className="rounded p-1 text-center w-44"
                      value={longBreakTime}
                      onChange={(e) =>
                        setLongBreakTime(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col mb-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-white">Sound :</label>
                    <select
                      className="bg-gray-700 text-white rounded p-1 text-sm w-44 h-8"
                      value={timerSound}
                      onChange={(e) => setTimerSound(e.target.value)}
                    >
                      <option value="alarm-clock-short">Alarm Clock Short</option>
                      <option value="alarm-clock">Alarm Clock</option>
                      <option value="house_alarm-clock_loud">House Alarm Clock Loud</option>
                    </select>
                  </div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-white">Volume :</label>
                    <input
                      type="range"
                      className="
                      w-4/6 mt-1 h-1 rounded-lg appearance-none cursor-pointer 
                      bg-violet-300  
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-300
                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 
                      [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-500
                    "
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #c4b5fd ${volume}%, gray ${volume}%)`,
                      }}
                    />
                  </div>
                </div>
                <button
                  className="bg-violet-300 hover:bg-violet-500 text-gray-800 py-2 rounded-lg text-sm"
                  onClick={saveSettings}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
