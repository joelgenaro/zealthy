import { Medication } from '@/context/AppContext/reducers/types/visit';
import { CSSProperties } from 'react';

export type QuestionType = {
  name: string;
  header?: string;
  type: string;
  title: string;
  description?: string;
  options_json?: QuestionOption[] | QuestionOptionGroup[];
  details?: {
    option?: string;
    label?: string;
    subLabel?: string;
  };
  button_cta?: string;
  hideHeader?: boolean;
  footer?: string;
  next?: string;
  placeholder?: string;
};

export type QuestionOption = {
  value: string;
  label: string;
  icon?: string;
  style?: CSSProperties;
  subLabel?: string;
  next?: string;
};

export type QuestionOptionGroup = {
  label: string;
  subLabel?: string;
  options: QuestionOption[];
};

export type QuestionResult = {
  name: string;
  data?: {
    options?: string[] | Medication[];
    details?: string;
  };
};
