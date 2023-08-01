import { Graph, Transition } from '../interfaces';

export abstract class StateMachineEvent<T> {
  protected readonly eventType: string = '*';

  constructor(readonly entity: T, readonly graph: Graph, readonly transition: Transition) {}

  name() {
    return `${this.graph.name}.${this.eventType}.${this.transition.name}`;
  }
}
