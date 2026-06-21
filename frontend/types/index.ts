export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  company_id: string;
  role_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  tax_id: string | null;
  credit_limit: number;
  credit_balance: number;
  notes: string | null;
  customer_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  license_plate: string;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  vin: string | null;
  fuel_type: string;
  tank_capacity_liters: number;
  current_mileage_km: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
  status: string;
  employee_id: string | null;
  vehicle_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FuelTank {
  id: string;
  name: string;
  fuel_type: string;
  capacity_liters: number;
  current_level_liters: number;
  low_level_threshold_pct: number;
  location: string | null;
  notes: string | null;
  last_refill_at: string | null;
  level_percentage: number;
  is_low: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TankRefill {
  id: string;
  tank_id: string;
  liters_added: number;
  cost_per_liter: number;
  total_cost: number;
  supplier: string | null;
  invoice_number: string | null;
  refilled_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  reference_number: string;
  transaction_type: string;
  fuel_type: string | null;
  quantity_liters: number;
  unit_price: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  mileage_km: number | null;
  notes: string | null;
  status: string;
  customer_id: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  fuel_tank_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  notes: string | null;
  terms: string | null;
  pdf_url: string | null;
  is_active: boolean;
  line_items: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  vendor: string | null;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  is_recurring: boolean;
  status: string;
  created_at: string;
}

export interface DashboardMetrics {
  revenue: MetricCard;
  expenses: MetricCard;
  profit: MetricCard;
  transactions_count: MetricCard;
  tank_levels: TankLevelInfo[];
  low_stock_count: number;
  revenue_chart: RevenueDataPoint[];
  recent_transactions: RecentTransaction[];
  expenses_by_category: ExpenseCategory[];
}

export interface MetricCard {
  value: number;
  previous_value: number;
  change_pct: number;
  label: string;
}

export interface TankLevelInfo {
  id: string;
  name: string;
  fuel_type: string;
  capacity_liters: number;
  current_level_liters: number;
  level_percentage: number;
  is_low: boolean;
}

export interface RevenueDataPoint {
  day: string;
  revenue: number;
  count: number;
}

export interface RecentTransaction {
  id: string;
  reference_number: string;
  transaction_type: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  customer_name: string | null;
}

export interface ExpenseCategory {
  category: string;
  total: number;
}
