package com.carepulse.carepulse.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends CarePulseException {
    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
