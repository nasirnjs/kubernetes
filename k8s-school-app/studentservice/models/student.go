package models

type Student struct {
    Name    string `json:"name" bson:"name"`
    Roll    string `json:"roll" bson:"roll"`
    Address string `json:"address" bson:"address"`
}