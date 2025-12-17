package models

type Teacher struct {
    Name    string `json:"name" bson:"name"`
    ID      string `json:"id" bson:"id"`
    Subject string `json:"subject" bson:"subject"`
}