package handler

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type registerRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type forgetPasswordRequest struct {
	Email string `json:"email"`
}

type resetPasswordRequest struct {
	Token           string `json:"token"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

type changePasswordRequest struct {
	UserId          string `json:"userId"`
	Username        string `json:"username"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

type changeBackgroundRequest struct {
	UserId  string `json:"userId"`
	VideoId int    `json:"videoId"`
}
