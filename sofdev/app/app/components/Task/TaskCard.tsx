'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import TagList from './components/TagList';
import TaskList from './components/TaskList';
import TagPopup from './components/TagPopup';
import TaskPopup from './components/TaskPopup';
import TagSelectionPopup from './components/TagSelectionPopup';

import { Tag, Task, TasksAndTagsResponse } from './components/types';

interface Position {
  right: string;
  top: string;
  left: string;
}

interface Offset {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export default function TaskCard({ userId, isVisible, onClose }: { userId: string, isVisible: boolean, onClose: () => void }) {
  // -----------------------------------------------------------------------------------------------------------------------------------
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [position, setPosition] = useState<Position>({ right: 'auto', top: '24%', left: '22%' });
  const [size, setSize] = useState<Size>({ width: 400, height: 300 });
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    // const savedPosition = JSON.parse(localStorage.getItem('widgetPosition') || '{}');
    const savedSize = JSON.parse(localStorage.getItem('widgetSize') || '{}');

    // if (savedPosition && Object.keys(savedPosition).length !== 0) setPosition(savedPosition);
    if (savedSize && Object.keys(savedSize).length !== 0) setSize(savedSize);
  }, []);

  useEffect(() => {
    localStorage.setItem('widgetPosition', JSON.stringify(position));
    localStorage.setItem('widgetSize', JSON.stringify(size));
  }, [position, size]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const maxLeft = windowWidth - size.width;
        const maxTop = windowHeight - size.height;
        let newLeft = e.clientX - offset.x;
        let newTop = e.clientY - offset.y;

        if (newLeft >= maxLeft) newLeft = maxLeft;
        if (newLeft <= 0) newLeft = 0;
        if (newTop <= 0) newTop = 0;
        if (newTop >= maxTop) newTop = maxTop;

        setPosition({ left: `${newLeft}px`, top: `${newTop}px`, right: 'auto' });
      } else if (isResizing) {
        handleResize(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, offset, size]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top });
  };

  const handleResize = (e: MouseEvent) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const newWidth = e.clientX - document.getElementById("playerWindow")!.getBoundingClientRect().left;
    const newHeight = e.clientY - document.getElementById("playerWindow")!.getBoundingClientRect().top;

    if (newWidth > 200 && newWidth + document.getElementById("playerWindow")!.getBoundingClientRect().left <= windowWidth) {
      setSize(prevSize => ({
        ...prevSize,
        width: newWidth,
      }));
    }

    if (newHeight > 200 && newHeight + document.getElementById("playerWindow")!.getBoundingClientRect().top <= windowHeight) {
      setSize(prevSize => ({
        ...prevSize,
        height: newHeight,
      }));
    }
  };
  // -----------------------------------------------------------------------------------------------------------------------------------
















  // const userId = "1";

  const [data, setData] = useState<TasksAndTagsResponse | null>(null);

  // State for popups
  const [showTagPopup, setShowTagPopup] = useState<boolean>(false);
  const [showTaskPopup, setShowTaskPopup] = useState<boolean>(false);
  const [showTagSelectionPopup, setShowTagSelectionPopup] = useState<boolean>(false);

  // State for new tag and task input
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');

  // State for tag selection
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tagsForSelection, setTagsForSelection] = useState<Tag[]>([]);
  // State for tag filter
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<TasksAndTagsResponse>(`${process.env.NEXT_PUBLIC_MYHOST_API}/gettasksandtags/${userId}`, {
          // params: { userid: userId },
          withCredentials: true,
        });
        setData(response.data);
        setTagsForSelection(response.data.tag); // Initialize tags for selection
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle functions
  const handleAddTagClick = () => setShowTagPopup(true);
  const handleAddTaskClick = () => setShowTaskPopup(true);
  const handleCloseTagPopup = () => setShowTagPopup(false);
  const handleCloseTaskPopup = () => setShowTaskPopup(false);


  const handleCreateTag = async () => {
    try {
      const response = await axios.post<Tag>(`${process.env.NEXT_PUBLIC_MYHOST_API}/createtag`, {
        userid: userId,
        tagName: newTagName,
      }, {
        withCredentials: true,
      });
      setNewTagName(''); // Clear input field

      setData(prevData => {
        if (prevData) {
          const updatedData = {
            ...prevData,
            tag: [...prevData.tag, response.data], // อัปเดตแท็กใหม่ใน data
          };
          setTagsForSelection(updatedData.tag); // Initialize tags for selection
          return updatedData;
        }
        return prevData; // หรือ return empty object ตามความต้องการ
      });

      handleCloseTagPopup();

    } catch (error) {
      console.error('Error creating tag:', error);

      // SweetAlert เพื่อแจ้งเตือนว่าเกิดข้อผิดพลาด
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create tag. Tag is created.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await axios.post<Task>(`${process.env.NEXT_PUBLIC_MYHOST_API}/createtask`, {
        userid: userId,
        taskDescription: newTaskDescription,
      }, {
        withCredentials: true,
      });
      setNewTaskDescription(''); // Clear input field

      setData(prevData => prevData ? {
        ...prevData,
        task: [...prevData.task, response.data],
      } : prevData);

      handleCloseTaskPopup();
    } catch (error) {
      console.error('Error creating task:', error);

      // ใช้ SweetAlert2 เพื่อแสดงการแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        title: 'Error!',
        text: 'There was a problem creating the task. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(`${process.env.NEXT_PUBLIC_MYHOST_API}/changetaskstatus`, {
        userid: userId,
        taskId: taskId,
        status: newStatus,
      }, {
        withCredentials: true,
      });

      setData(prevData => prevData ? {
        ...prevData,
        task: prevData.task.map(task =>
          task.id === taskId ? { ...task, taskStatus: newStatus } : task
        ),
      } : prevData);
    } catch (error) {
      console.error('Error changing task status:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    // แสดง SweetAlert2 เพื่อยืนยันการลบ
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This tag will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // ดำเนินการลบแท็ก
        await axios.delete(`${process.env.NEXT_PUBLIC_MYHOST_API}/removetag`, {
          data: { userid: userId, tagId: tagId },
          withCredentials: true,
        });

        setData(prevData => {
          if (prevData) {
            const updatedData = {
              ...prevData,
              tag: prevData.tag.filter(tag => tag.id !== tagId),
              task: prevData.task.map(task => ({
                ...task,
                tag: task.tag.filter(tag => tag.id !== tagId),
              })),
            };

            setTagsForSelection(updatedData.tag);
            return updatedData;
          }
          return prevData;
        });

        Swal.fire('Deleted!', 'The tag has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting tag:', error);
        Swal.fire('Error!', 'There was a problem deleting the tag.', 'error');
      }
    }
  };

  const handleDeleteTagFromTask = async (taskId: string, tagId: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This tag will be removed from the task.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`${process.env.NEXT_PUBLIC_MYHOST_API}/removetagtotask`, {
            userid: userId,
            taskId: taskId,
            tagId: tagId,
          }, {
            withCredentials: true,
          });

          setData(prevData => prevData ? {
            ...prevData,
            task: prevData.task.map(task =>
              task.id === taskId ? {
                ...task,
                tag: task.tag.filter(tag => tag.id !== tagId),
              } : task
            ),
          } : prevData);

          Swal.fire('Removed!', 'The tag has been removed from the task.', 'success');
        } catch (error) {
          console.error('Error removing tag from task:', error);
        }
      }
    });
  };

  const handleAddTagToTask = async (tagId: string) => {
    if (selectedTaskId) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_MYHOST_API}/addtagtotask`, {
          userid: userId,
          taskId: selectedTaskId,
          tagId: tagId,
        }, {
          withCredentials: true,
        });
        setData(prevData => prevData ? {
          ...prevData,
          task: prevData.task.map(task =>
            task.id === selectedTaskId
              ? { ...task, tag: Array.isArray(task.tag) ? [...task.tag, tagsForSelection.find(tag => tag.id === tagId)!] : [tagsForSelection.find(tag => tag.id === tagId)!] }
              : task
          ),
        } : prevData);

        setShowTagSelectionPopup(false);
        setSelectedTaskId(null);
      } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add tag. Tag is selected. ',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        console.error('Error adding tag to task:', error);
        
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_MYHOST_API}/removetask`, {
        data: { userid: userId, taskId: taskId },
        withCredentials: true
      });

      setData(prevData => prevData ? {
        ...prevData,
        task: prevData.task.filter(task => task.id !== taskId),
      } : prevData);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This task will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteTask(taskId);
        Swal.fire('Deleted!', 'The task has been deleted.', 'success');
      }
    });
  };



  if (!data) return <div className='text-black'>Loading...</div>;

  const filteredTasks = selectedTagFilter
    ? data.task.filter(task => task.tag?.some(tag => tag.id === selectedTagFilter))
    : data.task;

  return (
    <div>
      <div
        id="playerWindow"
        className="absolute bg-gray-800 overflow-auto rounded-lg shadow-lg max-w-[350px] min-w-[350px] max-h-[400px] min-h-[400px]"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          top: position.top,
          right: position.right,
          left: position.left,
          display: isVisible ? 'block' : 'none' // ซ่อนหน้าต่างโดยไม่ถอดออกจาก DOM
        }}
      >
        <div className="cursor-move bg-gray-800 border-b border-gray-500  text-white p-2 flex justify-between items-center select-none" onMouseDown={handleDragStart}>
          Task
          <div className="flex gap-2">
            <button className="text-white rounded-full w-6 h-6 flex items-center justify-center" onClick={onClose}>
              &#8212;
            </button>
          </div>
        </div>
        <div id="musicPlayerContent" className="overflow-y-auto bg-gray-800">

          <div>
            <div className="">
              <TagList
                tags={data.tag}
                onAddTagClick={handleAddTagClick}
                onDeleteTag={handleDeleteTag}
              />

              <TaskList
                tasks={filteredTasks}
                tags={data.tag}
                selectedTagFilter={selectedTagFilter}
                setSelectedTagFilter={setSelectedTagFilter}
                onAddTaskClick={handleAddTaskClick}
                onTaskStatusChange={handleTaskStatusChange}
                onDeleteTagFromTask={handleDeleteTagFromTask}
                onDeleteTask={confirmDeleteTask}
                onAddTagToTaskClick={setSelectedTaskId}
                setShowTagSelectionPopup={setShowTagSelectionPopup}
              />
            </div>


            {showTagPopup && (
              <TagPopup
                newTagName={newTagName}
                onNewTagNameChange={(e) => setNewTagName(e.target.value)}
                onClose={handleCloseTagPopup}
                onCreateTag={handleCreateTag}
              />
            )}

            {showTaskPopup && (
              <TaskPopup
                newTaskDescription={newTaskDescription}
                onNewTaskDescriptionChange={(e) => setNewTaskDescription(e.target.value)}
                onClose={handleCloseTaskPopup}
                onCreateTask={handleCreateTask}
              />
            )}

            {showTagSelectionPopup && selectedTaskId && (
              <TagSelectionPopup
                tags={tagsForSelection}
                onClose={() => setShowTagSelectionPopup(false)}
                onSelectTag={handleAddTagToTask}
              />
            )}
          </div>

        </div>
      </div>
    </div>






  );

}
