package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"fmt"
)

var jwtKey = []byte("12345678") // Replace this with your own secret key

func JWTMiddleware(c *fiber.Ctx) error {
	// Get the token from the cookie
	tokenString := c.Cookies("token") // ใช้ชื่อ cookie ที่คุณเก็บ JWT ไว้

	// Check if the token is provided
	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing or invalid token",
		})
	}

	// Parse the token
	claims := &claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Make sure that the token method conform to "SigningMethodHS256"
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired token",
		})
	}

	// If valid, attach the user ID to the request context
	c.Locals("userId", claims.UserId)

	// Continue to the next handler
	return c.Next()
}

// Define claims structure
type claims struct {
	UserId string `json:"userId"`
	jwt.RegisteredClaims
}
