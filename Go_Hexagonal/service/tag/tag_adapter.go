package service

import (
	"database/sql"
	"errors"
	"fmt"
	"go_hexagonal/repository/tag"
)

type tagService struct {
	tagRepo repository.TagRepository
}

func NewTagService(tagRepo repository.TagRepository) TagService {
	return tagService{tagRepo: tagRepo}
}

// CreateTag implements TagService.
func (t tagService) CreateTag(userId string, tagName string) (*tagRes, error) {
	tags,err := t.tagRepo.GetTagByUserId(userId)
	if err != nil {
		return nil, errors.New("error getting tag")
	}

	for _,tag := range tags {
		if tag.TagName == tagName {
			return nil, errors.New("tag already exist")
		}
	}

	tag, err := t.tagRepo.CreateTag(userId, tagName)
	if err != nil {
		return nil, errors.New("error creating tag")
	}
	return &tagRes{
		ID:      tag.ID,
		UserID:  tag.UserID,
		TagName: tag.TagName,
	}, nil
}

// DeleteTagById implements TagService.
func (t tagService) DeleteTagById(tagId string) error {
	err := t.tagRepo.DeleteTagById(tagId)
	if err != nil {
		return errors.New("error deleting tag")
	}
	return nil
}

// UpdateTaskIdtotag implements TagService.
func (t tagService) AddTaskIdtoTag(userId, tagId, taskId string) error {

    tag, err := t.tagRepo.GetTagById(tagId)
    if err != nil {
        return errors.New("error getting tag")
    }

    if tag.UserID != userId {
        return errors.New("tag not belong to user")
    }

    tat, err := t.tagRepo.GetTaskAndTag(taskId, tagId)
    if err != nil {
        if err == sql.ErrNoRows {
            // No rows found, proceed to add the task to the tag
        } else {
            return errors.New("error getting task and tag")
        }
    } else if tat != nil && tat.TaskID == taskId && tat.TagID == tagId {
        return errors.New("task already exists in tag")
    }
    err = t.tagRepo.AddTaskIdtoTag(tagId, taskId)
    if err != nil {
        return errors.New("error updating tag")
    }
    return nil
}

// DeleteTaskIdfromTag implements TagService.
func (t tagService) DeleteTaskIdfromTag(userId, tagId, taskId string) error {
	tag, err := t.tagRepo.GetTagById(tagId)
	if err != nil {
		return errors.New("error getting tag")
	}
	if tag.UserID != userId {
		return errors.New("tag not belong to user")
	}
	err = t.tagRepo.DeleteTaskIdfromTag(tagId, taskId)
	if err != nil {
		return errors.New("error updating tag")
	}
	return nil
}

// Gettasksandtags implements TagService.
func (t tagService) Gettasksandtags(userId string) (*ServiceTaskAndTag, error) {
	fmt.Println("Gettasksandtags", userId)
	// Call the repository function to get tasks and tags
	taskAndTag, err := t.tagRepo.Gettasksandtags(userId)
	if err != nil {
		return nil, errors.New("error getting tasks and tags")
	}

	// Initialize the new ServiceTaskAndTag struct
	var newTaskAndTag ServiceTaskAndTag
	newTaskAndTag.UserId = taskAndTag.UserId

	// Initialize slice for Tags
	newTags := make([]tag, len(taskAndTag.Tags))
	for i, repositoryTag := range taskAndTag.Tags {
		newTags[i] = tag{
			ID:      repositoryTag.ID,
			UserID:  repositoryTag.UserID,
			TagName: repositoryTag.TagName,
		}
	}
	newTaskAndTag.Tags = newTags

	// Initialize slice for Tasks
	newTasks := make([]task, len(taskAndTag.Tasks))
	for i, repositoryTask := range taskAndTag.Tasks {
		// สร้าง slice ใหม่สำหรับ Tags
		newTags := make([]tag, len(repositoryTask.Tags))

		// ลูปผ่านแต่ละ Tag ของ Task และแปลงจาก repository.tag เป็น tag
		for j, repositoryTag := range repositoryTask.Tags {
			newTags[j] = tag{
				ID:      repositoryTag.ID,
				UserID:  repositoryTag.UserID,
				TagName: repositoryTag.TagName,
				// เพิ่มฟิลด์อื่นๆ ถ้ามี
			}
		}

		// สร้าง task ใหม่ พร้อมกับข้อมูล tags ที่แปลงแล้ว
		newTasks[i] = task{
			ID:              repositoryTask.ID,
			UserID:          repositoryTask.UserID,
			TaskDescription: repositoryTask.TaskDescription,
			TaskStatus:      repositoryTask.TaskStatus,
			Tags:            newTags, // ใส่ tags ที่แปลงค่าแล้ว
		}
	}

	newTaskAndTag.Tasks = newTasks

	return &newTaskAndTag, nil
}