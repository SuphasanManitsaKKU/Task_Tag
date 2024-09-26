'use client';

import axios from "axios";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Page({ params }: { params: { slug: string } }) {
  const token = params.slug;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function Send() {
    try {
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/changepassword`, {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_MYHOST_API}/changepassword`, {
        token: token,
        password: password,
        confirmPassword: confirmPassword,
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Please check your email to reset your password.',
      }).then(() => {
        router.push('/'); // ใช้ router navigation ที่ถูกต้อง
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Please check your email.',
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mb-8 text-white">Change Password</h1>
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
          <Link className="flex gap-2 text-sm text-white hover:text-pink-300" href="/">
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
              Back
            </Link>
            <button
              className="btn custom-green hover:bg-violet-600 bg-violet-300 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
              type="button"
              onClick={Send}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
