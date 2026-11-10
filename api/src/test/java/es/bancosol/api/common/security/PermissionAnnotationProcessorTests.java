package es.bancosol.api.common.security;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import javax.annotation.processing.Processor;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PermissionAnnotationProcessorTests {
    private static final String PERMISSION_ANNOTATION_PROCESSOR_CLASS =
            "es.bancosol.api.security.processor.PermissionAnnotationProcessor";

    @Test
    void acceptsUserCreatePermissionAnnotationOnControllerEndpoint() throws IOException {
        CompilationResult result = compileSource("example.UserController", """
                package example;

                import es.bancosol.api.common.security.PermissionCode;
                import es.bancosol.api.common.security.RequiresPermission;
                import org.springframework.web.bind.annotation.PostMapping;
                import org.springframework.web.bind.annotation.RestController;

                @RestController
                public class UserController {
                    @PostMapping("/users")
                    @RequiresPermission(PermissionCode.USER_CREATE)
                    public String create() {
                        return "user";
                    }
                }
                """);

        assertThat(result.successful()).isTrue();
        assertThat(result.diagnostics()).noneMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR);
    }

    @Test
    void acceptsPublicAnnotationOnControllerEndpoint() throws IOException {
        CompilationResult result = compileSource("example.PublicController", """
                package example;

                import es.bancosol.api.common.security.Public;
                import org.springframework.web.bind.annotation.GetMapping;
                import org.springframework.web.bind.annotation.RestController;

                @RestController
                public class PublicController {
                    @GetMapping("/health")
                    @Public
                    public String health() {
                        return "ok";
                    }
                }
                """);

        assertThat(result.successful()).isTrue();
        assertThat(result.diagnostics()).noneMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR);
    }

    @Test
    void acceptsAuthenticationAnnotationOnControllerEndpoint() throws IOException {
        CompilationResult result = compileSource("example.AuthenticatedController", """
                package example;

                import es.bancosol.api.common.security.RequiresAuthentication;
                import org.springframework.web.bind.annotation.GetMapping;
                import org.springframework.web.bind.annotation.RestController;

                @RestController
                public class AuthenticatedController {
                    @GetMapping("/me")
                    @RequiresAuthentication
                    public String currentUser() {
                        return "user";
                    }
                }
                """);

        assertThat(result.successful()).isTrue();
        assertThat(result.diagnostics()).noneMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR);
    }

    @Test
    void rejectsPermissionAnnotationOutsideController() throws IOException {
        CompilationResult result = compileSource("example.Service", """
                package example;

                import es.bancosol.api.common.security.PermissionCode;
                import es.bancosol.api.common.security.RequiresPermission;

                public class Service {
                    @RequiresPermission(PermissionCode.ZONE_LIST)
                    public String list() {
                        return "zones";
                    }
                }
                """);

        assertThat(result.successful()).isFalse();
        assertThat(result.diagnostics())
                .anyMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR
                        && diagnostic.getMessage(null).contains("etiquetas de acceso solo se pueden usar"));
    }

    @Test
    void rejectsControllerEndpointWithoutAccessAnnotation() throws IOException {
        CompilationResult result = compileSource("example.UnprotectedController", """
                package example;

                import org.springframework.web.bind.annotation.GetMapping;
                import org.springframework.web.bind.annotation.RestController;

                @RestController
                public class UnprotectedController {
                    @GetMapping("/zones")
                    public String list() {
                        return "zones";
                    }
                }
                """);

        assertThat(result.successful()).isFalse();
        assertThat(result.diagnostics())
                .anyMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR
                        && diagnostic.getMessage(null).contains("debe declarar exactamente una etiqueta de acceso"));
    }

    @Test
    void rejectsControllerEndpointWithMultipleAccessAnnotations() throws IOException {
        CompilationResult result = compileSource("example.ConflictingController", """
                package example;

                import es.bancosol.api.common.security.PermissionCode;
                import es.bancosol.api.common.security.Public;
                import es.bancosol.api.common.security.RequiresPermission;
                import org.springframework.web.bind.annotation.GetMapping;
                import org.springframework.web.bind.annotation.RestController;

                @RestController
                public class ConflictingController {
                    @GetMapping("/zones")
                    @Public
                    @RequiresPermission(PermissionCode.ZONE_LIST)
                    public String list() {
                        return "zones";
                    }
                }
                """);

        assertThat(result.successful()).isFalse();
        assertThat(result.diagnostics())
                .anyMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR
                        && diagnostic.getMessage(null).contains("exactamente una etiqueta de acceso"));
    }

    @Test
    void rejectsPublicAnnotationOutsideController() throws IOException {
        CompilationResult result = compileSource("example.Service", """
                package example;

                import es.bancosol.api.common.security.Public;

                public class Service {
                    @Public
                    public String getData() {
                        return "data";
                    }
                }
                """);

        assertThat(result.successful()).isFalse();
        assertThat(result.diagnostics())
                .anyMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR
                        && diagnostic.getMessage(null).contains("etiquetas de acceso solo se pueden usar"));
    }

    @Test
    void unknownPermissionEnumValueDoesNotCompile() throws IOException {
        CompilationResult result = compileSource("example.UnknownPermissionController", """
                package example;

                import es.bancosol.api.common.security.PermissionCode;
                import es.bancosol.api.common.security.RequiresPermission;
                import org.springframework.web.bind.annotation.GetMapping;
                import org.springframework.web.bind.annotation.RestController;

                @RestController
                public class UnknownPermissionController {
                    @GetMapping("/zones")
                    @RequiresPermission(PermissionCode.ZONE_DOES_NOT_EXIST)
                    public String list() {
                        return "zones";
                    }
                }
                """);

        assertThat(result.successful()).isFalse();
        assertThat(result.diagnostics())
                .anyMatch(diagnostic -> diagnostic.getKind() == Diagnostic.Kind.ERROR);
    }

    private CompilationResult compileSource(String className, String source) throws IOException {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        assertThat(compiler).isNotNull();

        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        Path outputDirectory = Files.createTempDirectory("permission-processor-test");
        JavaFileObject sourceFile = new StringJavaFileObject(className, source);

        try (StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null)) {
            List<String> compilerOptions = List.of(
                    "-classpath", System.getProperty("java.class.path"),
                    "-d", outputDirectory.toString());
            JavaCompiler.CompilationTask compilationTask = compiler.getTask(
                    null,
                    fileManager,
                    diagnostics,
                    compilerOptions,
                    null,
                    List.of(sourceFile));
            compilationTask.setProcessors(List.of(createPermissionAnnotationProcessor()));
            boolean successful = Boolean.TRUE.equals(compilationTask.call());
            return new CompilationResult(successful, diagnostics.getDiagnostics());
        } finally {
            deleteDirectory(outputDirectory);
        }
    }

    private Processor createPermissionAnnotationProcessor() {
        try {
            Class<?> processorClass = Class.forName(
                    PERMISSION_ANNOTATION_PROCESSOR_CLASS,
                    true,
                    PermissionAnnotationProcessorTests.class.getClassLoader());
            return Processor.class.cast(processorClass.getDeclaredConstructor().newInstance());
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Unable to load the permission annotation processor.", exception);
        }
    }

    private void deleteDirectory(Path directory) throws IOException {
        try (Stream<Path> paths = Files.walk(directory)) {
            for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                Files.deleteIfExists(path);
            }
        }
    }

    private record CompilationResult(boolean successful, List<Diagnostic<? extends JavaFileObject>> diagnostics) {
    }

    private static class StringJavaFileObject extends SimpleJavaFileObject {
        private final String source;

        private StringJavaFileObject(String className, String source) {
            super(URI.create("string:///" + className.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
            this.source = source;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return source;
        }
    }
}
