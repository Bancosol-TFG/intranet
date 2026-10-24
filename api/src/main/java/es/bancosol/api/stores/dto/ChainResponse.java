package es.bancosol.api.stores.dto;

import es.bancosol.api.stores.entity.Chain;

public record ChainResponse(Integer id, String code) {
    public static ChainResponse from(Chain chain) {
        return new ChainResponse(chain.getId(), chain.getCode());
    }
}
