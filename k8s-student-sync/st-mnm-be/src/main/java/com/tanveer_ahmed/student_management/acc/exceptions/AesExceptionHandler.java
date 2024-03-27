package com.tanveer_ahmed.student_management.acc.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class AesExceptionHandler {

    @ExceptionHandler(value = {AesException.class})
    public ResponseEntity<?> handleAesExceptions(AesException aesException) {
        return new ResponseEntity<>(
                Map.of("message", aesException.getMessage()),
                aesException.getHttpStatus()
        );
    }

    @ExceptionHandler(value = {RuntimeException.class})
    public ResponseEntity<?> handleRuntimeException(RuntimeException re) {
        return ResponseEntity
                .internalServerError()
                .body(
                        Map.of("message", re.getMessage())
                );
    }

//    @ExceptionHandler(value = {ResponseStatusException.class})
//    public ResponseEntity<Object> handleResponseStatusException(ResponseStatusException re) {
//        Map<String, Object> response = new HashMap<>();
//        response.put("message", re.getMessage());
//        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
//    }


}
