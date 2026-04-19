import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import formatDate from '~/lib/format-date';

type ShipmentStatusProps = {
  shipments: Shipment[];
};

export default function ShipmentStatus({ shipments }: ShipmentStatusProps) {
  // Get the most recent shipment
  const latestShipment = shipments.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0];

  const getStatusConfig = (status: Shipment['status']) => {
    const base = {
      size: "w-4 h-4",
    };

    switch (status) {
      case 'PROCESSING':
        return {
          ...base,
          icon: Package,
          label: 'Processing',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          dotColor: 'bg-blue-500',
        };

      case 'SHIPPED':
        return {
          ...base,
          icon: Truck,
          label: 'Shipped',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          dotColor: 'bg-orange-500',
        };

      case 'DELIVERED':
        return {
          ...base,
          icon: CheckCircle,
          label: 'Delivered',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          dotColor: 'bg-green-500',
        };

      default:
        return {
          ...base,
          icon: Clock,
          label: 'Pending',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          dotColor: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig(latestShipment.status);
  const Icon = config.icon;
  const shipmentData = latestShipment.data as ShipmentData;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header with Status */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Shipment Status</h3>
          <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
        </div>
      </div>

      {/* Status-specific Information */}
      <div className="space-y-3">
        {latestShipment.status === 'PROCESSING' && (
          <div className="text-sm text-gray-600">
            <p>Your order is being prepared for shipment.</p>
            {shipmentData?.estimated_delivery && (
              <div className="flex items-center gap-2 mt-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span>Estimated delivery: {formatDate(shipmentData.estimated_delivery)}</span>
              </div>
            )}
          </div>
        )}

        {latestShipment.status === 'SHIPPED' && (
          <div className="space-y-2">
            {shipmentData?.carrier && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Carrier</span>
                <span className="font-medium text-gray-900">{shipmentData.carrier}</span>
              </div>
            )}

            {shipmentData?.tracking_number && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tracking Number</span>
                <span className="font-mono text-sm font-medium text-gray-900">
                  {shipmentData.tracking_number}
                </span>
              </div>
            )}

            {shipmentData?.shipped_date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipped Date</span>
                <span className="font-medium text-gray-900">
                  {formatDate(shipmentData.shipped_date)}
                </span>
              </div>
            )}

            {shipmentData?.estimated_delivery && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600" />
                <div className="text-sm">
                  <span className="text-gray-700">Estimated delivery: </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(shipmentData.estimated_delivery)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {latestShipment.status === 'DELIVERED' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivered On</span>
              <span className="font-medium text-gray-900">
                {formatDate(latestShipment.updated_at)}
              </span>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Your order has been successfully delivered!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Multiple Shipments Indicator */}
      {shipments.length > 1 && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This order has {shipments.length} shipments
          </p>
        </div>
      )}
    </div>
  );
}