type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  approved_at: string;
  role: "admin" | "manager" | "client";
  avatar_image_id: number | null;
  address_id?: number;
  created_at: string;
  updated_at: string;
  client_code_id?: number;
  client_code?: ClientCode;

  permissions?: {
    can_use_special_prices: boolean;
  };

  avatar_image?: AppImage;
};

type Product = {
  id: number;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  description: string;
  category_id?: number;
  category?: Category;
  variants?: Variant[];
  images?: AppImage[];
  variant_groups?: VariantGroup[];
};

type Category = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  parent_id?: number;
};

type Variant = {
  id: number;
  created_at: string;
  updated_at: string;
  product_id: number;
  sku: string;
  price: number;                     // base price (before any discounts)
  stock: number;
  image_id: string | null;

  // Computed fields (added via accessors)
  effective_price?: number;           // final price after promotions (if user eligible)
  applied_promotions?: AppliedPromotion[]; // list of promotions that contributed to the discount

  product?: Product;
  variant_options?: VariantOption[];
  promotions?: Promotion[];          // all active promotions linked to this variant
  image?: AppImage;
};

type VariantGroup = {
  id: number;
  created_at: string;
  updated_at: string;
  product_id: number;
  name: string;
  variant_options?: VariantOption[];
};

type AppImage = {
  id: number;
  url: string;
  width: number;
  height: number;
};

type VariantOption = {
  id: number;
  created_at: string;
  updated_at: string;
  value: string;
  variant_group_id: number;
  variants?: Variant[];
  variant_group?: VariantGroup;
};

type Promotion = {
  id: number;
  created_at: string;
  updated_at: string;
  discount: number;                  // amount (percentage or fixed)
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  start_date: string;
  end_date: string;
  is_active: boolean;
  name: string;                      // e.g. "Partner Discount"
  badge?: string;

  // New fields for eligibility and stacking
  applies_to: "all" | "client_code_only" | "regular_only";
  stackable: boolean;
  priority: number;                  // lower = higher priority (used when stackable = false)
  apply_order?: "percentage_first" | "fixed_first"; // order when stacking
  max_discount?: number;              // optional absolute cap
};

// Simplified version of a promotion for display in badges
type AppliedPromotion = {
  id: number;
  name: string;                      // e.g. "Partner Discount"
  badge?: string;                     // e.g. "PARTNER", "SALE" – used to style the badge
  discount: number;                   // amount applied (for tooltips etc.)
  type: "PERCENTAGE" | "FIXED_AMOUNT";
};

type CartItem = {
  id: number;
  order_uuid: string | null;

  user_id: number;
  product_id: number;
  variant_id: number;

  count: number;

  unit_price: number;                  // price per item at time of addition (after promotions)
  promotion_discount_applied: number;   // total discount applied
  total: number;                        // final total (count * unit_price - discounts)

  // Snapshots
  product_snapshot: ProductSnapshot;
  variant_snapshot: VariantSnapshot;
  variant_options_snapshot: VariantOptionsSnapshot;
  applied_promotions_snapshot?: AppliedPromotion[]; // promotions that contributed to the final price

  created_at: string;
  updated_at: string;

  variant?: Variant;
  product?: Product;
  user?: User;
  order?: Order;
};

type ProductSnapshot = {
  id: number;
  title: string;
  slug: string;
  main_image: string | null;
  category_id?: number;
};

type VariantSnapshot = {
  id: number;
  sku: string;
  price: number;                      // base price at time of addition (before promotions)
  image: string | null;
};

type VariantOptionsSnapshot = {
  [group: string]: string;
};

type Address = {
  id: number;
  fullname: string;
  line1: string;
  line2: string | null;
  line3: string | null;
  phone_number: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_default: boolean;
};

type Order = {
  uuid: string;
  created_at: string;
  updated_at: string;
  total: number;
  user_id: number;
  address_id: number;
  coupon_id: number | null;
  coupon_discount_applied: number;
  deleted_at: string | null;

  address_snapshot: Address;
  coupon_snapshot?: Pick<Coupon, "id" | "code" | "type" | "discount" | "min_order_value">;
  cart_items?: CartItem[];
  shipments?: Shipment[];
  transactions?: Transaction[];
};

type Coupon = {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  discount: number;
  min_order_value: number;
  max_uses: number;
  uses_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type Shipment = {
  id: number;
  created_at: string;
  updated_at: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  data?: ShipmentData;
  order_uuid: string;

  order?: Order;
};

type ShipmentData = {
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  shipped_date?: string;
};

type Transaction = {
  id: number;
  created_at: string;
  updated_at: string;
  status: "FAILED" | "PENDING" | "SUCCESS";
  informations: Record<string, any>;
  user_id: number;
  order_uuid: string;
  deleted_at: string | null;
  method: "VISA" | "MASTERCARD" | "ORANGEMONEY" | "AIRTELMONEY" | "MVOLA" | "PAYPAL";
  payment_url: string | null;
  user?: User;
  order?: Order;
  amount: number;
};

type TransactionNotificationData = {
  notification_type: "transaction";
  type: "payment_success" | "payment_failed";
  transaction_id: number;
  order_uuid: string;
  amount: number;
  payment_method: string;
  message: string;
  order_total: number;
};

type ShipmentNotificationData = {
  notification_type: "shipment";
  shipment_id: number;
  order_uuid: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  message: string;
  shipment_data?: {
    carrier?: string;
    tracking_number?: string;
    estimated_delivery?: string;
  };
};

type OtherNotificationData = {
  notification_type: "system";
  title: string;
  message: string;
};

type NotificationData = TransactionNotificationData | ShipmentNotificationData | OtherNotificationData;

type AppNotification = {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClientCode = {
  id: number;
  code: string;
  is_active: boolean;
  max_uses?: number;
  created_at: string;
};