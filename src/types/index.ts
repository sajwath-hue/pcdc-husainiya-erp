export type Member = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  membershipType: 'Regular' | 'Life' | 'Honorary';
  status: 'Active' | 'Inactive';
  joinDate: string;
  createdAt: string;
};

export type Donation = {
  id: string;
  donorName: string;
  amount: number;
  purpose: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online';
  date: string;
  notes?: string;
  createdAt: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  capacity?: number;
  createdAt: string;
};
