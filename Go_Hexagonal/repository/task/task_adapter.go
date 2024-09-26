package repository

import (
	"log"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type taskRepository struct {
	db *sqlx.DB
}

func NewTaskRepository(db *sqlx.DB) TaskRepository {
	return taskRepository{db: db}
}

// CreateTask implements TaskRepository.
func (t taskRepository) CreateTask(userId string, taskDescription string) (*TaskRepo, error) {
	id := uuid.New().String()
	_, err := t.db.Exec("INSERT INTO tasks (id, userId, taskDescription, taskStatus, createdAt) VALUES (?, ?, ?, false, NOW())", id, userId, taskDescription)
	if err != nil {
		return nil, err
	}
	return &TaskRepo{
		ID:              id,
		UserID:          userId,
		TaskDescription: taskDescription,
		TaskStatus:      false,
		Tags:            []string{},
	}, nil
}

// DeleteTaskById implements TaskRepository.
func (t taskRepository) DeleteTaskById(taskId string) error {
	_, err := t.db.Exec("DELETE FROM tasks WHERE id = ?", taskId)
	if err != nil {
		return err
	}
	return nil
}

// UpdateTaskStatus implements TaskRepository.
func (t taskRepository) UpdateTaskStatus(taskId string) error {
	_, err := t.db.Exec("UPDATE tasks SET taskStatus = !taskStatus WHERE id = ?", taskId)
	if err != nil {
		return err
	}
	return nil
}

// GetTaskById implements TaskRepository.
func (t taskRepository) GetTaskById(taskId string) (*TaskRepoStatus, error) {
	var task TaskRepoStatus
	err := t.db.Get(&task, "SELECT id, userId, taskDescription, taskStatus, createdAt FROM tasks WHERE id = ?", taskId)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	// กำหนดค่า tags ให้เป็น slice ว่างหากมันเป็น nil
	if task.Tags == nil {
		task.Tags = []string{}
	}

	return &task, nil
}

// GetTaskByUserId implements TaskRepository.
func (t taskRepository) GetTaskByUserId(userId string) ([]TaskDescription, error) {
	var tasks []TaskDescription
	err := t.db.Select(&tasks, "SELECT id, userId, taskDescription FROM tasks WHERE userId = ?", userId)
	if err != nil {
		log.Println(err,"eeeeeeeeeeeee")
		return nil, err
	}
	return tasks, nil
}