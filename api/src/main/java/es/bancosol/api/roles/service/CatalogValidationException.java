package es.bancosol.api.roles.service;

public class CatalogValidationException extends RuntimeException {
    public CatalogValidationException(String message) {
        super(message);
    }

    public CatalogValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
