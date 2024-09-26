package service

type TaskRes struct {
	ID             string   `json:"id"`
	UserID         string   `json:"userId"`
	TaskDescription string   `json:"taskDescription"`
	TaskStatus     bool     `json:"taskStatus"`
	Tags           []string `json:"tags"`
}

type TaskResStatus struct {
	ID             string   `json:"id"`
	UserID         string   `json:"userId"`
	TaskDescription string   `json:"taskDescription"`
	TaskStatus     bool     `json:"taskStatus"`
	Tags           []string `json:"tags"`
	CreatedAt      string   `json:"createdAt"`
}

type TaskService interface {
	CreateTask(userId, taskDescription string) (*TaskRes,error)
	ChangeTaskStatus(userId string, taskId string) (*TaskResStatus,error)
	DeleteTaskById(userId string, taskId string) error
}