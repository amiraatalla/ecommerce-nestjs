import { StateMachineEvent } from './state-machine.event';

export class ExitStateEvent<T> extends StateMachineEvent<T> {
  protected readonly eventType: string = 'exit';

  name() {
    return `${this.graph.name}.${this.eventType}.${this.transition.from}`;
  }
}
