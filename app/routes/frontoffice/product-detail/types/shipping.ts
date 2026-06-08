import type { ShippingMethod } from "wle-core";

export interface ShippingOption {
    method: ShippingMethod;
    cost: number;
}