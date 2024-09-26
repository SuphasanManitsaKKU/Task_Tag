package repository

import (
	"github.com/jmoiron/sqlx"
)

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return userRepository{db: db}
}



// Register implements UserRepository.
func (u userRepository) Register(username string, email string, password string) error {
    _,err := u.db.Exec("INSERT INTO users (userId, username, email, password) VALUES (UUID(), ?, ?, ?)", username, email, password)
    if err != nil {
        return err
    }
    return nil
}

// ResetPassword implements UserRepository.
func (u userRepository) ChangePassword(userId, password string) error {
	_,err := u.db.Exec("UPDATE users SET password = ? WHERE userId = ?", password, userId)
	if err != nil {
		return err
	}
	return nil
}

// GetUserByEmail implements UserRepository.
func (u userRepository) GetUserByEmail(email string) (*User, error) {
	var user User
	err := u.db.Get(&user, "SELECT userId, username, email, password, current_background FROM users WHERE email = ?", email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserById implements UserRepository.
func (u userRepository) GetUserById(userId string) (*User, error) {
	var user User
	err := u.db.Get(&user, "SELECT userId, username, email, password, current_background FROM users WHERE userId = ?", userId)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// ChangeUsername implements UserRepository.
func (u userRepository) ChangeUsername(userId, username string) error {
	_,err := u.db.Exec("UPDATE users SET username = ? WHERE userId = ?", username, userId)
	if err != nil {
		return err
	}
	return nil
}

// UpdateBackground implements UserRepository.
func (u userRepository) UpdateBackground(userId string, background int) error {
	_,err := u.db.Exec("UPDATE users SET current_background = ? WHERE userId = ?", background, userId)
	if err != nil {
		return err
	}
	return nil
}

// GetUserBackground implements UserRepository.
func (u userRepository) GetUserBackground(userId string) (*int, error) {
	var background int
	err := u.db.Get(&background, "SELECT current_background FROM users WHERE userId = ?", userId)
	if err != nil {
		return nil, err
	}
	return &background, nil
}