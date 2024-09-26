package service

import ()

type UserResponse struct {
	UserId   string
	Username string
	Email    string
	Password string
}

type UserBasicInfoResponse struct {
	Username string `json:"username"`
	Email    string `json:"email"`
}

type UserService interface {
	Login(email, password string) (*string, error)
	Register(username, email, password string) error
	ForgetPassword(email string) error
	ResetPassword(token, password, confirmPassword string) error

	GetUserData(userId string) (*UserBasicInfoResponse, error)
	ChangePassword(userId, username, password, confirmPassword string) error
	ChangeBackground(userId string, background int) error
	GetUserBackground(userId string) (*int, error)
}
