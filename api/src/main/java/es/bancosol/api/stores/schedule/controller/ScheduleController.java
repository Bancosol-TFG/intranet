package es.bancosol.api.stores.schedule.controller;

import java.util.List;
import es.bancosol.api.stores.schedule.dto.ScheduleDayResponse;
import es.bancosol.api.stores.schedule.dto.ScheduleRequest;
import es.bancosol.api.stores.schedule.dto.ScheduleResponse;
import es.bancosol.api.stores.schedule.service.ScheduleService;
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
    public List<ScheduleDayResponse> list(@PathVariable Integer storeId) {
        return service.list(storeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleResponse create(@PathVariable Integer storeId, @Valid @RequestBody ScheduleRequest request) {
        return service.create(storeId, request);
    }

    @PutMapping("/{scheduleId}")
    public ScheduleResponse update(@PathVariable Integer storeId, @PathVariable Integer scheduleId,
                                   @Valid @RequestBody ScheduleRequest request) {
        return service.update(storeId, scheduleId, request);
    }

    @DeleteMapping("/{scheduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer storeId, @PathVariable Integer scheduleId) {
        service.delete(storeId, scheduleId);
    }
}
