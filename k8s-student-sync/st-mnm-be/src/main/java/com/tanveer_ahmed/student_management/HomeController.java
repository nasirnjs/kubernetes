package com.tanveer_ahmed.student_management;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("hello")
    public ResponseEntity<?> hello() {
        return ResponseEntity.ok("Hello from Student Management");
    }

}
