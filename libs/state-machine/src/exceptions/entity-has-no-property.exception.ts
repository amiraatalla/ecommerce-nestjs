import { Graph } from '../interfaces';
import { StateMachineException } from './state-machine.exception';

export class EntityHasNoPropertyException<T> extends StateMachineException<T> {
  constructor(readonly entity: T, readonly graph: Graph) {
    super(entity, graph, undefined, undefined, 'State Machine Entity has no property');
  }
}
