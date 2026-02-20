import { IContact } from './IContact';

export class Contact implements IContact {
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

  constructor(
    id: number | null,
    businessId: number,
    phone_number: string | null,
    lid: string | null,
    username: string | null,
    pushname: string | null,
    contactName: string | null,
    is_user: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.business_id = businessId;
    this.phone_number = phone_number;
    this.lid = lid;
    this.username = username;
    this.pushname = pushname;
    this.contact_name = contactName;
    this.is_user = is_user;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
  }
}
