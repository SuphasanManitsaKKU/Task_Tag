package service

import (
	"errors"
	"fmt"
	"go_hexagonal/repository/task"
)

type taskService struct {
	taskRepo repository.TaskRepository
}

func NewTaskService(taskRepo repository.TaskRepository) TaskService {
	return taskService{taskRepo: taskRepo}
}

// ChangeTaskStatus implements TagService.
func (t taskService) ChangeTaskStatus(userId string, taskId string) (*TaskResStatus,error) {
	task, err := t.taskRepo.GetTaskById(taskId)
	if err != nil {
		return nil,errors.New("error getting task")
	}
	if task.UserID != userId {
		return nil,errors.New("task not belong to user")
	}
	err = t.taskRepo.UpdateTaskStatus(taskId)
	if err != nil {
		return nil,errors.New("error changing task status")
	}
	return &TaskResStatus{
		ID:              task.ID,
		UserID:          task.UserID,
		TaskDescription: task.TaskDescription,
		TaskStatus:      !task.TaskStatus,
		Tags:            task.Tags,
		CreatedAt:       task.CreatedAt,
	},nil
}

// CreateTag implements TagService.
func (t taskService) CreateTask(userId string, taskDescription string) (*TaskRes,error) {
	tasks,err := t.taskRepo.GetTaskByUserId(userId)
	if err != nil {
		return nil,errors.New("error getting task")
	}
	fmt.Println("tasks",tasks)
	for _,task := range tasks {
		if task.TaskDescription == taskDescription {
			return nil,errors.New("task already exist")
		}
	}

	task,err := t.taskRepo.CreateTask(userId, taskDescription)
	if err != nil {
		return nil,errors.New("error creating tag")
	}
	return &TaskRes{
		ID:              task.ID,
		UserID:          task.UserID,
		TaskDescription: task.TaskDescription,
		TaskStatus:      task.TaskStatus,
		Tags:            task.Tags,
	},nil
}

// DeleteTagById implements TagService.
func (t taskService) DeleteTaskById(userId string, taskId string) error {
	task, err := t.taskRepo.GetTaskById(taskId)
	if err != nil {
		return errors.New("error getting task")
	}
	if task.UserID != userId {
		return errors.New("task not belong to user")
	}
	err = t.taskRepo.DeleteTaskById(taskId)
	if err != nil {
		return errors.New("error deleting tag")
	}
	return nil
}
