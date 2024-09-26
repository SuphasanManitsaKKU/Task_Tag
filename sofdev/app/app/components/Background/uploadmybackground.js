"use client";

import { useState, useEffect, useRef } from "react"; // เพิ่ม useRef
import Swal from "sweetalert2"; // เพิ่มการ import SweetAlert2
import Link from "next/link"; // เพิ่มการ import Link
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function UserVideosPage({ params }) {

  const userId = params; // รับ userId จาก parameter
  console.log("IIIIIIIIIIII");
  console.log(userId);
  console.log("IIIIIIIIIIII");

  const [username, setUsername] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploadResponse, setUploadResponse] = useState("");
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัปโหลดวิดีโอ
  const fileInputRef = useRef(null); // ใช้ useRef เพื่ออ้างถึง input file

  // ฟังก์ชันดึงข้อมูลวิดีโอของผู้ใช้ตาม userId
  const fetchUserVideos = async () => {
    try {
      const response_2 = await axios.get(`${process.env.NEXT_PUBLIC_MYHOST_API}/getuerdata/${userId}`, {
        withCredentials: true
      });

      setUsername(response_2.data.username);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/videos/user/${userId}`
      );

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching user videos:", error);
      console.log("Error fetching userId", error);
    }
  };

  // ฟังก์ชันยืนยันและลบวิดีโอ
  const deleteVideo = async (videoId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/delete/${videoId}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
            });
            // รีเฟรชรายการวิดีโอหลังจากลบเสร็จ
            fetchUserVideos();
          } else {
            Swal.fire({
              title: "Failed!",
              text: "Failed to delete the video.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the video.",
            icon: "error",
          });
        }
      }
    });
  };

  // ฟังก์ชันสำหรับการอัปโหลดวิดีโอใหม่
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      alert("Please provide both file and title.");
      return;
    }

    // แสดงการแจ้งเตือนการอัปโหลด
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while your video is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // แสดงการโหลดระหว่างการอัปโหลด
      },
    });

    setIsUploading(true); // ตั้งค่าสถานะการอัปโหลดวิดีโอ

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("userId", userId); // ส่ง userId ไปพร้อมกับข้อมูล

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Your video has been uploaded successfully.",
          icon: "success",
        });
        setUploadResponse("Video uploaded successfully!");
        fetchUserVideos(); // รีเฟรชรายการวิดีโอ

        // รีเซ็ตค่า input file และ title หลังการอัปโหลดสำเร็จ
        setSelectedFile(null); // รีเซ็ต state
        setTitle(""); // ล้างชื่อวิดีโอ
        fileInputRef.current.value = ""; // ล้างค่า input file โดยตรง
      } else {
        Swal.fire({
          title: "Failed!",
          text: "Failed to upload the video.",
          icon: "error",
        });
        setUploadResponse("Failed to upload video.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while uploading the video.",
        icon: "error",
      });
      setUploadResponse("Error uploading video.");
    } finally {
      setIsUploading(false); // ปิดสถานะการอัปโหลดหลังจากเสร็จสิ้น
    }
  };

  useEffect(() => {
    fetchUserVideos();
  }, [userId]);

  return (
    <div className="p-8 bg-gray-900 min-h-screen"> {/* เปลี่ยนเป็น bg-gray-900 เพื่อให้ต่างจาก bg ของ component */}
      <Link href="/app" className="btn bg-violet-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-violet-500">
        <FontAwesomeIcon icon={faArrowLeft} className="text-md me-2" />
        Back
      </Link>
      <h1 className="text-3xl font-bold mb-6 mt-6 text-white">
        Your Uploaded Video Backgrounds, {username}
      </h1>
      <p className="mb-6 text-gray-400">
        On this page, you can view all the video backgrounds you have uploaded.
        These videos will be shared with other users and featured on the main
        home page. Thank you for contributing to our community!
      </p>

      {/* ฟอร์มอัปโหลดวิดีโอใหม่ */}
      <div className="mb-10 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-lg text-white font-semibold mb-4">Upload Background Video</h2>
        <form onSubmit={handleFileUpload}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-600 p-2 w-full rounded-md bg-white text-gray-900"
              required
              disabled={isUploading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white">Select Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="border border-gray-600 p-2 w-full rounded-md bg-white text-gray-900"
              required
              disabled={isUploading}
              ref={fileInputRef}
            />
          </div>
          <button
            type="submit"
            className="bg-violet-300 text-gray-800 px-4 py-2 rounded-lg w-full hover:bg-violet-500 mt-2"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
          {uploadResponse && (
            <p className="mt-2 text-green-500">{uploadResponse}</p>
          )}
        </form>
      </div>

      {/* ตารางแสดงรายการวิดีโอ */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-white">Your Background Videos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-600 rounded-xl">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b border-gray-600 text-left text-white">Thumbnail</th>
                <th className="py-3 px-4 border-b border-gray-600 text-left text-white">Title</th>
                <th className="py-3 px-4 border-b border-gray-600 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="py-3 px-4 border-b border-gray-600">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream${video.thumbnailUrl}`}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-md"
                    />
                  </td>
                  <td className="py-3 px-4 border-b border-gray-600 text-white">{video.title}</td>
                  <td className="py-3 px-4 border-b border-gray-600">
                    <Link href={`/app/edit-video/${video.id}`}>
                      <button
                        className="bg-orange-400 text-white px-4 py-2 rounded-lg me-2 hover:bg-orange-600"
                        disabled={isUploading}
                      >
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      disabled={isUploading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
