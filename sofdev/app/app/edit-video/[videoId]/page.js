"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // ใช้ SweetAlert2
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function EditVideoPage({ params }) {
  const { videoId } = params;
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const router = useRouter();

  // ฟังก์ชันดึงข้อมูลวิดีโอที่ต้องการแก้ไข
  const fetchVideo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/videos/${videoId}`);
      const data = await response.json();
      setVideo(data);
      setTitle(data.title); // ตั้งค่า title ที่ดึงมาได้
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  // ฟังก์ชันอัปเดตชื่อวิดีโอ
  const handleUpdateTitle = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/videos/${videoId}/title`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          title: title,
        }),
      });

      if (response.ok) {
        // แสดง SweetAlert เมื่ออัปเดตสำเร็จ
        Swal.fire({
          title: "Success!",
          text: "Title updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          fetchVideo(); // รีเฟรชข้อมูลหลังการอัปเดตสำเร็จ
          router.back(); // กลับไปหน้าก่อนหน้า
        });
      } else {
        Swal.fire({
          title: "Failed!",
          text: "Failed to update the title.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error updating title:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while updating the title.",
        icon: "error",
      });
    }
  };

  // ดึงข้อมูลวิดีโอเมื่อ component ถูก mount
  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  if (!video) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700">
      <div className="bg-gray-800 shadow-lg rounded-xl p-8 max-w-md w-full">
        <button
          onClick={() => router.back()}
          className="bg-violet-300 text-gray-800 px-4 py-2 rounded-md mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-md me-2" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-4 text-center text-white">Edit Video Title</h1>

        {/* แสดงวิดีโอที่ดึงมา */}
        <div className="flex justify-center mb-4">
          <video
            src={`${process.env.NEXT_PUBLIC_BACKGROUND_API_URL}/stream/videos/stream/${video.fileName}`}
            controls
            className="w-74 h-64 object-cover rounded-lg"
          />
        </div>

        {/* ฟอร์มแก้ไขชื่อ */}
        <form onSubmit={handleUpdateTitle}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md"
              required
            />
          </div>
          <button type="submit" className="bg-violet-300 text-gray-800 px-4 py-2 rounded w-full">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
