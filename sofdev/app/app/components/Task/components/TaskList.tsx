// TaskList.tsx
import React from 'react';
import { Task, Tag } from './types';

interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  selectedTagFilter: string | null;
  setSelectedTagFilter: React.Dispatch<React.SetStateAction<string | null>>;
  onAddTaskClick: () => void;
  onTaskStatusChange: (taskId: string, currentStatus: boolean) => void;
  onDeleteTagFromTask: (taskId: string, tagId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTagToTaskClick: (taskId: string) => void;
  setShowTagSelectionPopup: (show: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  tags,
  selectedTagFilter,
  setSelectedTagFilter,
  onAddTaskClick,
  onTaskStatusChange,
  onDeleteTagFromTask,
  onDeleteTask,
  onAddTagToTaskClick,
  setShowTagSelectionPopup,
}) => {
  return (
    <div className="px-6 py-2 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-white">Tasks</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedTagFilter || ''}
            onChange={(e) => setSelectedTagFilter(e.target.value)}
            className="px-2 py-1 bg-gray-700 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-gray-500 transition ease-in-out duration-200"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.tagName}
              </option>
            ))}
          </select>
          <button
            className="text-gray-800 bg-violet-300 px-2 py-1 rounded-lg hover:bg-violet-500 transition ease-in-out duration-200 shadow-md"
            onClick={onAddTaskClick}
          >
            + Add Task
          </button>
        </div>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="flex flex-col justify-center items-start mb-4 p-4 bg-gray-700 rounded-lg shadow-md transition ease-in-out duration-200 hover:bg-gray-500">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.taskStatus}
                  onChange={() => onTaskStatusChange(task.id, task.taskStatus)}
                  className="mr-3 h-4 w-4"
                />
                <span className={task.taskStatus ? 'line-through text-gray-400' : 'text-white'}>
                  {task.taskDescription}
                </span>
              </div>
              <button
                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition ease-in-out duration-200 shadow-sm"
                onClick={() => onDeleteTask(task.id)}
              >
                Delete
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.tag?.map(tag => (
                <span key={tag.id} className="inline-flex items-center bg-gray-600 text-white py-1 px-2 rounded-lg shadow-sm">
                  {tag.tagName}
                  <button
                    className="text-red-500 ml-2 hover:text-red-700 transition ease-in-out duration-200"
                    onClick={() => onDeleteTagFromTask(task.id, tag.id)}
                  >
                    x
                  </button>
                </span>
              ))}
              <button
                className="bg-transparent text-gray-800 bg-violet-300 py-1 px-2 rounded-lg hover:bg-violet-500 transition ease-in-out duration-200 shadow-sm"
                onClick={() => {
                  onAddTagToTaskClick(task.id);
                  setShowTagSelectionPopup(true);
                }}
              >
                Add Tag
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>


  );
};

export default TaskList;
