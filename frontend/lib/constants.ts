export const APP_NAME = "FuelManager Pro";
export const APP_VERSION = "1.0.0";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "";

export const FUEL_TYPES = [
  { value: "diesel", label: "Diesel" },
  { value: "petrol", label: "Petrol" },
  { value: "premium", label: "Premium" },
  { value: "lpg", label: "LPG" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit", label: "Credit Account" },
  { value: "mobile_money", label: "Mobile Money" },
] as const;

export const TRANSACTION_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "purchase", label: "Purchase" },
  { value: "refund", label: "Refund" },
  { value: "adjustment", label: "Adjustment" },
] as const;

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "fuel_purchase", label: "Fuel Purchase" },
  { value: "maintenance", label: "Maintenance" },
  { value: "salaries", label: "Salaries" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "insurance", label: "Insurance" },
  { value: "transport", label: "Transport" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
] as const;

export const VEHICLE_STATUSES = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
] as const;

export const QUERY_STALE_TIME = 30_000;
export const QUERY_RETRY_COUNT = 2;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/fuel-tanks", label: "Fuel Inventory", icon: "Fuel" },
  { href: "/transactions", label: "Transactions", icon: "ArrowLeftRight" },
  { href: "/customers", label: "Customers", icon: "Users" },
  { href: "/vehicles", label: "Vehicles", icon: "Truck" },
  { href: "/drivers", label: "Drivers", icon: "UserCheck" },
  { href: "/invoices", label: "Invoices", icon: "FileText" },
  { href: "/expenses", label: "Expenses", icon: "Receipt" },
  { href: "/accounting", label: "Accounting", icon: "BookOpen" },
  { href: "/reports", label: "Reports", icon: "BarChart3" },
  { href: "/notifications", label: "Notifications", icon: "Bell" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;
