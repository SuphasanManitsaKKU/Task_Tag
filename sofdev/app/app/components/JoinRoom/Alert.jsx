import React, { useEffect, useState } from 'react';

const Alert = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // เริ่มต้นเวลาที่จะปิดการแจ้งเตือน
    const timer = setTimeout(() => {
      setVisible(false);
      // ลบแจ้งเตือนหลังจากแอนิเมชัน fadeOut เสร็จสิ้น (0.5 วินาที)
      setTimeout(() => {
        onClose();
      }, 500);
    }, 2500); // ตั้งเวลาที่ 2.5 วินาทีก่อนที่จะเริ่ม fadeOut

    return () => clearTimeout(timer);
  }, [onClose]);

  // กำหนดสีของแจ้งเตือนตามประเภท
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`fixed top-5 right-5 flex items-center p-4 mb-4 text-white rounded shadow-lg transition-all duration-500 ease-in-out transform ${typeStyles[type] || 'bg-blue-500'
        } ${visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4'
        }`}
      role="alert"
    >
      <span>{message}</span>
    </div>
  );
};

export default Alert;
