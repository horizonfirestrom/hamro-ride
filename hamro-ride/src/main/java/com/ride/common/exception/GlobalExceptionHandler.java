package com.ride.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	 @ExceptionHandler(NotFoundException.class)
	    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest req) {
	        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
	    }

	    @ExceptionHandler(ForbiddenException.class)
	    public ResponseEntity<ApiError> handleForbidden(ForbiddenException ex, HttpServletRequest req) {
	        return build(HttpStatus.FORBIDDEN, ex.getMessage(), req);
	    }

	    @ExceptionHandler(BadRequestException.class)
	    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex, HttpServletRequest req) {
	        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
	    }

	    // Bean validation errors (@Valid)
	    @ExceptionHandler(MethodArgumentNotValidException.class)
	    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
	                                                     HttpServletRequest req) {
	        String msg = ex.getBindingResult().getFieldErrors().stream()
	                .findFirst()
	                .map(f -> f.getField() + " " + f.getDefaultMessage())
	                .orElse("Validation failed");
	        return build(HttpStatus.BAD_REQUEST, msg, req);
	    }

	    @ExceptionHandler(ConstraintViolationException.class)
	    public ResponseEntity<ApiError> handleConstraint(ConstraintViolationException ex,
	                                                     HttpServletRequest req) {
	        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
	    }

	    // Fallback
	    @ExceptionHandler(Exception.class)
	    public ResponseEntity<ApiError> handleOther(Exception ex, HttpServletRequest req) {
	        // In real prod, log stack trace here
	        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error", req);
	    }

	    private ResponseEntity<ApiError> build(HttpStatus status, String msg, HttpServletRequest req) {
	        ApiError body = new ApiError(
	                status.value(),
	                status.getReasonPhrase(),
	                msg,
	                req.getRequestURI()
	        );
	        return ResponseEntity.status(status).body(body);
	    }
}
