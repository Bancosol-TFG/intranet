package es.bancosol.api.stores.dto;

import es.bancosol.api.stores.dto.ChainResponse;
import es.bancosol.api.stores.entity.Store;

public record StoreResponse(Integer id, String name, String address, Integer checkoutShelfs, ChainResponse chain) {
    public static StoreResponse from(Store store) {
        return new StoreResponse(store.getId(), store.getName(), store.getAddress(), store.getCheckoutShelfs(),
                ChainResponse.from(store.getChain()));
    }
}
