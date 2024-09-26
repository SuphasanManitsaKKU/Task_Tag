package main

import (
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoiron/sqlx"

	handlerTag "go_hexagonal/handler/tag"
	handlerTask "go_hexagonal/handler/task"
	handlerUser "go_hexagonal/handler/user"
	"go_hexagonal/middleware"

	repositoryTag "go_hexagonal/repository/tag"
	repositoryTask "go_hexagonal/repository/task"
	repositoryUser "go_hexagonal/repository/user"

	serviceTag "go_hexagonal/service/tag"
	serviceTask "go_hexagonal/service/task"
	serviceUser "go_hexagonal/service/user"
)

func main() {
	db, err := getDb()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	userRepository := repositoryUser.NewUserRepository(db)
	tagRepository := repositoryTag.NewTagRepository(db)
	taskRepository := repositoryTask.NewTaskRepository(db)

	userService := serviceUser.NewUserService(userRepository)
	tagService := serviceTag.NewTagService(tagRepository)
	taskService := serviceTask.NewTaskService(taskRepository)

	userHandler := handlerUser.NewUserHandler(userService)
	tagHandler := handlerTag.NewTagHandler(tagService)
	taskHandler := handlerTask.NewTaskHandler(taskService)

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://www.suphasan.site",
		// AllowOrigins: "http://localhost:3001",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowCredentials: true,
	}))

	app.Post("/login", userHandler.Login)
	app.Post("/register", userHandler.Register)
	app.Post("/forgotpassword", userHandler.ForgetPassword)
	app.Post("/changepassword", userHandler.ResetPassword)

	app.Use(middleware.JWTMiddleware)

	app.Get("/getuerdata/:userId", userHandler.GetUserData)
	app.Post("/changepassword_v2", userHandler.ChangePassword)
	app.Put("/changebackground", userHandler.ChangeBackground)
	app.Get("/getvideoid/:userId", userHandler.GetVideoId)

	app.Post("/createtask", taskHandler.CreateTask)
	app.Put("/changetaskstatus", taskHandler.ChangeTaskStatus)
	app.Delete("/removetask", taskHandler.DeleteTaskById)

	app.Post("/createtag", tagHandler.CreateTag)
	app.Delete("/removetag", tagHandler.DeleteTagById)

	app.Get("/gettasksandtags/:userId", tagHandler.Gettasksandtags)
	app.Put("/addtagtotask", tagHandler.AddTaskIdtoTag)
	app.Put("/removetagtotask", tagHandler.DeleteTaskIdfromTag)

	app.Listen(":3000")
}

func getDb() (*sqlx.DB, error) {
	db, err := sqlx.Open("mysql", "root:12345678@tcp(localhost:3308)/sofdevhexagonal")
	if err != nil {
		return nil, err
	}
	fmt.Println("Connected to database")
	return db, nil
}