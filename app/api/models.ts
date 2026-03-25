// ============================================================================
// Core Models
// ============================================================================

type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  role: "admin" | "manager" | "client";
  avatar_image_id?: number;
  created_at: string;
  updated_at: string;
  client_code_id?: number;
  blocked_by_id?: number;
  deleted_at?: string;
  status: UserStatus | null, // computed from the api

  permissions?: {
    can_use_effective_prices: boolean;
  };

  // relations
  avatar_image?: AppImage;
  client_code?: ClientCode;
  cart_items?: CartItem[],
  addresses?: Address[],
  orders?: Order[],
  transactions?: Transaction[],
  refund_requests?: RefundRequest[],
  reviewed_refund_requests?: RefundRequest[],
  performed_transaction_audit_logs?: TransactionAuditLog[],
  reviewed_transactions?: Transaction[],
  statuses?: UserStatus[],
  set_statuses?: UserStatus[],
};

type UserStatus = {
  id: number;
  user_id: number;
  status: "approved" | "blocked" | "suspended";
  reason?: string;
  set_by?: number;
  created_at: string;
  expires_at?: string;

  user?: User;
  set_by_user?: User;
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
  price: number;
  stock: number;
  image_id: string | null;

  effective_price?: number;
  applied_promotions?: AppliedPromotion[];

  product?: Product;
  variant_options?: VariantOption[];
  promotions?: Promotion[];
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
  discount: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  start_date: string;
  end_date: string;
  is_active: boolean;
  name: string;
  badge?: string;

  applies_to: "all" | "client_code_only" | "regular_only";
  stackable: boolean;
  priority: number;
  apply_order?: "percentage_first" | "fixed_first";
  max_discount?: number;
  variants?: Variant[];
};

type AppliedPromotion = {
  id: number;
  name: string;
  badge?: string;
  discount: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
};

type CartItem = {
  id: number;
  order_uuid: string | null;

  user_id: number;
  product_id: number;
  variant_id: number;

  count: number;

  unit_price: number;
  promotion_discount_applied: number;
  total: number;

  product_snapshot: ProductSnapshot;
  variant_snapshot: VariantSnapshot;
  variant_options_snapshot: VariantOptionsSnapshot;
  applied_promotions_snapshot?: AppliedPromotion[];

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
  price: number;
  image: string | null;
};

type VariantOptionsSnapshot = {
  [group: string]: string;
};

// Updated Address type
type Address = {
  id: number;
  user_id: number;
  label?: string;               // e.g., "Home", "Work"
  recipient_name: string;       // instead of fullname
  phone: string;                // primary phone
  phone_alt?: string;           // secondary phone
  line1: string;                // street address
  line2?: string;               // apartment, suite, etc.
  city: string;
  state?: string;               // state/province/region
  postal_code: string;          // postal code
  country: string;              // ISO 3166-1 alpha-2 code
  address_type?: "billing" | "shipping" | "both";
  is_default: boolean;
  created_at: string;
  updated_at: string;

  user?: User;
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
  user?: User;
  refund_requests?: RefundRequest[],
  coupon?: Coupon;
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

  orders?: Order[],
};

type Shipment = {
  id: number;
  created_at: string;
  updated_at: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  data?: ShipmentData;
  order_uuid: string;
  is_active: boolean;

  order?: Order;
};

type ShipmentData = {
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  shipped_date?: string;
};

// ----------------------------------------------------------------------------
// Transaction & related types (updated)
// ----------------------------------------------------------------------------
type TransactionType = "PAYMENT" | "REFUND" | "MANUAL";
type DisputeStatus = "OPEN" | "RESOLVED" | "LOST";

type Transaction = {
  uuid: string;                       // primary key (UUID)
  created_at: string;
  updated_at: string;
  status: "FAILED" | "PENDING" | "SUCCESS";
  informations: Record<string, any>;
  user_id: number;
  order_uuid: string;
  deleted_at?: string;
  method: "VISA" | "MASTERCARD" | "ORANGEMONEY" | "AIRTELMONEY" | "MVOLA" | "PAYPAL";
  payment_url?: string;
  amount: number;

  type: TransactionType;
  parent_transaction_uuid?: string;
  payment_reference?: string;
  reviewed_at?: string;
  reviewed_by?: number;
  notes?: string;
  dispute_status?: DisputeStatus;
  dispute_opened_at?: string;
  dispute_resolved_at?: string;
  dispute_reason?: string;      // 👈 new field

  // Relations
  user?: User;
  order?: Order;
  parent_transaction?: Transaction | null;
  child_transactions?: Transaction[];
  audit_logs?: TransactionAuditLog[];
  webhook_logs?: PaymentWebhookLog[];
  refund_requests?: RefundRequest[];
  reviewer?: User   // 👈 new relation
};

type TransactionAuditLog = {
  id: number;
  transaction_uuid: string;
  performed_by?: number | null;
  action: string;
  old_value?: string | null;
  new_value?: string | null;
  reason?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  performed_by_user?: User | null;
};

type WebhookLogStatus = "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";

type PaymentWebhookLog = {
  id: number;
  transaction_uuid?: string | null;
  order_uuid?: string | null;
  gateway: string;
  event_type?: string | null;
  payload: Record<string, any>;
  response?: Record<string, any> | null;
  status: WebhookLogStatus;
  error_message?: string | null;
  source_ip?: string | null;
  created_at: string;
  updated_at: string;
};

// ----------------------------------------------------------------------------
// New RefundRequest model
// ----------------------------------------------------------------------------
type RefundRequest = {
  id: number;
  uuid: string;                         // primary key (UUID)
  user_id: number;
  transaction_uuid: string;
  order_uuid: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  user?: User;
  transaction?: Transaction;
  reviewer?: User;
  order?: Order;
};

// ----------------------------------------------------------------------------
// Notification types (updated)
// ----------------------------------------------------------------------------
type TransactionNotificationData = {
  notification_type: "transaction";
  type: "payment_success" | "payment_failed";
  transaction_uuid?: string;            // note: originally transaction_id, but updated to match new UUID
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

type RefundNotificationData = {
  notification_type: "refund";
  type: "refund_requested" | "refund_approved" | "refund_rejected";
  refund_request_uuid?: string;
  transaction_uuid?: string;
  refund_transaction_uuid?: string;     // for approved
  order_uuid?: string;
  amount?: number;
  customer_name?: string;
  reason?: string;
  admin_notes?: string;
  message: string;
};

type DisputeNotificationData = {
  notification_type: "dispute";
  type: "dispute_opened" | "dispute_resolved" | "dispute_cancelled";
  transaction_uuid: string;
  order_uuid?: string;
  customer_name?: string;
  reason?: string;
  outcome?: string;                     // for resolved
  amount?: number;
  message: string;
};

type ClientCodeNotificationData = {
  notification_type: "client_code";
  action: "attach" | "detach";
  user_id: number;
  user_name: string;
  client_code: string;
  performed_by?: number;
  performed_by_name?: string;
  message: string;
};


type OtherNotificationData = {
  notification_type: "system";
  title: string;
  message: string;
};

type NotificationData =
  | TransactionNotificationData
  | ShipmentNotificationData
  | RefundNotificationData
  | DisputeNotificationData
  | OtherNotificationData
  | ClientCodeNotificationData;

type AppNotification = {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

// ----------------------------------------------------------------------------
// ClientCode (unchanged)
// ----------------------------------------------------------------------------
type ClientCode = {
  id: number;
  code: string;
  is_active: boolean;
  max_uses?: number;
  created_at: string;

  // Joined relationships
  users?: User[],
};