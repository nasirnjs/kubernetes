package com.tanveer_ahmed.student_management.student;

import com.tanveer_ahmed.student_management.acc.exceptions.AesException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> findAll(){
        return studentRepository.findAll();
    }

    public Student save(Student student){
//        List<Student> existingStudent = studentRepository.findByRoll(student.getRoll());
//        if (existingStudent != null && !existingStudent.isEmpty()) {
//            throw new AesException("Student with same roll already exists");
//        }
        return studentRepository.save(student);
    }

    public Student findById(Long id){
        return studentRepository.findById(id).orElse(null);
    }
}
