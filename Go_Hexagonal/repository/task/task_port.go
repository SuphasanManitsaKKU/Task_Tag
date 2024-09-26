package repository

type Task struct {
	ID              string `db:"id"`
	UserID          string `db:"userId"`
	TaskDescription string `db:"taskDescription"`
	TaskStatus      string `db:"taskStatus"`
	CreatedAt       string `db:"createdAt"`
}

type TaskRepo struct {
	ID              string   `json:"id"`
	UserID          string   `json:"userId"`
	TaskDescription string   `json:"taskDescription"`
	TaskStatus      bool     `json:"taskStatus"`
	Tags            []string `json:"tags"`
}

type TaskRepoStatus struct {
	ID              string   `json:"id" db:"id"`
	UserID          string   `json:"userId" db:"userId"`
	TaskDescription string   `json:"taskDescription" db:"taskDescription"`
	TaskStatus      bool     `json:"taskStatus" db:"taskStatus"`
	Tags            []string `json:"tags" db:"tags"`
	CreatedAt       string   `json:"createdAt" db:"createdAt"`
}

type TaskDescription struct {
	ID              string `json:"id" db:"id"`
	UserID          string `json:"userId" db:"userId"`
	TaskDescription string `json:"taskDescription" db:"taskDescription"`
}

type TaskRepository interface {
	CreateTask(userId, taskDescription string) (*TaskRepo, error)
	DeleteTaskById(taskId string) error
	UpdateTaskStatus(taskId string) error
	GetTaskById(taskId string) (*TaskRepoStatus, error)
	GetTaskByUserId(userId string) ([]TaskDescription, error)
}
