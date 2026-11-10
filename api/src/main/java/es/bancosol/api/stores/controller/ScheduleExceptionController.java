package es.bancosol.api.stores.controller;

import java.time.LocalDate;
import es.bancosol.api.stores.dto.ScheduleExceptionRequest;
import es.bancosol.api.stores.dto.ScheduleExceptionDayRequest;
import es.bancosol.api.stores.dto.ScheduleExceptionResponse;
import es.bancosol.api.stores.service.ScheduleExceptionService;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores/{storeId}/schedule-exceptions")
@RequiredArgsConstructor
public class ScheduleExceptionController {
    private final ScheduleExceptionService service;

    @PutMapping("/day")
    @RequiresPermission(PermissionCode.SCHEDULE_EXCEPTION_CREATE)
    @PreAuthorize("hasAuthority('SCHEDULE_EXCEPTION_UPDATE') and hasAuthority('SCHEDULE_EXCEPTION_DELETE')")
    public java.util.List<ScheduleExceptionResponse> replaceDay(@PathVariable Integer storeId,
            @Valid @RequestBody ScheduleExceptionDayRequest request) {
        return service.replaceDay(storeId, request);
    }

    @GetMapping
    @RequiresPermission(PermissionCode.SCHEDULE_EXCEPTION_LIST)
    public PagedModel<ScheduleExceptionResponse> list(@PathVariable Integer storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(sort = {"date", "openingTime"}) Pageable pageable) {
        return new PagedModel<>(service.list(storeId, from, to, pageable));
    }

    @PostMapping
    @RequiresPermission(PermissionCode.SCHEDULE_EXCEPTION_CREATE)
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleExceptionResponse create(@PathVariable Integer storeId,
                                            @Valid @RequestBody ScheduleExceptionRequest request) {
        return service.create(storeId, request);
    }

    @PutMapping("/{exceptionId}")
    @RequiresPermission(PermissionCode.SCHEDULE_EXCEPTION_UPDATE)
    public ScheduleExceptionResponse update(@PathVariable Integer storeId, @PathVariable Integer exceptionId,
                                            @Valid @RequestBody ScheduleExceptionRequest request) {
        return service.update(storeId, exceptionId, request);
    }

    @DeleteMapping("/{exceptionId}")
    @RequiresPermission(PermissionCode.SCHEDULE_EXCEPTION_DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer storeId, @PathVariable Integer exceptionId) {
        service.delete(storeId, exceptionId);
    }
}
