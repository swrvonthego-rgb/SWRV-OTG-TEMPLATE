export interface Service {
  title: string;
  description: string;
  icon: string;
}

export interface ExecutionService {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  recommended?: boolean;
  reasoning?: string;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  context: string;
  options?: string[];
}

export interface NavItem {
  label: string;
  href: string;
  target?: string;
  children?: NavItem[];
}