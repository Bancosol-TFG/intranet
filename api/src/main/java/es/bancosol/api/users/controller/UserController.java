package es.bancosol.api.users.controller;

import es.bancosol.api.users.dto.CreatedUserResponse;
import es.bancosol.api.users.dto.UserRequest;
import es.bancosol.api.users.service.UserService;
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
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedUserResponse create(@Valid @RequestBody UserRequest request) {
        return service.create(request);
    }
}
