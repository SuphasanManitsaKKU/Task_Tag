import React from 'react';
import { Tag } from './types';

interface TagSelectionPopupProps {
  tags: Tag[];
  onClose: () => void;
  onSelectTag: (tagId: string) => void;
}

const TagSelectionPopup: React.FC<TagSelectionPopupProps> = ({
  tags,
  onClose,
  onSelectTag
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-gray-800 border border-gray-500 p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-semibold text-white mb-4">Select Tag</h2>
        <ul>
          {tags.map(tag => (
            <li key={tag.id} className="flex justify-between items-center mb-2 p-2 bg-gray-700 rounded-md shadow-sm hover:bg-gray-500 transition duration-150">
              <span className="text-white">{tag.tagName}</span>
              <button
                className="bg-transparent border text-white py-1 px-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                onClick={() => onSelectTag(tag.id)}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button
            className="bg-violet-300 text-gray-800 py-2 px-4 rounded-md hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>

  );
};

export default TagSelectionPopup;
