export type UserRole = 'customer' | 'dealer_staff' | 'dealer_manager' | 'dealer_owner' | 'platform_admin';
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'info_requested' | 'approved' | 'rejected' | 'withdrawn';
export type DealerAccountStatus = 'onboarding' | 'active' | 'suspended' | 'closed';
export type SubmissionStatus = 'submitted' | 'under_review' | 'awaiting_info' | 'offer_prepared' | 'offer_sent' | 'offer_accepted' | 'offer_declined' | 'purchase_arranging' | 'completed' | 'cancelled';
export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'revised';
export type StaffRole = 'owner' | 'manager' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealerApplication {
  id: string;
  reference: string;
  user_id: string | null;
  business_name: string;
  applicant_name: string;
  email: string;
  phone: string | null;
  country: string;
  business_address: string | null;
  website_url: string | null;
  social_links: Record<string, string>;
  business_type: string;
  tcg_categories: string[];
  has_physical_shop: boolean;
  has_online_shop: boolean;
  estimated_monthly_purchases: string | null;
  business_description: string | null;
  status: ApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  internal_notes: string | null;
  applicant_message: string | null;
  rejection_reason_internal: string | null;
  rejection_reason_applicant: string | null;
  info_request_message: string | null;
  additional_info_response: string | null;
  agreed_to_terms: boolean;
  agreed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealerOrganisation {
  id: string;
  application_id: string | null;
  name: string;
  slug: string;
  status: DealerAccountStatus;
  portal_headline: string | null;
  portal_description: string | null;
  portal_logo_url: string | null;
  portal_primary_color: string;
  portal_accent_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  supported_tcg_categories: string[];
  submission_instructions: string | null;
  purchasing_info: string | null;
  customer_terms: string | null;
  approved_by: string | null;
  approved_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealerMembership {
  id: string;
  user_id: string;
  organisation_id: string;
  role: StaffRole;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSubmission {
  id: string;
  reference: string;
  organisation_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  access_token: string;
  description: string | null;
  tcg_categories: string[];
  estimated_card_count: number | null;
  estimated_value: string | null;
  customer_notes: string | null;
  status: SubmissionStatus;
  dealer_notes: string | null;
  dealer_valuation: string | null;
  agreed_to_terms: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionPhoto {
  id: string;
  submission_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  sort_order: number;
  created_at: string;
}

export interface Offer {
  id: string;
  submission_id: string;
  organisation_id: string;
  amount: number;
  currency: string;
  breakdown: Record<string, unknown> | null;
  dealer_message: string | null;
  internal_notes: string | null;
  status: OfferStatus;
  revision_number: number;
  previous_offer_id: string | null;
  customer_response_at: string | null;
  customer_response_notes: string | null;
  created_by: string | null;
  sent_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> };
      dealer_applications: { Row: DealerApplication; Insert: Partial<DealerApplication> & { business_name: string; applicant_name: string; email: string; business_type: string }; Update: Partial<DealerApplication> };
      dealer_organisations: { Row: DealerOrganisation; Insert: Partial<DealerOrganisation> & { name: string; slug: string }; Update: Partial<DealerOrganisation> };
      dealer_memberships: { Row: DealerMembership; Insert: Partial<DealerMembership> & { user_id: string; organisation_id: string }; Update: Partial<DealerMembership> };
      customer_submissions: { Row: CustomerSubmission; Insert: Partial<CustomerSubmission> & { organisation_id: string; customer_name: string; customer_email: string }; Update: Partial<CustomerSubmission> };
      submission_photos: { Row: SubmissionPhoto; Insert: Partial<SubmissionPhoto> & { submission_id: string; storage_path: string; file_name: string }; Update: Partial<SubmissionPhoto> };
      offers: { Row: Offer; Insert: Partial<Offer> & { submission_id: string; organisation_id: string; amount: number }; Update: Partial<Offer> };
      audit_log: { Row: AuditLogEntry; Insert: Partial<AuditLogEntry> & { action: string; entity_type: string }; Update: never };
    };
  };
}
