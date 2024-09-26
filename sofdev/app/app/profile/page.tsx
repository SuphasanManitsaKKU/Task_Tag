'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // เพิ่มการนำเข้า SweetAlert
import Link from 'next/link';

interface UserData {
    username: string;
    email: string;
}

export default function Profile() {
    const [userId, setUserId] = useState("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/getCookie`);
            setUserId(response.data.userId);
            const response_2 = await axios.get(`${process.env.NEXT_PUBLIC_MYHOST_API}/getuerdata/${response.data.userId}`, {
                withCredentials: true
            });
            console.log(response_2.data);

            setUserData(response_2.data);
            setUsername(response_2.data.username);
            setEmail(response_2.data.email);
        } catch (error) {
            console.error('There was an error fetching the userId:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (changePassword && password !== confirmPassword) {
            Swal.fire('Error', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน', 'error');
            return;
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_MYHOST_API}/changepassword_v2`, {
                userId: userId,
                username,
                password: changePassword ? password : '',
                confirmPassword: changePassword ? confirmPassword : ''
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                Swal.fire('Success', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success').then(() => {
                    setIsEditing(false);
                    fetchData(); // เรียก fetchData เพื่อรีเฟรชข้อมูล
                });
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        }
    };

    if (!userData) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
            <div className="w-full max-w-md mx-auto p-6 bg-gray-800 shadow-md rounded-xl">
                <h1 className="text-2xl text-white text-center font-semibold mb-6">Profile</h1>
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white font-medium">Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-medium">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                                className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={changePassword}
                                onChange={(e) => setChangePassword(e.target.checked)}
                                className="mr-2"
                            />
                            <label className="text-white font-medium">Change Password</label>
                        </div>
                        {changePassword && (
                            <>
                                <div>
                                    <label className="block text-white font-medium">Password:</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium">Confirm Password:</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-violet-300 text-gray-800 rounded-md shadow hover:bg-violet-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-300 text-black rounded-md shadow hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-white"><strong>Username:</strong> {userData?.username}</p>
                        <p className="text-white"><strong>Email:</strong> {userData?.email}</p>
                        <p className="text-white"><strong>Password:</strong> ***************</p>
                        <div className="flex justify-between items-center gap-5">
                            <Link href="/app" className="px-4 py-2 bg-gray-300 text-black rounded-lg shadow hover:bg-gray-400" >
                                Back
                            </Link>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-violet-300 text-gray-800 rounded-lg shadow hover:bg-violet-600"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
