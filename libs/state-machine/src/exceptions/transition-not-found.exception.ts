import { Graph } from '../interfaces';
import { StateMachineException } from './state-machine.exception';

export class TransitionNotFoundException<T> extends StateMachineException<T> {
  constructor(readonly entity: T, readonly graph: Graph, readonly transitionName: string) {
    super(entity, graph, undefined, undefined, 'Transition not found: ' + transitionName);
  }
}
