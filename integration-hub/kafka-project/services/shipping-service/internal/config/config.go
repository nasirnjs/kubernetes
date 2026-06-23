package config

import (
	"fmt"
	"net/url"
	"os"
)

type Config struct {
	Port       string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSchema   string
	DBSSLMode  string
	JWTSecret  string
}

func Load() *Config {
	return &Config{
		Port:       getenv("PORT", "8080"),
		DBHost:     mustGetenv("DB_HOST"),
		DBPort:     getenv("DB_PORT", "5432"),
		DBUser:     mustGetenv("DB_USER"),
		DBPassword: mustGetenv("DB_PASSWORD"),
		DBName:     mustGetenv("DB_NAME"),
		DBSchema:   getenv("DB_SCHEMA", "shipping_svc"),
		DBSSLMode:  getenv("DB_SSLMODE", "disable"),
		JWTSecret:  mustGetenv("JWT_SECRET"),
	}
}

func (c *Config) DatabaseURL() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s&search_path=%s",
		url.QueryEscape(c.DBUser),
		url.QueryEscape(c.DBPassword),
		c.DBHost,
		c.DBPort,
		c.DBName,
		c.DBSSLMode,
		c.DBSchema,
	)
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func mustGetenv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		panic("missing required env: " + k)
	}
	return v
}
