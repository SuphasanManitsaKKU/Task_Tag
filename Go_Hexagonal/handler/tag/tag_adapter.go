package handler

import (
	"fmt"
	"go_hexagonal/service/tag"

	"github.com/gofiber/fiber/v2"
)

type tagHandler struct {
	tagService service.TagService
}

func NewTagHandler(tagService service.TagService) tagHandler {
	return tagHandler{tagService: tagService}
}

func (u tagHandler) CreateTag(c *fiber.Ctx) error {
	var tagRequest createTagRequest

	// Parse request body into tagRequest struct
	if err := c.BodyParser(&tagRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the CreateTag function from tagService
	tag,err := u.tagService.CreateTag(tagRequest.UserId, tagRequest.TagName)
	if err != nil {
		fmt.Println("error", err)
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(tag)
}

func (u tagHandler) DeleteTagById(c *fiber.Ctx) error {
	var tagRequest deleteTagRequest

	// Parse request body into tagRequest struct
	if err := c.BodyParser(&tagRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the DeleteTagById function from tagService
	err := u.tagService.DeleteTagById(tagRequest.TagId)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Delete tag successful",
	})
}

func (u tagHandler) AddTaskIdtoTag(c *fiber.Ctx) error {
	fmt.Println("AddTaskIdtoTag")
	var tagRequest updateTaskIdtotagRequest

	// Parse request body into tagRequest struct
	if err := c.BodyParser(&tagRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the UpdateTaskIdtotag function from tagService
	err := u.tagService.AddTaskIdtoTag(tagRequest.UserId, tagRequest.TagId, tagRequest.TaskId)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Update task id to tag successful",
	})
}

func (u tagHandler) DeleteTaskIdfromTag(c *fiber.Ctx) error {
	var tagRequest deleteTaskIdfromTagRequest

	// Parse request body into tagRequest struct
	if err := c.BodyParser(&tagRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the DeleteTaskIdfromTag function from tagService
	err := u.tagService.DeleteTaskIdfromTag(tagRequest.UserId, tagRequest.TagId, tagRequest.TaskId)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Delete task id from tag successful",
	})
}

func (u tagHandler) Gettasksandtags(c *fiber.Ctx) error {
	userId := c.Params("userId")
	// Call the Gettasksandtags function from tagService
	taskAndTag, err := u.tagService.Gettasksandtags(userId)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with the taskAndTag directly, without wrapping in "data"
	return c.Status(fiber.StatusOK).JSON(taskAndTag)
}