package com.tanveer_ahmed.student_management.student;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.time.LocalDate;

@Getter
@Setter
@Accessors(chain = true)
@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    private String name;
    private Integer roll;
    private Integer classNumber;
    private String Section;
    private String address;
    private LocalDate birthday;

}
