import { Database } from '@/lib/database.types';
import { CommonAction } from './common';

export enum CoachingType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  PERSONALIZED_PSYCHIATRY = 'PERSONALIZED_PSYCHIATRY',
}

export type CoachingPayload =
  Database['public']['Tables']['subscription']['Row'];

export type CoachingState = {
  type: CoachingType;
  planId: string;
  id: number;
  price: number;
  discounted_price?: number;
  name: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
};

export enum CoachingActionTypes {
  ADD_COACHING = 'ADD_COACHING',
  REMOVE_COACHING = 'REMOVE_COACHING',
  CLEAR_COACHING = 'CLEAR_COACHING',
}

export type CoachingActions =
  | CommonAction
  | {
      type: CoachingActionTypes.ADD_COACHING;
      payload: CoachingState;
    }
  | {
      type: CoachingActionTypes.REMOVE_COACHING;
      payload: CoachingType;
    }
  | {
      type: CoachingActionTypes.CLEAR_COACHING;
    };
