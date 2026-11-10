package es.bancosol.api.roles.dto;

public record CatalogSource(String file, int line, String key) {
    public String describe() {
        return file + ":" + line + " [" + key + "]";
    }
}
