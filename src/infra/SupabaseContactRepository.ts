import { SupabaseClient } from '@supabase/supabase-js';
import { IContact } from '../domain/IContact';
import { IContactRepository } from '../domain/IContactRepository';
import { Contact } from '../domain/Contact';
import { supabase } from './supabase';

export class SupabaseContactRepository implements IContactRepository {
  private _supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this._supabase = supabaseClient || supabase;
  }

  private mapToContact(data: any): Contact {
    return new Contact(
      data.id,
      data.business_id,
      data.phone_number,
      data.lid,
      data.username,
      data.pushname,
      data.contact_name,
      data.is_user,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findById(businessId: number, id: number): Promise<IContact | null> {
    const { data, error } = await this._supabase
      .from('contacts')
      .select('*')
      .eq('business_id', businessId)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching contact by ID:', error);
      throw error;
    }
    return data ? this.mapToContact(data) : null;
  }

  async findByPhoneNumber(businessId: number, phoneNumber: string): Promise<IContact | null> {
    const { data, error } = await this._supabase
      .from('contacts')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching contact by phone number:', error);
      throw error;
    }
    return data ? this.mapToContact(data) : null;
  }

  async findByLid(businessId: number, lid: string): Promise<IContact | null> {
    const { data, error } = await this._supabase
      .from('contacts')
      .select('*')
      .eq('business_id', businessId)
      .eq('lid', lid)
      .maybeSingle();

    if (error) {
      console.error('Error fetching contact by LID:', error);
      throw error;
    }
    return data ? this.mapToContact(data) : null;
  }

  async save(contact: Partial<IContact>): Promise<IContact> {
    if (!contact.business_id && !contact.id) {
      throw new Error('Business ID is required for creating a contact');
    }

    const contactData: any = {
      ...contact,
      updated_at: new Date().toISOString(),
    };

    if (!contact.id && !contact.created_at) {
      contactData.created_at = new Date().toISOString();
    }

    let existingId = contact.id;
    if (!existingId && contact.business_id) {
      if (contact.phone_number) {
        const existing = await this.findByPhoneNumber(contact.business_id, contact.phone_number);
        if (existing) existingId = existing.id ?? undefined;
      }
      if (!existingId && contact.lid) {
        const existing = await this.findByLid(contact.business_id, contact.lid);
        if (existing) existingId = existing.id ?? undefined;
      }
    }

    if (existingId) {
      const { data, error } = await this._supabase
        .from('contacts')
        .update(contactData)
        .eq('id', existingId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToContact(data);
    } else {
      const { data, error } = await this._supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) throw error;
      return this.mapToContact(data);
    }
  }

  async getOrCreateContact(businessId: number, contactId: string): Promise<IContact> {
    const isLid = contactId.endsWith('@lid') || !contactId.startsWith('521');
    let contact: IContact | null = null;

    if (isLid) {
      contact = await this.findByLid(businessId, contactId);
    }

    if (!contact && !isLid) {
      contact = await this.findByPhoneNumber(businessId, contactId);
    }

    if (contact) return contact;

    const newContact: Partial<IContact> = {
      business_id: businessId,
      is_user: false,
    };
    if (isLid) newContact.lid = contactId;
    else newContact.phone_number = contactId;

    return this.save(newContact);
  }
}

export const contactRepository = new SupabaseContactRepository();
