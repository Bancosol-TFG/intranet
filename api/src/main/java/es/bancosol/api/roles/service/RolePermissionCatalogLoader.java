package es.bancosol.api.roles.service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import es.bancosol.api.roles.dto.CatalogPermission;
import es.bancosol.api.roles.dto.CatalogPermissionReference;
import es.bancosol.api.roles.dto.CatalogRole;
import es.bancosol.api.roles.dto.CatalogSource;
import es.bancosol.api.roles.dto.RolePermissionCatalog;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import org.yaml.snakeyaml.error.Mark;
import org.yaml.snakeyaml.error.MarkedYAMLException;
import org.yaml.snakeyaml.nodes.MappingNode;
import org.yaml.snakeyaml.nodes.Node;
import org.yaml.snakeyaml.nodes.NodeTuple;
import org.yaml.snakeyaml.nodes.ScalarNode;
import org.yaml.snakeyaml.nodes.SequenceNode;

public class RolePermissionCatalogLoader {
    private static final String PERMISSION_LOCATION = "classpath*:security/permissions/*.yaml";
    private static final String ROLE_LOCATION = "classpath*:security/roles/*.yaml";
    private static final Set<String> PERMISSION_FIELDS = Set.of("name", "description");
    private static final Set<String> ROLE_FIELDS = Set.of("name", "permissions");

    private final ResourcePatternResolver resourcePatternResolver;
    private final RolePermissionCatalogValidator catalogValidator = new RolePermissionCatalogValidator();

    public RolePermissionCatalogLoader() {
        this(new PathMatchingResourcePatternResolver());
    }

    RolePermissionCatalogLoader(ResourcePatternResolver resourcePatternResolver) {
        this.resourcePatternResolver = resourcePatternResolver;
    }

    public RolePermissionCatalog load() {
        try {
            return load(resourcePatternResolver.getResources(PERMISSION_LOCATION),
                    resourcePatternResolver.getResources(ROLE_LOCATION));
        } catch (IOException exception) {
            throw new CatalogValidationException("No se pudieron localizar los archivos del catálogo YAML.", exception);
        }
    }

    RolePermissionCatalog load(Resource[] permissionResources, Resource[] roleResources) {
        List<Resource> sortedPermissionResources = sortResources(permissionResources);
        List<Resource> sortedRoleResources = sortResources(roleResources);
        List<CatalogPermission> permissions = new ArrayList<>();
        List<CatalogRole> roles = new ArrayList<>();

        sortedPermissionResources.forEach(resource -> permissions.addAll(parsePermissions(resource)));

        sortedRoleResources.forEach(resource -> {
            roles.add(parseRole(resource));
        });

        catalogValidator.validate(permissions, roles);
        return new RolePermissionCatalog(List.copyOf(permissions), List.copyOf(roles));
    }

    private List<CatalogPermission> parsePermissions(Resource resource) {
        Node root = parseYaml(resource);
        MappingNode rootMapping = requireMapping(root, source(resource, root, "$"), "La raíz debe ser un mapa.");
        Map<String, Node> rootFields = readFields(resource, rootMapping, Set.of("permissions"));
        Node permissionsNode = requireField(resource, root, rootFields, "permissions", "permissions");
        SequenceNode permissionsSequence = requireSequence(permissionsNode,
                source(resource, permissionsNode, "permissions"), "permissions debe ser una lista.");
        List<CatalogPermission> permissions = new ArrayList<>();

        for (int permissionIndex = 0; permissionIndex < permissionsSequence.getValue().size(); permissionIndex++) {
            Node permissionNode = permissionsSequence.getValue().get(permissionIndex);
            String permissionKey = "permissions[" + permissionIndex + "]";
            MappingNode permissionMapping = requireMapping(permissionNode, source(resource, permissionNode, permissionKey),
                    permissionKey + " debe ser un mapa.");
            Map<String, Node> permissionFields = readFields(resource, permissionMapping, PERMISSION_FIELDS);
            Node nameNode = requireField(resource, permissionNode, permissionFields, "name", permissionKey + ".name");
            Node descriptionNode = requireField(resource, permissionNode, permissionFields, "description",
                    permissionKey + ".description");
            String name = requireNonEmptyString(resource, nameNode, permissionKey + ".name", "El nombre del permiso");
            String description = requireNonEmptyString(resource, descriptionNode, permissionKey + ".description",
                    "La descripción del permiso");
            CatalogSource nameSource = source(resource, nameNode, permissionKey + ".name");

            permissions.add(new CatalogPermission(name, description, nameSource,
                    source(resource, descriptionNode, permissionKey + ".description")));
        }
        return permissions;
    }

    private CatalogRole parseRole(Resource resource) {
        Node root = parseYaml(resource);
        MappingNode rootMapping = requireMapping(root, source(resource, root, "$"), "La raíz debe ser un mapa.");
        Map<String, Node> roleFields = readFields(resource, rootMapping, ROLE_FIELDS);
        Node nameNode = requireField(resource, root, roleFields, "name", "name");
        Node permissionsNode = requireField(resource, root, roleFields, "permissions", "permissions");
        String name = requireNonEmptyString(resource, nameNode, "name", "El nombre del rol");
        SequenceNode permissionsSequence = requireSequence(permissionsNode, source(resource, permissionsNode, "permissions"),
                "permissions debe ser una lista.");
        List<CatalogPermissionReference> permissions = new ArrayList<>();

        for (int permissionIndex = 0; permissionIndex < permissionsSequence.getValue().size(); permissionIndex++) {
            Node permissionNode = permissionsSequence.getValue().get(permissionIndex);
            String permissionKey = "permissions[" + permissionIndex + "]";
            String permissionName = requireNonEmptyString(resource, permissionNode, permissionKey,
                    "La referencia de permiso");
            permissions.add(new CatalogPermissionReference(permissionName, source(resource, permissionNode, permissionKey)));
        }
        return new CatalogRole(name, List.copyOf(permissions), source(resource, nameNode, "name"));
    }

