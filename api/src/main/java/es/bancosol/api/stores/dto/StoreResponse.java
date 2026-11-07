package es.bancosol.api.stores.dto;

import es.bancosol.api.stores.dto.ChainResponse;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.territory.dto.ZoneResponse;
import es.bancosol.api.territory.dto.LocalityResponse;

public record StoreResponse(Integer id, String name, String address, Integer checkoutShelfs, ChainResponse chain,
                            ZoneResponse zone, LocalityResponse locality) {
    public static StoreResponse from(Store store) {
        return new StoreResponse(store.getId(), store.getName(), store.getAddress(), store.getCheckoutShelfs(),
                ChainResponse.from(store.getChain()), store.getZone() == null ? null : ZoneResponse.from(store.getZone()),
                LocalityResponse.from(store.getLocality()));
    }
}
