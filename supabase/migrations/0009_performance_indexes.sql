-- Performance indexes for faster queries
-- Apply this migration to improve database query performance

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_division_status ON products(division_id, status);
CREATE INDEX IF NOT EXISTS idx_products_division_published ON products(division_id, is_published);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_division_active ON categories(division_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_ismain ON product_images(product_id, is_main);
CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_product_is360 ON product_images(product_id, is_360);

-- Brands table indexes
CREATE INDEX IF NOT EXISTS idx_brands_division_active ON brands(division_id, is_active);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- Orders table indexes (for admin performance)
CREATE INDEX IF NOT EXISTS idx_orders_division_status ON orders(division_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_division_created ON orders(division_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_division_phone ON customers(division_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_division_email ON customers(division_id, email);

-- Inventory table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_division_warehouse ON inventory(division_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_variant ON inventory(product_variant_id);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_division_status ON purchase_orders(division_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders(po_number);

-- Vendors table indexes
CREATE INDEX IF NOT EXISTS idx_vendors_division_active ON vendors(division_id, is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_company ON vendors(company_name);

-- Warehouses table indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_division_active ON warehouses(division_id, is_active);
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);

-- Enquiries table indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_division_status ON enquiries(division_id, status);
CREATE INDEX IF NOT EXISTS idx_enquiries_division_created ON enquiries(division_id, created_at DESC);