    private Node parseYaml(Resource resource) {
        LoaderOptions loaderOptions = new LoaderOptions();
        loaderOptions.setAllowDuplicateKeys(false);
        Yaml yaml = new Yaml(new SafeConstructor(loaderOptions));
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            Node root = yaml.compose(reader);
            if (root == null) {
                throw new CatalogValidationException("El archivo YAML está vacío: " + resourcePath(resource));
            }
            rejectDuplicateKeys(resource, root, "$");
            return root;
        } catch (CatalogValidationException exception) {
            throw exception;
        } catch (MarkedYAMLException exception) {
            int line = exception.getProblemMark() == null ? 1 : exception.getProblemMark().getLine() + 1;
            throw new CatalogValidationException(new CatalogSource(resourcePath(resource), line, "$").describe()
                    + ": YAML inválido.", exception);
        } catch (Exception exception) {
            throw new CatalogValidationException("No se pudo leer el archivo YAML " + resourcePath(resource) + ".",
                    exception);
        }
    }

    private void rejectDuplicateKeys(Resource resource, Node node, String keyPath) {
        if (node instanceof MappingNode mappingNode) {
            Map<String, Node> seenKeys = new HashMap<>();
            for (NodeTuple tuple : mappingNode.getValue()) {
                if (!(tuple.getKeyNode() instanceof ScalarNode keyNode)) {
                    throw new CatalogValidationException(source(resource, tuple.getKeyNode(), keyPath)
                            .describe() + ": las claves YAML deben ser cadenas.");
                }
                String key = keyNode.getValue();
                Node previousKey = seenKeys.putIfAbsent(key, keyNode);
                if (previousKey != null) {
                    throw new CatalogValidationException(source(resource, keyNode, keyPath + "." + key).describe()
                            + ": clave YAML duplicada '" + key + "' (primera aparición en la línea "
                            + line(previousKey) + ").");
                }
                rejectDuplicateKeys(resource, tuple.getValueNode(), keyPath + "." + key);
            }
        } else if (node instanceof SequenceNode sequenceNode) {
            for (int index = 0; index < sequenceNode.getValue().size(); index++) {
                rejectDuplicateKeys(resource, sequenceNode.getValue().get(index), keyPath + "[" + index + "]");
            }
        }
    }

    private Map<String, Node> readFields(Resource resource, MappingNode mappingNode, Set<String> allowedFields) {
        Map<String, Node> fields = new HashMap<>();
        for (NodeTuple tuple : mappingNode.getValue()) {
            if (!(tuple.getKeyNode() instanceof ScalarNode keyNode) || !keyNode.getTag().getValue().equals("tag:yaml.org,2002:str")) {
                throw new CatalogValidationException(source(resource, tuple.getKeyNode(), "$")
                        .describe() + ": las claves deben ser cadenas.");
            }
            String key = keyNode.getValue();
            if (!allowedFields.contains(key)) {
                throw new CatalogValidationException(source(resource, keyNode, key).describe()
                        + ": campo no reconocido '" + key + "'.");
            }
            fields.put(key, tuple.getValueNode());
        }
        return fields;
    }

    private Node requireField(Resource resource, Node parent, Map<String, Node> fields, String fieldName, String key) {
        Node field = fields.get(fieldName);
        if (field == null) {
            throw new CatalogValidationException(source(resource, parent, key).describe()
                    + ": falta el campo obligatorio '" + fieldName + "'.");
        }
        return field;
    }

    private MappingNode requireMapping(Node node, CatalogSource source, String message) {
        if (!(node instanceof MappingNode mappingNode)) {
            throw invalid(source, message);
        }
        return mappingNode;
    }

    private SequenceNode requireSequence(Node node, CatalogSource source, String message) {
        if (!(node instanceof SequenceNode sequenceNode)) {
            throw invalid(source, message);
        }
        return sequenceNode;
    }

    private CatalogValidationException invalid(CatalogSource source, String message) {
        return new CatalogValidationException(source.describe() + ": " + message);
    }

    private String requireNonEmptyString(Resource resource, Node node, String key, String fieldDescription) {
        if (!(node instanceof ScalarNode scalarNode) || !scalarNode.getTag().getValue().equals("tag:yaml.org,2002:str")) {
            throw invalid(source(resource, node, key), fieldDescription + " debe ser una cadena.");
        }
        String value = scalarNode.getValue();
        if (value.isBlank()) {
            throw invalid(source(resource, node, key), fieldDescription + " no puede estar vacío.");
        }
        return value;
    }

    private CatalogSource source(Resource resource, Node node, String key) {
        return new CatalogSource(resourcePath(resource), line(node), key);
    }

    private String resourcePath(Resource resource) {
        String description = resource.getDescription();
        int pathStart = description.lastIndexOf('[');
        int pathEnd = description.lastIndexOf(']');
        if (pathStart >= 0 && pathEnd > pathStart) {
            return description.substring(pathStart + 1, pathEnd);
        }
        return description;
    }

    private int line(Node node) {
        Mark mark = node.getStartMark();
        return mark == null ? 1 : mark.getLine() + 1;
    }

    private List<Resource> sortResources(Resource[] resources) {
        return java.util.Arrays.stream(resources)
                .sorted(Comparator.comparing(Resource::getDescription))
                .toList();
    }
}
