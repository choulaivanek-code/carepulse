package com.carepulse.carepulse.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CarePulseException extends RuntimeException {
    private final HttpStatus status;

    public CarePulseException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
