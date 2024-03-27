package studentdot.student.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import studentdot.student.entity.Student;
import studentdot.student.repository.StudentRepository;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public Student poststudent(Student student){
        return studentRepository.save(student);
        
    }

    public List<Student> getAllStudent() {
        return studentRepository.findAll();
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    public Student getStudentById(Long id){
        return studentRepository.findById(id).orElse(null);
    }

    public Student updateStudent(Long id, Student student) {
        Optional<Student> optionalStudent = studentRepository.findById(id);
        if (optionalStudent.isPresent()) {
            Student existingStudent = optionalStudent.get();
            existingStudent.setName(student.getName());
            existingStudent.setClassName(student.getClassName());
            existingStudent.setRoll(student.getRoll());
            existingStudent.setFatherName(student.getFatherName());
            existingStudent.setMotherName(student.getMotherName());
            return studentRepository.save(existingStudent);
        }
        return null;
    } 

}
