package repository

import (
	"log"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type tagRepository struct {
	db *sqlx.DB
}

func NewTagRepository(db *sqlx.DB) TagRepository {
	return tagRepository{db: db}
}

// CreateTag implements TagRepository.
func (t tagRepository) CreateTag(userId string, tagName string) (*Tag,error){
	id := uuid.New().String()
	_, err := t.db.Exec("INSERT INTO tags (id, tagName, userId, createdAt) VALUES (?, ?, ?, NOW())",id, tagName, userId)
	if err != nil {
		return nil,err
	}

	return &Tag{
		ID:        id,
		UserID:    userId,
		TagName:   tagName,
	}, nil
}

// DeleteTagById implements TagRepository.
func (t tagRepository) DeleteTagById(tagId string) error {
	_, err := t.db.Exec("DELETE FROM tags WHERE id = ?", tagId)
	if err != nil {
		return err
	}
	return nil
}

// GetTagById implements TagRepository.
func (t tagRepository) GetTagById(tagId string) (*Tag, error) {
	var tag Tag
	err := t.db.Get(&tag, "SELECT id, tagName, userId, createdAt FROM tags WHERE id = ?", tagId)
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

// GetTagByUserId implements TagRepository.
func (t tagRepository) GetTagByUserId(userId string) ([]Tag, error) {
	var tags []Tag
	err := t.db.Select(&tags, "SELECT id, tagName, userId, createdAt FROM tags WHERE userId = ?", userId)
	if err != nil {
		return nil, err
	}
	return tags, nil
}

// UpdateTaskIdtotag implements TagRepository.
func (t tagRepository) AddTaskIdtoTag(tagId, taskId string) error {
	_, err := t.db.Exec("INSERT INTO task_tag (taskId, tagId) VALUES (?, ?);", taskId, tagId)
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}


// DeleteTaskIdfromTag implements TagRepository.
func (t tagRepository) DeleteTaskIdfromTag(tagId, taskId string) error {
	_, err := t.db.Exec("DELETE FROM task_tag WHERE taskId = ? AND tagId = ?", taskId, tagId)
	if err != nil {
		return err
	}
	return nil
}

// Gettasksandtags implements TagRepository.
func (t tagRepository) Gettasksandtags(userId string) (*taskAndTag, error) {

    // Fetch tags for the user
    var tags []tag
    err := t.db.Select(&tags, "SELECT id, userId, tagName FROM tags WHERE userId = ?", userId)
    if err != nil {
        return nil, err
    }

    // Fetch tasks for the user
    var tasks []task
    err = t.db.Select(&tasks, "SELECT id, userId, taskDescription, taskStatus FROM tasks WHERE userId = ?", userId)
    if err != nil {
        return nil, err
    }

	// Fetch task_tag to link tasks with tags
	var taskTagLinks []task_tag
	err = t.db.Select(&taskTagLinks, "SELECT taskId, tagId FROM task_tag")
	if err != nil {
		return nil, err
	}

	bigTags := tasks

	// Map tags to the corresponding tasks using task_tag links
	for i, task := range tasks {
		for _, link := range taskTagLinks {
			if task.ID == link.TaskID {
				for _, tag := range tags {
					if tag.ID == link.TagID {
						// fmt.Println("Task:", task.ID, "Tag:", tag.ID)
						// tasks[i].Tags = append(tasks[i].Tags, tag)  // Add the tag to the task's tag slice
						bigTags[i].Tags = append(tasks[i].Tags, tag)
						// fmt.Println(tasks[i].Tags)
					}
				}
			}
		}
	}

    // Return the result
    result := &taskAndTag{
		UserId: userId,
        Tags:  tags,
        Tasks: bigTags,
    }
    return result, nil
}

// GetTaskAndTag implements TagRepository.
func (t tagRepository) GetTaskAndTag(taskId, tagId string) (*task_tag, error) {
	var taskTag task_tag
	err := t.db.Get(&taskTag, "SELECT taskId, tagId FROM task_tag WHERE taskId = ? AND tagId = ?", taskId, tagId)
	if err != nil {
		return nil, err
	}
	return &taskTag, nil
}
