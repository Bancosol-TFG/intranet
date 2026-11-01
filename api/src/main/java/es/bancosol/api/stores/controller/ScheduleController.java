package es.bancosol.api.stores.controller;

import java.util.List;
import es.bancosol.api.stores.dto.ScheduleDayResponse;
import es.bancosol.api.stores.dto.ScheduleRequest;
import es.bancosol.api.stores.dto.ScheduleResponse;
import es.bancosol.api.stores.service.ScheduleService;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores/{storeId}/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService service;

    @GetMapping
    @RequiresPermission(PermissionCode.SCHEDULE_LIST)
    public List<ScheduleDayResponse> list(@PathVariable Integer storeId) {
        return service.list(storeId);
    }

    @PostMapping
    @RequiresPermission(PermissionCode.SCHEDULE_CREATE)
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleResponse create(@PathVariable Integer storeId, @Valid @RequestBody ScheduleRequest request) {
        return service.create(storeId, request);
    }

    @PutMapping("/{scheduleId}")
    @RequiresPermission(PermissionCode.SCHEDULE_UPDATE)
    public ScheduleResponse update(@PathVariable Integer storeId, @PathVariable Integer scheduleId,
                                   @Valid @RequestBody ScheduleRequest request) {
        return service.update(storeId, scheduleId, request);
    }

    @DeleteMapping("/{scheduleId}")
    @RequiresPermission(PermissionCode.SCHEDULE_DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer storeId, @PathVariable Integer scheduleId) {
        service.delete(storeId, scheduleId);
    }
}
