'use client';
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
// import { jwtDecode } from "jwt-decode";  // ใช้ jwt-decode เพื่อถอดรหัส JWT token

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    async function Login(event: any) {
        event.preventDefault();

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_MYHOST_API}/login`, {
                email: email,
                password: password,
            }, {
                withCredentials: true, // ส่งและรับคุกกี้จาก server
            });

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'You have successfully logged in!',
            }).then(() => {
                router.push('/app');  // เปลี่ยนหน้าไปที่ app
            });

        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Please check your email and password.',
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
            <h1 className="text-3xl text-white font-bold mb-8">Focus Space Online</h1>
            <div className="w-full max-w-md">
                <form className="bg-gray-800 shadow-md rounded-xl px-8 pt-6 pb-8 mb-4" onSubmit={Login}>
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="กรอกอีเมล"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="กรอกรหัสผ่าน"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Link className="inline-block underline text-sm text-white hover:text-pink-300" href="./register">
                            Register
                        </Link>
                        <Link className="inline-block underline align-baseline text-sm text-gray-400 hover:text-pink-300" href="./forgot_password">
                            Forgot Password?
                        </Link>
                        <button
                            className="btn custom-green text-gray-800 bg-violet-300 hover:bg-violet-500 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
