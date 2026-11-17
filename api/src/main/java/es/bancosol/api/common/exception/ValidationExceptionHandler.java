package es.bancosol.api.common.exception;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.DatabindException;

@RestControllerAdvice
public class ValidationExceptionHandler {

    private static final String VALIDATION_DETAIL = "La solicitud contiene datos no válidos.";
    private static final String UNREADABLE_DETAIL = "El cuerpo de la solicitud no es un JSON válido.";
    private static final String INVALID_VALUE_MESSAGE = "has an invalid value or format";
    private static final String ERRORS_PROPERTY = "errors";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleInvalidRequestBody(MethodArgumentNotValidException exception) {
        return badRequest(VALIDATION_DETAIL, exception.getBindingResult().getAllErrors().stream()
                .map(this::toValidationError).toList());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableRequestBody(HttpMessageNotReadableException exception) {
        if (exception.getCause() instanceof DatabindException databindException
                && !databindException.getPath().isEmpty()) {
            return badRequest(VALIDATION_DETAIL,
                    List.of(validationError(toFieldPath(databindException.getPath()), INVALID_VALUE_MESSAGE)));
        }
        return badRequest(UNREADABLE_DETAIL, List.of());
    }

    private ProblemDetail badRequest(String detail, List<Map<String, String>> errors) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
        problemDetail.setProperty(ERRORS_PROPERTY, errors);
        return problemDetail;
    }

    private Map<String, String> toValidationError(ObjectError error) {
        String field = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
        return validationError(field, error.getDefaultMessage() == null ? "" : error.getDefaultMessage());
    }

    private String toFieldPath(List<JacksonException.Reference> path) {
        return path.stream()
                .map(reference -> reference.getPropertyName() != null
                        ? "." + reference.getPropertyName() : "[" + reference.getIndex() + "]")
                .collect(Collectors.joining()).replaceFirst("^\\.", "");
    }

    private Map<String, String> validationError(String field, String message) {
        return Map.of("field", field, "message", message);
    }
}
