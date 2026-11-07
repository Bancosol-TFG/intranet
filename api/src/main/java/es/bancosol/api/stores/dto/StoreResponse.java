package es.bancosol.api.stores.dto;

import es.bancosol.api.stores.dto.ChainResponse;
import es.bancosol.api.stores.entity.Store;
import es.bancosol.api.territory.dto.ZoneResponse;

public record StoreResponse(Integer id, String name, String address, Integer checkoutShelfs, ChainResponse chain,
                            ZoneResponse zone) {
    public static StoreResponse from(Store store) {
        return new StoreResponse(store.getId(), store.getName(), store.getAddress(), store.getCheckoutShelfs(),
                ChainResponse.from(store.getChain()), store.getZone() == null ? null : ZoneResponse.from(store.getZone()));
    }
}
