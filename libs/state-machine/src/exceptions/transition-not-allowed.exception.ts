import { StateMachineException } from './state-machine.exception';
import { Graph, Transition } from '../interfaces';

export class TransitionNotAllowedException<T> extends StateMachineException<T> {
  constructor(
    readonly entity: T,
    readonly graph: Graph,
    readonly fromState: string,
    readonly transition: Transition,
  ) {
    super(
      entity,
      graph,
      fromState,
      transition,
      `Transition [${fromState} -> ${transition.to}] is not allowed: ${transition.name}`,
    );
  }
}
