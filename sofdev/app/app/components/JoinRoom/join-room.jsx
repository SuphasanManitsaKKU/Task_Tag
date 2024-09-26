"use client";
import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import Draggable from 'react-draggable';
import Alert from './Alert'; // ตรวจสอบให้แน่ใจว่าไฟล์ Alert.js อยู่ในตำแหน่งเดียวกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const VideoConference = ({ isVisible, onClose, userID, userName }) => {
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState(null);
    const [peers, setPeers] = useState({});
    const [roomID, setRoomID] = useState('');
    const [inRoom, setInRoom] = useState(false);
    // const [userID, setUserID] = useState(userNameInputRef);
    // const [userName, setUserName] = useState('');
    const [messages, setMessages] = useState([]);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [message, setMessage] = useState(''); // สถานะข้อความที่กำลังพิมพ์

    const localVideoRef = useRef();
    const chatEndRef = useRef(); // Ref สำหรับการเลื่อนกล่องข้อความไปที่อันล่าสุด
    const peersRef = useRef({});

    useEffect(() => {
        const newSocket = io('wss://witchakornb.azurewebsites.net/');
        setSocket(newSocket);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = currentStream;
                    // Add the Tailwind class to flip the video horizontally
                    localVideoRef.current.classList.add('scale-x-[-1]');
                }
                addAlert('Accessed media devices successfully.', 'success');
            })
            .catch((error) => {
                console.error("Error accessing media devices.", error);
                addAlert('Error accessing media devices.', 'error');
            });

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);


    useEffect(() => {
        if (socket == null || stream == null) return;

        socket.on('user-connected', (user) => {
            handleUserConnected(user);
            addAlert(`${user.Socket_userName} connected.`, 'info');
        });

        socket.on('all-users', (users) => {
            handleAllUsers(users);
        });

        socket.on('signal', handleReceiveSignal);

        socket.on('user-left', (user) => {
            handleUserLeft(user);
            addAlert(`${user.Socket_userName} left the room.`, 'info');
        });

        socket.on('chat-message', ({ sender, message }) => {
            setMessages((msgs) => [...msgs, { sender, message }]);
            scrollToBottom(); // เลื่อนข้อความไปที่ข้อความล่าสุดเมื่อมีข้อความใหม่
        });

        socket.on('chat-history', (history) => {
            setMessages(history);
            addAlert('Loaded chat history.', 'success');
            scrollToBottom(); // เลื่อนข้อความไปที่ข้อความล่าสุดเมื่อโหลดประวัติการแชท
        });

        socket.on('forced-disconnect', () => {
            addAlert('You have been disconnected because your account was used elsewhere.', 'error');
            socket.disconnect();
        });

        return () => {
            socket.off('user-connected');
            socket.off('all-users');
            socket.off('signal');
            socket.off('user-left');
            socket.off('chat-message');
            socket.off('chat-history');
            socket.off('forced-disconnect');
        };
    }, [socket, stream]);

    useEffect(() => {
        if (!isMinimized && localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
        }
    }, [isMinimized, stream]);

    const addAlert = (message, type) => {
        const id = Date.now();
        setAlerts((prevAlerts) => [...prevAlerts, { id, message, type }]);
    };

    const removeAlert = (id) => {
        setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
    };

    const handleUserConnected = (user) => {
        const { Socket_id, Socket_userName } = user;
        const peer = createPeer(Socket_id, socket.id, stream);
        peersRef.current[Socket_id] = { peer, userName: Socket_userName };
        setPeers((users) => ({ ...users, [Socket_id]: { peer, userName: Socket_userName } }));
    };

    const handleAllUsers = (users) => {
        users.forEach((user) => {
            const { Socket_id, Socket_userName } = user;
            const peer = addPeer(Socket_id, stream);
            peersRef.current[Socket_id] = { peer, userName: Socket_userName };
            setPeers((users) => ({ ...users, [Socket_id]: { peer, userName: Socket_userName } }));
        });
    };

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        });

        peer.on('signal', (signal) => {
            socket.emit('signal', { target: userToSignal, signal });
        });

        peer.on('error', (err) => console.error('Peer error:', err));

        return peer;
    };

    const addPeer = (userToSignal, stream) => {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        });

        peer.on('signal', (signal) => {
            socket.emit('signal', { target: userToSignal, signal });
        });

        peer.on('error', (err) => console.error('Peer error:', err));

        return peer;
    };

    const handleReceiveSignal = ({ signal, sender }) => {
        if (peersRef.current[sender]) {
            peersRef.current[sender].peer.signal(signal);
        } else {
            const peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream,
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                ],
            });

            peer.on('signal', (signal) => {
                socket.emit('signal', { target: sender, signal });
            });

            peer.on('stream', (remoteStream) => {
                if (peersRef.current[sender] && peersRef.current[sender].videoRef) {
                    peersRef.current[sender].videoRef.srcObject = remoteStream;
                }
            });

            peer.on('error', (err) => console.error('Peer error:', err));

            peer.signal(signal);

            peersRef.current[sender] = { peer, userName: 'User', videoRef: null };
            setPeers((users) => ({ ...users, [sender]: { peer, userName: 'User' } }));
        }
    };

    const handleUserLeft = (user) => {
        const { Socket_id } = user;
        if (peersRef.current[Socket_id]) {
            peersRef.current[Socket_id].peer.destroy();
            delete peersRef.current[Socket_id];
            setPeers((users) => {
                const newUsers = { ...users };
                delete newUsers[Socket_id];
                return newUsers;
            });
        }
    };

    const joinRoom = () => {
        if (!roomID || !userID || !userName) {
            addAlert('Please enter Room ID, User ID, and User Name.', 'error');
            return;
        }
        socket.emit('join-room', roomID, userID, userName);
        addAlert(`Joined room ${roomID} as ${userName}.`, 'success');
        setInRoom(true); // ตั้งค่า inRoom เป็น true เมื่อเข้าร่วมห้อง
    };

    const createRoom = () => {
        if (!userID || !userName) {
            addAlert('Please enter User ID and User Name.', 'error');
            return;
        }
        const newRoomID = generateRoomID();
        setRoomID(newRoomID);
        socket.emit('create-room', newRoomID, userID, userName);
        addAlert(`Created and joined room ${newRoomID} as ${userName}.`, 'success');
        setInRoom(true); // ตั้งค่า inRoom เป็น true เมื่อสร้างห้อง
    };

    const sendMessage = () => {
        if (message.trim() && roomID) {
            socket.emit('chat-message', { roomID, message });
            setMessages((msgs) => [...msgs, { sender: 'You', message }]);
            setMessage(''); // ล้างข้อความหลังส่ง
            scrollToBottom(); // เลื่อนกล่องข้อความไปที่ข้อความล่าสุด
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !isVideoEnabled;
            setIsVideoEnabled(!isVideoEnabled);
            addAlert(isVideoEnabled ? 'Video disabled.' : 'Video enabled.', 'info');
        }
    };

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !isAudioEnabled;
            setIsAudioEnabled(!isAudioEnabled);
            addAlert(isAudioEnabled ? 'Audio disabled.' : 'Audio enabled.', 'info');
        }
    };

    const leaveRoom = () => {
        // ใช้ SweetAlert เพื่อถามการยืนยัน
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to leave room?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Yes, leave room',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // เมื่อผู้ใช้ยืนยันการออกจากห้อง
                if (socket && roomID) {
                    socket.emit('leave-room', roomID);
                    if (stream) {
                        stream.getTracks().forEach((track) => track.stop());
                    }
                    addAlert(`Left room ${roomID}.`, 'info');
                    setInRoom(false); // ตั้งค่า inRoom เป็น false เมื่อออกจากห้อง
                    window.location.reload();
                }
            }
        });
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const generateRoomID = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // ฟังก์ชันเลื่อนกล่องข้อความไปที่ข้อความล่าสุด
    const scrollToBottom = () => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        // <div className="container mx-auto p-4">
        <div className="">
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
                {alerts.map(alert => (
                    <Alert key={alert.id} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
                ))}
            </div>
            <div
                className={`absolute top-[4.5rem] right-[20%] h-fit w-72 bg-gray-800 bg-opacity-100 rounded-lg shadow-lg flex flex-col transform transition-transform duration-500 ease-out z-30`}
                style={{ display: isVisible ? 'block' : 'none' }}
            >
                <div className="flex-none border-b border-gray-500">
                    <div className="cursor-move bg-gray-800 text-white rounded-md p-2 flex justify-between items-center select-none">
                        Join Room
                        <div className="flex gap-2">
                            <button className="text-white bg-transparent rounded-full w-6 h-6 flex items-center justify-center" onClick={onClose}>
                                &#8212;
                            </button>
                        </div>
                    </div>
                </div>
                {/* <div className="absolute top-2 left-2 h-5/6 w-72 bg-white bg-opacity-100 p-4 rounded-lg shadow-lg flex flex-col z-30"> */}

                {/* ส่วนคำว่า Select a Video */}
                <h1 className="text-center text-white text-xl font-bold my-4">Focus Space Online</h1>
                <div className="flex flex-col items-center justify-center gap-6 mb-6">
                    {/* Input for Room ID */}
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomID}
                        onChange={(e) => setRoomID(e.target.value)}
                        className="border border-gray-400 bg-gray-700 text-white rounded-lg px-4 py-2 shadow focus:outline-none focus:border-gray-400 w-64 text-center"
                    />

                    {/* Buttons for Room Actions */}
                    <div className="flex gap-2">
                        {!inRoom ? (
                            <>
                                <button
                                    onClick={createRoom}
                                    className="border text-white w-32 px-1 py-2 rounded-lg shadow-md hover:bg-gray-500 transition duration-300 text-center"
                                >
                                    + Create Room
                                </button>
                                <button
                                    onClick={joinRoom}
                                    className="bg-violet-300 text-gray-800 w-32 px-1 py-2 rounded-lg shadow-md hover:bg-violet-500 transition duration-300 text-center"
                                >
                                    Join Room
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={leaveRoom}
                                className="bg-red-500 text-white w-64 px-1 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300 text-center"
                            >
                                Leave Room
                            </button>
                        )}
                    </div>

                    {/* Buttons for Video and Audio Toggles */}
                    <div className="flex gap-2">
                        <button
                            onClick={toggleVideo}
                            className="bg-gray-600 text-white w-32 px-1 py-3 rounded-lg shadow-md hover:bg-gray-700 transition duration-300 flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={isVideoEnabled ? faVideo : faVideoSlash} />

                        </button>

                        <button
                            onClick={toggleAudio}
                            className="bg-gray-600 text-white w-32 px-1 py-3 rounded-lg shadow-md hover:bg-gray-700 transition duration-300 flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash} />

                        </button>
                    </div>
                </div>
            </div>
            {/* Draggable Video & Chat Container */}
       
                <div
                    className={`handle fixed right-0 top-[4.5rem] bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center overflow-y-auto transition-all duration-300 ${isMinimized ? 'h-16 w-72 justify-center' : 'h-[90vh] w-72'
                        }`}
                    style={{ cursor: 'move' }}
                >
                    {/* Header with minimize button */}
                    <div className={`flex justify-between items-center w-full duration-500 ${isMinimized ? 'mb-0' : 'mb-4'}`}>
                        <h2 className="text-md font-bold text-white">Video & Chat</h2>
                        <button
                            onClick={toggleMinimize}
                            className="text-white  hover:text-gray-300"
                        >
                            {isMinimized ? "⤢" : "⤡"}
                        </button>
                    </div>
                    {/* ซ่อนแสดงเนื้อหาโดยใช้ CSS แทนการทำ Conditional Rendering */}
                    <div className={`${isMinimized ? 'hidden' : 'block'} w-full transition-all duration-300`}>
                        {/* Local Video */}
                        <div className="video-container mb-4">
                            <video ref={localVideoRef} autoPlay muted className="rounded shadow w-full" />
                            <p className="text-center text-white mt-1">{userName || 'You'}</p>
                        </div>
                        {/* Chat Box */}
                        <div className=" bg-gray-700 p-2 rounded-md shadow w-full h-40 mb-4 overflow-y-scroll">
                            <h2 className="text-xl font-bold mb-2 text-white">Chat</h2>
                            {messages.map((msg, index) => (
                                <p key={index} className='break-words text-white'><strong>{msg.sender}:</strong> {msg.message}</p>
                            ))}
                            <div ref={chatEndRef}></div> {/* Ref สำหรับเลื่อนกล่องข้อความไปที่ข้อความล่าสุด */}
                        </div>
                        <div className="flex w-full">
                            <input
                                type="text"
                                placeholder="Type your message"
                                className="border border-gray-400 bg-gray-700 text-white rounded-md p-2 shadow focus:outline-none focus:border-gray-400 w-full"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)} // อัปเดตสถานะ message
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-violet-300 text-gray-800 hover:bg-violet-500 px-4 py-2 rounded-md shadow ml-2"
                            >
                                Send
                            </button>
                        </div>
                        {/* Peers Videos */}
                        {Object.entries(peers).map(([peerID, { peer, userName }]) => (
                            <PeerVideo key={peerID} peer={peer} userName={userName} />
                        ))}
                    </div>
                </div>
    
        </div>
    );
};

// คอมโพเนนต์สำหรับวิดีโอของเพื่อน
const PeerVideo = ({ peer, userName }) => {
    const ref = useRef();

    useEffect(() => {
        if (!peer) return;

        const handleStream = (stream) => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        };

        peer.on('stream', handleStream);

        if (peer.streams && peer.streams[0]) {
            handleStream(peer.streams[0]);
        }

        peer.on('error', (err) => console.error('Peer error:', err));

        return () => {
            peer.off('stream', handleStream);
        };
    }, [peer]);

    return (
        <div className="video-container mb-4">
            <video ref={ref} autoPlay playsInline className="rounded max-w-full mt-3" />
            <p className="text-center text-white mt-1">{userName}</p>
        </div>
    );
};

export default VideoConference;
