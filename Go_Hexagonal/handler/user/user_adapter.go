package handler

import (
	"go_hexagonal/service/user"
	"time"

	"github.com/gofiber/fiber/v2"
)

type userHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) userHandler {
	return userHandler{userService: userService}
}

func (u userHandler) Login(c *fiber.Ctx) error {
	var userRequest loginRequest

	// Parse request body into userRequest struct
	if err := c.BodyParser(&userRequest); err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}

	// Call the Login function from userService to get the token
	token, err := u.userService.Login(userRequest.Email, userRequest.Password)
	if err != nil {
		return c.Status(fiber.ErrUnauthorized.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Set the token into the cookie
	cookie := new(fiber.Cookie)
	cookie.Name = "token"
	cookie.Value = *token
	cookie.Expires = time.Now().Add(24 * time.Hour)
	cookie.HTTPOnly = true
	cookie.Secure = false
	cookie.SameSite = "Lax"
	cookie.Domain = ".suphasan.site"

	// Set the cookie in the response
	c.Cookie(cookie)

	// Optionally, set the token in the response header as well
	c.Set("Authorization", "Bearer "+*token)

	// Respond with success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
	})
}

func (u userHandler) Register(c *fiber.Ctx) error {
	var userRequest registerRequest
	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}
	err = u.userService.Register(userRequest.Username, userRequest.Email, userRequest.Password)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err,
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Register successful",
	})
}

func (u userHandler) ForgetPassword(c *fiber.Ctx) error {
	var userRequest forgetPasswordRequest
	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": fiber.ErrBadRequest.Message,
		})
	}
	err = u.userService.ForgetPassword(userRequest.Email)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Forget password successful",
	})
}

func (u userHandler) ResetPassword(c *fiber.Ctx) error {
	var userRequest resetPasswordRequest

	// Parse the request body
	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Call the ResetPassword service
	err = u.userService.ResetPassword(userRequest.Token, userRequest.Password, userRequest.ConfirmPassword)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err.Error(), // Return the error message as string
		})
	}

	// Return success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Reset password successful",
	})
}

func (u userHandler) GetUserData(c *fiber.Ctx) error {
	userId := c.Params("userId")
	user, err := u.userService.GetUserData(userId)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"username": user.Username,
		"email":    user.Email,
	})
}

func (u userHandler) ChangePassword(c *fiber.Ctx) error {
	var userRequest changePasswordRequest

	// Parse the request body
	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Call the ChangePassword service
	err = u.userService.ChangePassword(userRequest.UserId, userRequest.Username, userRequest.Password, userRequest.ConfirmPassword)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err.Error(), // Return the error message as string
		})
	}

	// Return success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Change password successful",
	})
}

func (u userHandler) ChangeBackground(c *fiber.Ctx) error {
	var userRequest changeBackgroundRequest

	// Parse the request body
	err := c.BodyParser(&userRequest)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Call the ChangeBackground service
	err = u.userService.ChangeBackground(userRequest.UserId, userRequest.VideoId)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err.Error(), // Return the error message as string
		})
	}

	// Return success message
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Change background successful",
	})
}

func (u userHandler) GetVideoId(c *fiber.Ctx) error {
	userId := c.Params("userId")
	videoId, err := u.userService.GetUserBackground(userId)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"videoId": videoId,
	})
}
