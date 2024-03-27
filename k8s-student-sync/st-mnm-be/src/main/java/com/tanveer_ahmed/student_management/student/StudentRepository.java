package com.tanveer_ahmed.student_management.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByRoll(Integer roll);
}
