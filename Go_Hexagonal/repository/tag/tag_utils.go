package repository

type taskAndTag struct {
	UserId string `db:"userId"`
	Tags   []tag  `db:"tag"`
	Tasks  []task `db:"task"`
}

type tag struct {
	ID      string `db:"id"`
	UserID  string `db:"userId"`
	TagName string `db:"tagName"`
}

type task struct {
	ID              string `db:"id"`
	UserID          string `db:"userId"`
	TaskDescription string `db:"taskDescription"`
	TaskStatus      bool   `db:"taskStatus"`
	Tags            []tag  // Add a slice to store related tags
}

type task_tag struct {
	TaskID string `db:"taskId"`
	TagID  string `db:"tagId"`
}
