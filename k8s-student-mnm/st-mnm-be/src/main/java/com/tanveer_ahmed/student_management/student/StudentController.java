package com.tanveer_ahmed.student_management.student;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@CrossOrigin
public class StudentController {

    private final StudentService studentService;

    @GetMapping("listr")
    public ResponseEntity<?> getAllStudentsR() {
        return ResponseEntity.ok(studentService.findAll());
    }

    @GetMapping("list")
    public List<Student> getAllStudents() {
        return studentService.findAll();
    }

    @GetMapping
    public Student getStudentById(@RequestParam Long id) {
        return studentService.findById(id);
    }

    @PostMapping
    public Student save(@RequestBody Student student) {
        return studentService.save(student);
    }
}
