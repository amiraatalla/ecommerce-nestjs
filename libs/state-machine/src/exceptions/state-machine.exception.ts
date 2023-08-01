import { Graph, Transition } from '../interfaces';

export class StateMachineException<T> extends Error {
  constructor(
    readonly entity: T,
    readonly graph: Graph,
    readonly fromState: string,
    readonly transition?: Transition,
    message?: string,
  ) {
    super(message);
  }
}
