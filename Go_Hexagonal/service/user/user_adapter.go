package service

import (
	"errors"
	"fmt"
	"go_hexagonal/repository/user"
	"log"
)

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return userService{userRepo: userRepo}
}

// ForgetPassword generates a JWT token and sends a password reset email.
func (u userService) ForgetPassword(email string) error {
	user, err := u.userRepo.GetUserByEmail(email)
	if err != nil {
		return errors.New("error forget password")
	}

	tokenString, err := createNewtoken(&user.UserID)
	if err != nil {
		return errors.New("error creating token")
	}

	err = sendEmail(email, *tokenString)
	if err != nil {
		log.Println(err)
		return errors.New("error sending email")
	}

	return nil
}

// Login implements UserService.
func (u userService) Login(email string, password string) (*string, error) {
	user, err := u.userRepo.GetUserByEmail(email)
	if err != nil {
		return nil, errors.New("error getting user")
	}
	err = checkPassword(user.Password, password)
	if err != nil {
		return nil, errors.New("error checking password")
	}

	tokenString, err := createNewtoken(&user.UserID)
	if err != nil {
		return nil, errors.New("error creating token")
	}
	return tokenString, nil
}

// Register implements UserService.
func (u userService) Register(username string, email string, password string) error {
	// Hash password
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return errors.New("failed to hash password")
	}

	// Save the hashed password to the database
	err = u.userRepo.Register(username, email, hashedPassword)
	if err != nil {
		return errors.New("error registering user")
	}

	return nil
}

// ResetPassword implements UserService.
func (u userService) ResetPassword(token string, password string, confirmPassword string) error {
	if password != confirmPassword {
		return errors.New("passwords do not match")
	}

	// Parse the token to get the userId
	userId, err := parseToken(token)
	if err != nil {
		return errors.New("failed to parse token")
	}

	// Hash the new password
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return errors.New("failed to hash password")
	}

	// Change the password in the database using the userId
	err = u.userRepo.ChangePassword(userId, hashedPassword)
	if err != nil {
		return errors.New("error changing password")
	}
	fmt.Println("Password changed successfully")

	return nil
}

// GetUserById implements UserService.
func (u userService) GetUserData(userId string) (*UserBasicInfoResponse, error) {
	user, err := u.userRepo.GetUserById(userId)
	if err != nil {
		return nil, errors.New("error getting user")
	}
	return &UserBasicInfoResponse{
		Username: user.Username,
		Email:    user.Email,
	}, nil
}

// ChangePassword implements UserService.
func (u userService) ChangePassword(userId, username, password, confirmPassword string) error {
	if password != confirmPassword {
		return errors.New("passwords do not match")
	}
	if password != "" {
		// Hash the new password
		hashedPassword, err := hashPassword(password)
		if err != nil {
			return errors.New("failed to hash password")
		}

		// Change the password in the database using the userId
		err = u.userRepo.ChangePassword(userId, hashedPassword)
		if err != nil {
			return errors.New("error changing password")
		}
	}

	// Change the username in the database using the userId
	err := u.userRepo.ChangeUsername(userId, username)
	if err != nil {
		return errors.New("error changing username")
	}

	return nil
}

// ChangeBackground implements UserService.
func (u userService) ChangeBackground(userId string, background int) error {
	err := u.userRepo.UpdateBackground(userId, background)
	if err != nil {
		return errors.New("error changing background")
	}
	return nil
}

// GetUserBackground implements UserService.
func (u userService) GetUserBackground(userId string) (*int, error) {
	background, err := u.userRepo.GetUserBackground(userId)
	if err != nil {
		return nil, errors.New("error getting background")
	}
	return background, nil
}