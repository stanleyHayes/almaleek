package main

import (
	"fmt"
	"log"
	"net/http"

	"almaleek/internal/adapters/out/cloudinary"
	"almaleek/internal/app"
	"almaleek/internal/config"
)

func main() {
	cfg, err := config.LoadValidated()
	if err != nil {
		log.Fatal(err)
	}

	mediaStorage := cloudinary.NewService(cfg.CloudName, cfg.CloudAPIKey, cfg.CloudAPISecret)
	_ = mediaStorage
	a := app.New(cfg, nil, nil)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("starting AL Maleek API on %s", addr)
	if err := http.ListenAndServe(addr, a.Handler()); err != nil {
		log.Fatal(err)
	}
}
