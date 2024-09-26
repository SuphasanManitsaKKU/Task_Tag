package repository

type Tag struct {
	ID        string `db:"id"`
	TagName   string `db:"tagName"`
	UserID    string `db:"userId"`
	CreatedAt string `db:"createdAt"`
	TasksId   string `db:"tasksId"`
}

type TagRepository interface {
	CreateTag(userId, tagName string) (*Tag,error)
	DeleteTagById(tagId string) error
	GetTagByUserId(userId string) ([]Tag, error)
	GetTagById(tagId string) (*Tag, error)

	AddTaskIdtoTag(tagId, taskId string) error
	DeleteTaskIdfromTag(tagId, taskId string) error

	Gettasksandtags(userId string) (*taskAndTag, error)
	GetTaskAndTag(taskId, tagId string) (*task_tag, error)
}