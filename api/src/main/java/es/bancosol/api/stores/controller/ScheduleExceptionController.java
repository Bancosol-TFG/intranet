package es.bancosol.api.stores.controller;

import java.time.LocalDate;
import es.bancosol.api.stores.dto.ScheduleExceptionRequest;
import es.bancosol.api.stores.dto.ScheduleExceptionResponse;
import es.bancosol.api.stores.service.ScheduleExceptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores/{storeId}/schedule-exceptions")
@RequiredArgsConstructor
public class ScheduleExceptionController {
    private final ScheduleExceptionService service;

    @GetMapping
    public PagedModel<ScheduleExceptionResponse> list(@PathVariable Integer storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(sort = {"date", "openingTime"}) Pageable pageable) {
        return new PagedModel<>(service.list(storeId, from, to, pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleExceptionResponse create(@PathVariable Integer storeId,
                                            @Valid @RequestBody ScheduleExceptionRequest request) {
        return service.create(storeId, request);
    }

    @PutMapping("/{exceptionId}")
    public ScheduleExceptionResponse update(@PathVariable Integer storeId, @PathVariable Integer exceptionId,
                                            @Valid @RequestBody ScheduleExceptionRequest request) {
        return service.update(storeId, exceptionId, request);
    }

    @DeleteMapping("/{exceptionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer storeId, @PathVariable Integer exceptionId) {
        service.delete(storeId, exceptionId);
    }
}
