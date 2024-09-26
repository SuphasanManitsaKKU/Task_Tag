package service

import (
	"fmt"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"net/smtp"
	"time"
)

var jwtKey = []byte("12345678")

// Claims defines the structure of the JWT claims.
type claims struct {
	UserId  string `json:"userId"`
	jwt.RegisteredClaims
}

func sendEmail(email string, token string) error {
	// Sender data.
	from := "suphasan.m@kkumail.com"
	password := "qbji nsrg mtoz skgz"

	// Receiver email address.
	to := []string{
		email,
	}

	// smtp server configuration.
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	// Generate reset password link with the token
	resetPasswordLink := fmt.Sprintf("https://www.suphasan.site/change_password/%s", token)

	// Message.
	message := []byte(fmt.Sprintf("Subject: Password Reset\n\nClick here to reset your password: %s", resetPasswordLink))

	// Authentication.
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// Sending email.
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, message)
	if err != nil {
		return err
	}
	return nil
}

// hashPassword hashes the given password using bcrypt
func hashPassword(password string) (string, error) {
	// bcrypt.GenerateFromPassword returns the bcrypt hash of the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CheckPassword compares a hashed password with a plaintext password.
func checkPassword(hashedPassword string, password string) error {
	// bcrypt.CompareHashAndPassword compares the hashed password and the plaintext password
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return err
	}
	return nil
}

func createNewtoken(userId *string) (*string, error) {
	// Create JWT token
	expirationTime := time.Now().Add(60 * time.Minute) // Token valid for 60 minutes
	claims := &claims{
		UserId:  *userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return nil, err
	}
	return &tokenString, nil
}

// parseToken parses the JWT token and returns the userId
func parseToken(tokenStr string) (string, error) {
	// Parse the JWT token with claims
	claims := &claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	// Check if the token is valid
	if err != nil || !token.Valid {
		return "", err
	}

	// Return the userId from the token
	return claims.UserId, nil
}
