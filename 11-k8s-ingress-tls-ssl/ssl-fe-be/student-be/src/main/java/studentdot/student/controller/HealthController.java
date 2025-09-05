package studentdot.student.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/healthz")
    public String healthCheck() {
        return "OK";
    }

    @GetMapping("/ready")
    public String readinessCheck() {
        // optionally check DB connection or other dependencies
        return "READY";
    }
}
