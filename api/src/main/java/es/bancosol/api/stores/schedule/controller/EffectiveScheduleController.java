package es.bancosol.api.stores.schedule.controller;

import java.time.LocalDate;
import es.bancosol.api.stores.schedule.dto.EffectiveScheduleResponse;
import es.bancosol.api.stores.schedule.service.EffectiveScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores/{storeId}/schedule")
@RequiredArgsConstructor
public class EffectiveScheduleController {
    private final EffectiveScheduleService service;

    @GetMapping
    public EffectiveScheduleResponse get(@PathVariable Integer storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.get(storeId, date);
    }
}
