export interface IContact {
  id: number | null;
  business_id: number;
  phone_number: string | null;
  lid: string | null;
  contact_name: string | null;
  pushname: string | null;
  username: string | null;
  is_user: boolean;
  created_at: Date;
  updated_at: Date;
}
