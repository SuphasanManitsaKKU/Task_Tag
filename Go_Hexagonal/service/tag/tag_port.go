package service

type ServiceTaskAndTag struct {
	UserId string `json:"userId"`
	Tags   []tag  `json:"tag"`
	Tasks  []task `json:"task"`
}

type tag struct {
	ID      string `json:"id"`
	UserID  string `json:"userId"`
	TagName string `json:"tagName"`
}

type task struct {
	ID              string `json:"id"`
	UserID          string `json:"userId"`
	TaskDescription string `json:"taskDescription"`
	TaskStatus      bool   `json:"taskStatus"`
	Tags            []tag  `json:"tag"`
}

type tagRes struct {
	ID      string `json:"id"`
	UserID  string `json:"userId"`
	TagName string `json:"tagName"`
}

type TagService interface {
	CreateTag(userId, tagName string) (*tagRes,error)
	DeleteTagById(tagId string) error
	AddTaskIdtoTag(userId, tagId, taskId string) error
	DeleteTaskIdfromTag(userId, tagId, taskId string) error

	Gettasksandtags(userId string) (*ServiceTaskAndTag, error)
}
