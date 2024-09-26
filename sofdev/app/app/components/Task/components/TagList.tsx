import React, { useState } from 'react';
import { Tag } from './types';

interface TagListProps {
  tags: Tag[];
  onAddTagClick: () => void;
  onDeleteTag: (tagId: string) => void;
}



const TagList: React.FC<TagListProps> = ({ tags, onAddTagClick, onDeleteTag }) => {
  const [isTagListCollapsed, setIsTagListCollapsed] = useState<boolean>(false);

  // Function to toggle the collapse state
  const toggleTagList = () => {
    setIsTagListCollapsed((prevState) => !prevState);
  };
  return (
    <div className="mb-2 p-3 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center" onClick={toggleTagList}>
        <h2 className="font-bold text-white">Tags</h2>
        <button
          className="text-gray-800 bg-violet-300  py-1 px-2 rounded-lg hover:bg-violet-500 transition ease-in-out duration-200 shadow-md"
          onClick={onAddTagClick}
        >
          + Create Tag
        </button>
      </div>
      {!isTagListCollapsed && (
        <ul>
          {tags.map(tag => (
            <li key={tag.id} className="flex justify-between items-center my-2 p-2 bg-gray-700 rounded-lg shadow-sm transition ease-in-out duration-200 hover:bg-gray-500">
              <span className="text-white">{tag.tagName}</span>
              <button
                className="bg-red-500 text-white py-1 px-2 rounded-lg hover:bg-red-600 transition ease-in-out duration-200 shadow-sm"
                onClick={() => onDeleteTag(tag.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

  );
};

export default TagList;
