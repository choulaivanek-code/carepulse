package com.carepulse.carepulse.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends CarePulseException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
