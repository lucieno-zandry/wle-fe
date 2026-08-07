import type { Shipment } from "wle-core";
import { dateStringToNumber } from "./date-string-to-number";

export const getSortedShipments = (shipments: Shipment[]) => {
    const sortedShipments = shipments.sort((a, b) => dateStringToNumber(b.updated_at) - dateStringToNumber(a.updated_at));
    return sortedShipments;
}

export const getActiveShipment = (shipments: Shipment[]) => {
    return shipments.find(s => s.is_active);
}