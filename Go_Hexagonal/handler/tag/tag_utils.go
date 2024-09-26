package handler

type createTagRequest struct {
	UserId  string `json:"userid"`
	TagName string `json:"tagName"`
}

type deleteTagRequest struct {
	TagId string `json:"tagId"`
}

type updateTaskIdtotagRequest struct {
	UserId string `json:"userId"`
	TaskId string `json:"taskId"`
	TagId  string `json:"tagId"`
}

type deleteTaskIdfromTagRequest struct {
	UserId string `json:"userId"`
	TaskId string `json:"taskId"`
	TagId  string `json:"tagId"`
}