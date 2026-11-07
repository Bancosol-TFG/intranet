package es.bancosol.api.users.controller;

import es.bancosol.api.users.dto.CreatedUserResponse;
import es.bancosol.api.users.dto.UserRequest;
import es.bancosol.api.users.service.UserService;
import es.bancosol.api.common.security.RequiresAuthentication;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @PostMapping
    @RequiresAuthentication
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedUserResponse create(@Valid @RequestBody UserRequest request) {
        return service.create(request);
    }
}
