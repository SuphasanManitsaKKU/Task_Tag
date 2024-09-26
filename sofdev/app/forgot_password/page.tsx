'use client';
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // ใช้ useState เพื่อจัดการกับค่าของอีเมล

  async function Send() {
    try {
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/forgotpassword`, {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_MYHOST_API}/forgotpassword`, {
        email: email,
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Please check your email to reset your password.',
      }).then(() => {
        router.push('/'); // ใช้ router navigation ที่ถูกต้อง
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error sending the email. Please try again later.',
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mb-8 text-white">Forgot Password</h1>
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
              onChange={(e) => setEmail(e.target.value)} // จัดการกับการเปลี่ยนแปลงของฟิลด์อินพุต
            />
          </div>
          <div className="flex items-center justify-between">
          <Link className="flex gap-2 text-sm text-white hover:text-pink-300" href="./">
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
              Back
            </Link>
            <button onClick={Send} className="btn text-gray-800 custom-green hover:bg-violet-600 bg-violet-300 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline" type="button">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
