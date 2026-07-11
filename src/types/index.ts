export type ProductFamily = 'machines' | 'software' | 'consumables';
export type ServiceType = 'commercial' | 'technical' | 'training';
export type ServiceStatus = 'pending' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type LeadStatus = 'new' | 'reviewed' | 'discarded' | 'converted';

export interface Supplier {
  id: string;
  name: string;
  country?: string;
  website?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  enriched_at?: string;
  created_at: string;
  supplier_families?: { family: ProductFamily }[];
  products?: Product[];
  _count?: { products: number; services: number };
}

export interface Product {
  id: string;
  supplier_id: string;
  family: ProductFamily;
  name: string;
  description?: string;
  specs?: Record<string, unknown>;
  reference?: string;
  price_ref?: number;
  unit?: string;
  created_at: string;
  suppliers?: Pick<Supplier, 'id' | 'name'>;
}

export interface Client {
  id: string;
  name: string;
  company_type?: string;
  country?: string;
  city?: string;
  address?: string;
  nif?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  notes?: string;
  iberinform_score?: string;
  iberinform_data?: Record<string, unknown>;
  iberinform_at?: string;
  enriched_at?: string;
  created_at: string;
  _count?: { services: number; tickets: number };
  ytd_revenue?: number;
}

export interface ConsumptionRecord {
  id: string;
  client_id: string;
  product_id?: string;
  supplier_id?: string;
  quantity: number;
  unit_price?: number;
  sale_price?: number;
  order_ref?: string;
  date: string;
  notes?: string;
  created_at: string;
  products?: Pick<Product, 'id' | 'name' | 'family'>;
  suppliers?: Pick<Supplier, 'id' | 'name'>;
}

export interface Service {
  id: string;
  client_id: string;
  product_id?: string;
  supplier_id?: string;
  type: ServiceType;
  status: ServiceStatus;
  title: string;
  description?: string;
  opened_at: string;
  closed_at?: string;
  created_at: string;
  clients?: Pick<Client, 'id' | 'name'>;
  products?: Pick<Product, 'id' | 'name' | 'family'>;
  suppliers?: Pick<Supplier, 'id' | 'name'>;
  tickets?: Ticket[];
  sessions?: Session[];
}

export interface Ticket {
  id: string;
  service_id: string;
  issue: string;
  priority: TicketPriority;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
  ticket_timeline?: TicketNote[];
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  note: string;
  created_at: string;
}

export interface Session {
  id: string;
  service_id: string;
  title: string;
  scheduled_at: string;
  duration_min: number;
  location?: string;
  attendees?: number;
  notes?: string;
  completed: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id?: string;
  toconline_id?: string;
  number?: string;
  status?: InvoiceStatus;
  amount?: number;
  issued_at?: string;
  due_at?: string;
  paid_at?: string;
  raw?: Record<string, unknown>;
  synced_at: string;
}

export interface Lead {
  id: string;
  name: string;
  company_type?: string;
  city?: string;
  country?: string;
  website?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  discovered_at: string;
}

export interface ReplenishmentAlert {
  client_name: string;
  product_name: string;
  supplier_name: string;
  last_purchase: string;
  cycle_days: number;
  next_estimated: string;
  days_until: number;
}
