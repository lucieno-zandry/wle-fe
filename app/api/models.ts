type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  approved_at: string;
  role: "admin" | "manager" | "client";
  image?: string | null;
  address_id?: number | null;
  client_code_id?: number | null;
  created_at: string;
  updated_at: string;
}

type Product = {
  id: number;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  description: string;
  category_id: number;
  category?: Category;
  variants?: Variant[];
  images?: ProductImage[];
  variant_groups?: VariantGroup[];
};

type Category = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  parent_id: number | null;
};

type Variant = {
  id: number;
  created_at: string;
  updated_at: string;
  product_id: number;
  sku: string;
  price: number;
  special_price: number | null;
  stock: number;
  image: string | null;
  product?: Product;
  variant_options?: VariantOption[];
  promotions?: Promotion[];
};

type VariantGroup = {
  id: number;
  created_at: string;
  updated_at: string;
  product_id: number;
  name: string;
  variant_options?: VariantOption[];
};

type ProductImage = {
  id: number;
  created_at: string;
  updated_at: string;
  filename: string;
};

type VariantOption = {
  id: number;
  created_at: string;
  updated_at: string;
  value: string;
  variant_group_id: number;
  variants?: Variant[];
  variant_group?: VariantGroup;
}

type Promotion = {
  id: number;
  created_at: string;
  updated_at: string;
  discount: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  start_date: string;
  end_date: string;
  is_active: boolean;
}

type CartItem = {
  id: number;
  order_uuid: number | null;

  // Foreign keys (for integrity & backend analytics)
  user_id: number;
  product_id: number;
  variant_id: number;

  // Quantity
  count: number;

  // Pricing (stable at time of adding to cart)
  unit_price: number;                     // price per item at that time
  promotion_discount_applied: number;     // total discount applied
  total: number;                          // final total (count * unit_price - discounts)

  // Snapshots (used by frontend — always reliable)
  product_snapshot: ProductSnapshot //ProductSnapshot JSON
  variant_snapshot: VariantSnapshot //VariantSnapshot JSON
  variant_options_snapshot: VariantOptionsSnapshot //VariantOptionsSnapshot JSON

  // Meta
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  // Optional hydrated relations
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
  category_id: number;
};

type VariantSnapshot = {
  id: number;
  sku: string;
  price: number;
  special_price: number | null;
  image: string | null;
};

type VariantOptionsSnapshot = {
  [group: string]: string;
};

type Address = {
  id: number,
  fullname: string,
  line1: string,
  line2: string | null,
  line3: string | null,
  phone_number: string,
  user_id: number,
  created_at: string,
  updated_at: string,
  is_default: boolean,
}

type Order = {
  uuid: string,
  created_at: string,
  updated_at: string,
  total: number,
  user_id: number,
  address_id: number,
  coupon_id: number | null,
  coupon_discount_applied: number,
  deleted_at: string | null,

  address_snapshot: Address,
  coupon_snapshot?: Pick<Coupon, "id" | "code" | "type" | "discount" | "min_order_value">,
  cart_items?: CartItem[],
  shipments?: Shipment[],
  transactions?: Transaction[],
}

type Coupon = {
  id: number,
  created_at: string,
  updated_at: string,
  code: string,
  type: "FIXED_AMOUNT" | "PERCENTAGE",
  discount: number,
  min_order_value: number,
  max_uses: number,
  uses_count: number,
  start_date: string,
  end_date: string,
  is_active: boolean,
}

type Shipment = {
  id: number;
  created_at: string;
  updated_at: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  description: string;
  order_uuid: string;

  order?: Order;
}

type Transaction = {
  id: number,
  created_at: string,
  updated_at: string,
  status: 'FAILED' | 'PENDING' | 'SUCCESS',
  informations: Object,
  user_id: number,
  order_uuid: string,
  deleted_at: string | null,
  method: 'VISA' | 'MASTERCARD' | 'ORANGEMONEY' | 'AIRTELMONEY' | 'MVOLA' | 'PAYPAL',
  payment_url: string | null,
  user?: User,
  order?: Order,
  amount: number,
}

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

type OtherNotificationData = {
  notification_type: "system";
  title: string;
  message: string;
};

type NotificationData =
  | TransactionNotificationData
  | OtherNotificationData;

type AppNotification = {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};
