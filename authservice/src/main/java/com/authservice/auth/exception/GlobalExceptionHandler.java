// package com.authservice.auth.exception;

// import com.authservice.auth.dto.response.ApiError;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.MethodArgumentNotValidException;
// import org.springframework.web.bind.annotation.ExceptionHandler;
// import org.springframework.web.bind.annotation.RestControllerAdvice;

// import java.time.LocalDateTime;

// @RestControllerAdvice
// public class GlobalExceptionHandler {

//     // -----------------------------
//     // 409 - USER ALREADY EXISTS
//     // -----------------------------
//     @ExceptionHandler(UserAlreadyExistsException.class)
//     public ResponseEntity<ApiError> handleUserAlreadyExists(UserAlreadyExistsException ex) {
//         return buildError(HttpStatus.CONFLICT, ex.getMessage());
//     }

//     // -----------------------------
//     // 401 - INVALID CREDENTIALS
//     // -----------------------------
//     @ExceptionHandler(InvalidCredentialsException.class)
//     public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex) {
//         return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage());
//     }

//     // -----------------------------
//     // 404 - RESOURCE NOT FOUND
//     // -----------------------------
//     @ExceptionHandler(ResourceNotFoundException.class)
//     public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
//         return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
//     }

//     // -----------------------------
//     // 400 - INVALID TOKEN
//     // -----------------------------
//     @ExceptionHandler(InvalidTokenException.class)
//     public ResponseEntity<ApiError> handleInvalidToken(InvalidTokenException ex) {
//         return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
//     }

//     // -----------------------------
//     // 410 - TOKEN EXPIRED
//     // -----------------------------
//     @ExceptionHandler(TokenExpiredException.class)
//     public ResponseEntity<ApiError> handleTokenExpired(TokenExpiredException ex) {
//         return buildError(HttpStatus.GONE, ex.getMessage());
//     }

//     // -----------------------------
//     // 400 - VALIDATION ERRORS
//     // -----------------------------
//     @ExceptionHandler(MethodArgumentNotValidException.class)
//     public ResponseEntity<ApiError> handleValidationErrors(MethodArgumentNotValidException ex) {
//         String message = ex.getBindingResult()
//                 .getFieldErrors()
//                 .stream()
//                 .findFirst()
//                 .map(err -> err.getField() + ": " + err.getDefaultMessage())
//                 .orElse("Validation error");

//         return buildError(HttpStatus.BAD_REQUEST, message);
//     }

//     // -----------------------------
//     // 400 - ILLEGAL ARGUMENT
//     // -----------------------------
//     @ExceptionHandler(IllegalArgumentException.class)
//     public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
//         return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
//     }

//     // -----------------------------
//     // 500 - FALLBACK
//     // -----------------------------
//     @ExceptionHandler(Exception.class)
//     public ResponseEntity<ApiError> handleGenericException(Exception ex) {
//         return buildError(
//                 HttpStatus.INTERNAL_SERVER_ERROR,
//                 "An unexpected error occurred"
//         );
//     }

//     // -----------------------------
//     // COMMON BUILDER
//     // -----------------------------
//     private ResponseEntity<ApiError> buildError(HttpStatus status, String message) {
//         ApiError error = new ApiError(
//                 status.value(),
//                 status.getReasonPhrase(),
//                 message,
//                 LocalDateTime.now()
//         );
//         return new ResponseEntity<>(error, status);
//     }
// }
package com.authservice.auth.exception;

import com.authservice.auth.dto.response.ApiError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // -----------------------------
    // 409 - USER ALREADY EXISTS
    // -----------------------------
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        log.warn("UserAlreadyExistsException: {}", ex.getMessage());
        return buildError(HttpStatus.CONFLICT, ex.getMessage());
    }

    // -----------------------------
    // 401 - INVALID CREDENTIALS
    // -----------------------------
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex) {
        log.warn("InvalidCredentialsException: {}", ex.getMessage());
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    // -----------------------------
    // 404 - RESOURCE NOT FOUND
    // -----------------------------
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        log.warn("ResourceNotFoundException: {}", ex.getMessage());
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // -----------------------------
    // 400 - INVALID TOKEN
    // -----------------------------
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiError> handleInvalidToken(InvalidTokenException ex) {
        log.warn("InvalidTokenException: {}", ex.getMessage());
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // -----------------------------
    // 410 - TOKEN EXPIRED
    // -----------------------------
    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ApiError> handleTokenExpired(TokenExpiredException ex) {
        log.warn("TokenExpiredException: {}", ex.getMessage());
        return buildError(HttpStatus.GONE, ex.getMessage());
    }

    // -----------------------------
    // 400 - VALIDATION ERRORS
    // -----------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Validation error");

        log.warn("Validation error: {}", message);
        return buildError(HttpStatus.BAD_REQUEST, message);
    }

    // -----------------------------
    // 400 - ILLEGAL ARGUMENT
    // -----------------------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("IllegalArgumentException: {}", ex.getMessage());
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // -----------------------------
    // 500 - UNEXPECTED ERRORS
    // -----------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        log.error("Unexpected exception occurred", ex); // full stack trace
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred");
    }

    // -----------------------------
    // COMMON BUILDER
    // -----------------------------
    private ResponseEntity<ApiError> buildError(HttpStatus status, String message) {
        ApiError error = new ApiError(
                status.value(),
                status.getReasonPhrase(),
                message,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(error, status);
    }
}
