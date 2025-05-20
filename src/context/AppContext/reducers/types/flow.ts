import { CommonAction } from './common';
export type Flow =
  | 'sema-bundled'
  | 'ed'
  | 'bc-prescription-renewal'
  | 'sleep-prescription-renewal'
  | 'enclomiphene-prescription-renewal'
  | 'menopause-refill'
  | 'mhl-prescription-renewal'
  | 'fhl-prescription-renewal'
  | 'preworkout-renewal'
  | 'edhl-prescription-renewal'
  | 'ed-prescription-renewal';

export interface FlowState {
  currentFlow: Flow | null;
}

export enum FlowActionsType {
  SET_FLOW = 'SET_FLOW',
  CLEAR_FLOW = 'CLEAR_FLOW',
}

export type FlowActions =
  | CommonAction
  | {
      type: FlowActionsType.SET_FLOW;
      payload: Flow;
    }
  | {
      type: FlowActionsType.CLEAR_FLOW;
    };
