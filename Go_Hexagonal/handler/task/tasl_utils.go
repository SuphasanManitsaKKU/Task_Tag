package handler

type createTaskRequest struct {
	UserId          string `json:"userId"`
	TaskDescription string `json:"taskDescription"`
}

type deleteTaskRequest struct {
	UserId string `json:"userId"`
	TaskId string `json:"taskId"`
}

type changeTaskStatusRequest struct {
	UserId string `json:"userId"`
	TaskId string `json:"taskId"`
}