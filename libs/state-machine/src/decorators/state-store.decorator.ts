import { STATE_MACHINE_STORE } from '../state-machine.constants';

export const StateStore = (optionName: string): PropertyDecorator =>
  Reflect.metadata(STATE_MACHINE_STORE, optionName);
