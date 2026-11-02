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
    private static final String REQUIRES_AUTHENTICATION_ANNOTATION = "es.bancosol.api.common.security.RequiresAuthentication";
    private static final String PUBLIC_ANNOTATION = "es.bancosol.api.common.security.Public";
    private static final Set<String> ACCESS_ANNOTATIONS = Set.of(
            REQUIRES_PERMISSION_ANNOTATION,
            REQUIRES_AUTHENTICATION_ANNOTATION,
            PUBLIC_ANNOTATION);
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

    private final Set<String> validatedEndpoints = new HashSet<>();
    private final Set<String> validatedAnnotations = new HashSet<>();

    @Override
    public Set<String> getSupportedAnnotationTypes() {
        return Set.of("*");
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnvironment) {
        for (String accessAnnotation : ACCESS_ANNOTATIONS) {
            TypeElement annotationElement = processingEnv.getElementUtils().getTypeElement(accessAnnotation);
            if (annotationElement == null) {
                processingEnv.getMessager().printMessage(
                        Diagnostic.Kind.ERROR,
                        accessAnnotation + " no encontrado.");
                continue;
            }
            validateAccessAnnotationUsage(roundEnvironment, annotationElement, accessAnnotation);
        }

        validateEndpointAccessDeclarations(roundEnvironment);
        return false;
    }

    private void validateAccessAnnotationUsage(
            RoundEnvironment roundEnvironment,
            TypeElement annotationElement,
            String annotationName) {
        for (Element element : roundEnvironment.getElementsAnnotatedWith(annotationElement)) {
            String annotationKey = annotationName + ":" + element;
            if (!validatedAnnotations.add(annotationKey)) {
                continue;
            }
            if (element.getKind() != ElementKind.METHOD || !isController(element.getEnclosingElement())) {
                processingEnv.getMessager().printMessage(
                    Diagnostic.Kind.ERROR,
                    "Las etiquetas de acceso solo se pueden usar en métodos de clases @Controller o @RestController.",
                    element);
            }
        }
    }

    private void validateEndpointAccessDeclarations(RoundEnvironment roundEnvironment) {
        for (Element rootElement : roundEnvironment.getRootElements()) {
            validateTypeAndNestedEndpoints(rootElement);
        }
    }

    private void validateTypeAndNestedEndpoints(Element element) {
        if (element instanceof TypeElement typeElement && isController(typeElement)) {
            for (Element enclosedElement : typeElement.getEnclosedElements()) {
                if (!(enclosedElement instanceof ExecutableElement method) || !isHttpEndpoint(method)) {
                    continue;
                }

                String endpointKey = typeElement.getQualifiedName() + "#" + method;
                if (!validatedEndpoints.add(endpointKey)) {
                    continue;
                }

                long accessDeclarationCount = method.getAnnotationMirrors().stream()
                        .map(annotationMirror -> annotationMirror.getAnnotationType().toString())
                        .filter(ACCESS_ANNOTATIONS::contains)
                        .count();
                if (accessDeclarationCount != 1) {
                    processingEnv.getMessager().printMessage(
                            Diagnostic.Kind.ERROR,
                            "El endpoint HTTP debe declarar exactamente una etiqueta de acceso: "
                                    + "@RequiresPermission, @RequiresAuthentication o @Public.",
                            method);
                }
            }
        }

        for (Element enclosedElement : element.getEnclosedElements()) {
            if (enclosedElement.getKind().isClass() || enclosedElement.getKind().isInterface()) {
                validateTypeAndNestedEndpoints(enclosedElement);
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

}
