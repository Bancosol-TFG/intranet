package es.bancosol.api.stores.controller;

import java.time.LocalDate;
import es.bancosol.api.stores.dto.EffectiveScheduleResponse;
import es.bancosol.api.stores.service.EffectiveScheduleService;
import es.bancosol.api.common.security.PermissionCode;
import es.bancosol.api.common.security.RequiresPermission;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores/{storeId}/schedule")
@RequiredArgsConstructor
public class EffectiveScheduleController {
    private final EffectiveScheduleService service;

    @GetMapping
    @RequiresPermission(PermissionCode.EFFECTIVE_SCHEDULE_READ)
    public EffectiveScheduleResponse get(@PathVariable Integer storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.get(storeId, date);
    }
}
