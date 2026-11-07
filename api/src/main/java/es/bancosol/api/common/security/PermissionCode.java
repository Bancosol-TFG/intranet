package es.bancosol.api.common.security;

public enum PermissionCode {
    ZONE_LIST("Consultar el listado de zonas"),
    ZONE_READ("Consultar una zona"),
    ZONE_CREATE("Crear zonas"),
    ZONE_UPDATE("Modificar zonas"),
    ZONE_DELETE("Eliminar zonas"),
    LOCALITY_LIST("Consultar el listado de localidades"),
    LOCALITY_READ("Consultar una localidad"),
    LOCALITY_CREATE("Crear localidades"),
    LOCALITY_UPDATE("Modificar localidades"),
    LOCALITY_DELETE("Eliminar localidades"),
    COLLABORATOR_LIST("Consultar el listado de colaboradores"),
    COLLABORATOR_READ("Consultar un colaborador"),
    COLLABORATOR_CREATE("Crear colaboradores"),
    COLLABORATOR_UPDATE("Modificar colaboradores"),
    COLLABORATOR_DELETE("Eliminar colaboradores"),
    CONTACT_LIST("Consultar el listado de contactos"),
    CONTACT_READ("Consultar un contacto"),
    CONTACT_CREATE("Crear contactos"),
    CONTACT_UPDATE("Modificar contactos"),
    CONTACT_DELETE("Eliminar contactos"),
    CAMPAIGN_LIST("Consultar el listado de campañas"),
    CAMPAIGN_READ("Consultar una campaña"),
    CAMPAIGN_CREATE("Crear campañas"),
    CAMPAIGN_UPDATE("Modificar campañas"),
    CAMPAIGN_DELETE("Eliminar campañas"),
    CAMPAIGN_TYPE_LIST("Consultar el listado de tipos de campaña"),
    CAMPAIGN_TYPE_READ("Consultar un tipo de campaña"),
    CAMPAIGN_TYPE_CREATE("Crear tipos de campaña"),
    CAMPAIGN_TYPE_UPDATE("Modificar tipos de campaña"),
    CAMPAIGN_TYPE_DELETE("Eliminar tipos de campaña"),
    CHAIN_LIST("Consultar el listado de cadenas"),
    CHAIN_READ("Consultar una cadena"),
    CHAIN_CREATE("Crear cadenas"),
    CHAIN_UPDATE("Modificar cadenas"),
    CHAIN_DELETE("Eliminar cadenas"),
    STORE_LIST("Consultar el listado de tiendas"),
    STORE_READ("Consultar una tienda"),
    STORE_CREATE("Crear tiendas"),
    STORE_UPDATE("Modificar tiendas"),
    STORE_DELETE("Eliminar tiendas"),
    SCHEDULE_LIST("Consultar los horarios"),
    SCHEDULE_CREATE("Crear horarios"),
    SCHEDULE_UPDATE("Modificar horarios"),
    SCHEDULE_DELETE("Eliminar horarios"),
    SCHEDULE_EXCEPTION_LIST("Consultar las excepciones de horario"),
    SCHEDULE_EXCEPTION_CREATE("Crear excepciones de horario"),
    SCHEDULE_EXCEPTION_UPDATE("Modificar excepciones de horario"),
    SCHEDULE_EXCEPTION_DELETE("Eliminar excepciones de horario"),
    EFFECTIVE_SCHEDULE_READ("Consultar el horario efectivo"),
    ROLE_LIST("Consultar el listado de roles"),
    ROLE_CREATE("Crear roles"),
    PERMISSION_LIST("Consultar el catálogo de permisos"),
    ROLE_PERMISSION_LIST("Consultar los permisos de un rol"),
    ROLE_PERMISSION_ASSIGN("Asignar permisos a un rol"),
    ROLE_PERMISSION_REVOKE("Retirar permisos de un rol");

    private final String description;

    PermissionCode(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
