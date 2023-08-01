import { StateMachineEvent } from './state-machine.event';

export class EnterStateEvent<T> extends StateMachineEvent<T> {
  protected readonly eventType: string = 'enter';

  name() {
    return `${this.graph.name}.${this.eventType}.${this.transition.to}`;
  }
}
