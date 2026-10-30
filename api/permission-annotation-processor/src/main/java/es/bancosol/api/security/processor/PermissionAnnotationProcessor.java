package es.bancosol.api.security.processor;

import java.util.HashSet;
import java.util.Set;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.ExecutableElement;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic;

@SupportedSourceVersion(SourceVersion.RELEASE_25)
public class PermissionAnnotationProcessor extends AbstractProcessor {
    private static final String REQUIRES_PERMISSION_ANNOTATION = "es.bancosol.api.common.security.RequiresPermission";
    private static final Set<String> CONTROLLER_ANNOTATIONS = Set.of(
            "org.springframework.stereotype.Controller",
            "org.springframework.web.bind.annotation.RestController");
    private static final Set<String> HTTP_MAPPING_ANNOTATIONS = Set.of(
            "org.springframework.web.bind.annotation.RequestMapping",
            "org.springframework.web.bind.annotation.GetMapping",
            "org.springframework.web.bind.annotation.PostMapping",
            "org.springframework.web.bind.annotation.PutMapping",
            "org.springframework.web.bind.annotation.PatchMapping",
            "org.springframework.web.bind.annotation.DeleteMapping");

    private final Set<String> warnedEndpoints = new HashSet<>();

    @Override
    public Set<String> getSupportedAnnotationTypes() {
        return Set.of("*");
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnvironment) {
        TypeElement permissionAnnotation = processingEnv.getElementUtils()
                .getTypeElement(REQUIRES_PERMISSION_ANNOTATION);

        if (permissionAnnotation != null) {
            validatePermissionAnnotationUsage(roundEnvironment, permissionAnnotation);
        }

        warnAboutUnprotectedEndpoints(roundEnvironment);
        return false;
    }

    private void validatePermissionAnnotationUsage(
            RoundEnvironment roundEnvironment,
            TypeElement permissionAnnotation) {
        for (Element element : roundEnvironment.getElementsAnnotatedWith(permissionAnnotation)) {
            if (element.getKind() != ElementKind.METHOD || !isController(element.getEnclosingElement())) {
                processingEnv.getMessager().printMessage(
                        Diagnostic.Kind.ERROR,
                        "@RequiresPermission solo se puede usar en métodos de clases @Controller o @RestController.",
                        element);
            }
        }
    }

    private void warnAboutUnprotectedEndpoints(RoundEnvironment roundEnvironment) {
        for (Element rootElement : roundEnvironment.getRootElements()) {
            if (!(rootElement instanceof TypeElement typeElement) || !isController(typeElement)) {
                continue;
            }

            for (Element enclosedElement : typeElement.getEnclosedElements()) {
                if (!(enclosedElement instanceof ExecutableElement method) || !isHttpEndpoint(method)
                        || hasPermission(method)) {
                    continue;
                }

                String endpointKey = typeElement.getQualifiedName() + "#" + method.getSimpleName();
                if (warnedEndpoints.add(endpointKey)) {
                    processingEnv.getMessager().printMessage(
                            Diagnostic.Kind.WARNING,
                            "El endpoint HTTP no declara @RequiresPermission.",
                            method);
                }
            }
        }
    }

    private boolean isController(Element element) {
        return element.getAnnotationMirrors().stream()
                .map(annotationMirror -> annotationMirror.getAnnotationType().toString())
                .anyMatch(CONTROLLER_ANNOTATIONS::contains);
    }

    private boolean isHttpEndpoint(ExecutableElement method) {
        return method.getAnnotationMirrors().stream()
                .map(annotationMirror -> annotationMirror.getAnnotationType().toString())
                .anyMatch(HTTP_MAPPING_ANNOTATIONS::contains);
    }

    private boolean hasPermission(ExecutableElement method) {
        return method.getAnnotationMirrors().stream()
                .anyMatch(annotationMirror -> annotationMirror.getAnnotationType().toString()
                        .equals(REQUIRES_PERMISSION_ANNOTATION));
    }
}