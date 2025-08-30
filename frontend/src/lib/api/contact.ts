import { apiClient } from './client';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  async submitContactForm(data: ContactFormData): Promise<void> {
    await apiClient.post('/contact', data);
  }
};