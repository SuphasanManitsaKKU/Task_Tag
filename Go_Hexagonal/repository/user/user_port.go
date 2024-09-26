package repository

type User struct {
	UserID             string `db:"userId"`
	Username           string `db:"username"`
	Email              string `db:"email"`
	Password           string `db:"password"`
	Current_background int    `db:"current_background"`
}

type UserRepository interface {
	Register(username, email, password string) error
	ChangePassword(userId, password string) error
	ChangeUsername(userId, username string) error

	GetUserByEmail(email string) (*User, error)
	GetUserById(userId string) (*User, error)
	UpdateBackground(userId string, background int) error
	GetUserBackground(userId string) (*int, error)
}
