import { IContact } from '../domain/IContact';

export interface IContactRepository {
  findById(businessId: number, id: number): Promise<IContact | null>;
  findByPhoneNumber(businessId: number, phoneNumber: string): Promise<IContact | null>;
  findByLid(businessId: number, lid: string): Promise<IContact | null>;
  save(contact: Partial<IContact>): Promise<IContact>;
  getOrCreateContact(businessId: number, contactId: string): Promise<IContact>;
}
