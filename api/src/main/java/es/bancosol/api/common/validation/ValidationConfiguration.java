package es.bancosol.api.common.validation;

import java.util.Locale;

import jakarta.validation.MessageInterpolator;
import org.springframework.boot.validation.MessageInterpolatorFactory;
import org.springframework.boot.validation.autoconfigure.ValidationConfigurationCustomizer;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ValidationConfiguration {

    @Bean
    ValidationConfigurationCustomizer englishValidationMessages(MessageSource messageSource) {
        MessageInterpolator interpolator = new MessageInterpolatorFactory(messageSource).getObject();
        return configuration -> configuration.messageInterpolator(new MessageInterpolator() {
            @Override
            public String interpolate(String template, Context context) {
                return interpolator.interpolate(template, context, Locale.ENGLISH);
            }

            @Override
            public String interpolate(String template, Context context, Locale locale) {
                return interpolate(template, context);
            }
        });
    }
}
