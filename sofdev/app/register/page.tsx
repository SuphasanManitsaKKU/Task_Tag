"use client"; // ทำให้ component นี้เป็น Client Component

import axios from "axios";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function Register(e: any) {
    e.preventDefault(); // ป้องกันการโหลดหน้าใหม่

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please fill in all fields.',
      });
      return;
    }

    try {
      // ส่งข้อมูลการสมัครไปที่ API และรอผลลัพธ์
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/register`, {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_MYHOST_API}/register`, {
        username: username,
        email: email,
        password: password,
      });

      // แสดงข้อความเมื่อสร้างบัญชีสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'User Created',
        text: 'Your account has been successfully created!',
      }).then(() => {
        router.push('/'); // เปลี่ยนเส้นทางไปยังหน้าแรก
      });
    } catch (error) {
      console.log(error);

      // แสดงข้อความเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create account. Please try again.',
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <div className="w-full max-w-md">
        <form className="bg-gray-800 shadow-md rounded-xl px-8 pt-6 pb-8 mb-4" onSubmit={Register}>
          <div className="flex items-center justify-center">
            <h1 className="text-3xl text-white font-bold mb-8">Register</h1>
          </div>
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
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="username"
              placeholder="กรอก Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            <Link className="flex gap-2 text-sm text-white hover:text-pink-300" href="./">
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
              Back
            </Link>
            <button
              className="btn custom-green hover:bg-violet-500 bg-violet-300 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
