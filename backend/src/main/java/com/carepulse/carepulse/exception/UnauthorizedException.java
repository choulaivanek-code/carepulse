package com.carepulse.carepulse.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends CarePulseException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
