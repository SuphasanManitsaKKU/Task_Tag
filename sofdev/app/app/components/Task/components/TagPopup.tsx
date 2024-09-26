import React from 'react';

interface TagPopupProps {
  newTagName: string;
  onNewTagNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onCreateTag: () => void;
}

const TagPopup: React.FC<TagPopupProps> = ({
  newTagName,
  onNewTagNameChange,
  onClose,
  onCreateTag
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
      <form
        className="bg-gray-800 border border-gray-500 p-6 rounded-lg shadow-md max-w-sm w-full"
        onSubmit={e => {
          e.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ
          onCreateTag(); // ฟังก์ชันที่จะทำงานเมื่อ submit form
        }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Create Tag</h2>
        <input
          type="text"
          value={newTagName}
          onChange={onNewTagNameChange}
          className="border border-gray-300 p-2 rounded-md w-full mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="Tag Name"
          autoFocus // ทำให้ cursor อยู่ที่ช่องนี้ทันทีเมื่อ component โหลด
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className=" text-white py-2 px-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-violet-300 text-gray-800 py-2 px-4 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          >
            Create
          </button>
        </div>
      </form>
    </div>


  );
};

export default TagPopup;
