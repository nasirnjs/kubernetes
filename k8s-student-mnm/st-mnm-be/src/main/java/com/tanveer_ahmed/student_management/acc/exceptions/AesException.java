package com.tanveer_ahmed.student_management.acc.exceptions;


import lombok.Getter;
import org.springframework.http.HttpStatus;

public class AesException extends RuntimeException{

    @Getter
    private final HttpStatus httpStatus;

    public AesException(String message){
        super(message);
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public AesException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

}
