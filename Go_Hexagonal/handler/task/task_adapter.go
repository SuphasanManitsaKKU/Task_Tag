package handler

import (
	"go_hexagonal/service/task"
	"github.com/gofiber/fiber/v2"
)

type taskHandler struct {
	taskService service.TaskService
}

func NewTaskHandler(taskService service.TaskService) taskHandler {
	return taskHandler{taskService: taskService}
}

func (t taskHandler) CreateTask(c *fiber.Ctx) error {
	var taskRequest createTaskRequest

	// Parse request body into taskRequest struct
	if err := c.BodyParser(&taskRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the CreateTask function from taskService
	task,err := t.taskService.CreateTask(taskRequest.UserId, taskRequest.TaskDescription)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(task)
}

func (t taskHandler) DeleteTaskById(c *fiber.Ctx) error {
	var taskRequest deleteTaskRequest

	// Parse request body into taskRequest struct
	if err := c.BodyParser(&taskRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the DeleteTaskById function from taskService
	err := t.taskService.DeleteTaskById(taskRequest.UserId, taskRequest.TaskId)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Delete task successful",
	})
}

func (t taskHandler) ChangeTaskStatus(c *fiber.Ctx) error {
	var taskRequest changeTaskStatusRequest

	// Parse request body into taskRequest struct
	if err := c.BodyParser(&taskRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the ChangeTaskStatus function from taskService
	task,err := t.taskService.ChangeTaskStatus(taskRequest.UserId, taskRequest.TaskId)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(task)
}