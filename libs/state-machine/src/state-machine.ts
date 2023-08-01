import { EventEmitter2 } from 'eventemitter2';
import { EnterStateEvent, ExitStateEvent } from './events';
import { TransitionNotAllowedException, TransitionNotFoundException } from './exceptions';
import { Graph, Transition } from './interfaces';

export class StateMachine<T> {
  constructor(
    private readonly entity: T,
    private readonly graph: Graph,
    private readonly propertyName: string,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Check if a transition is possible.
   * @param transitionName - name of the transition in question
   * @returns {Boolean}
   */
  can(transitionName: string): boolean {
    const transition = this.getTransition(transitionName);
    const state = this.getCurrentState();
    return transition.from.includes(state);
  }

  /**
   * Return available transition for an entity.
   * @returns {Transition[]}
   */
  getPossibleTransitions(): Transition[] {
    const state = this.getCurrentState();
    return this.graph.transitions.filter((t) => t.from.includes(state));
  }

  /**
   * Apply transition from one state to the next.
   * @param transitionName - name of the transition to be applied.
   * @returns {Promise<void>}
   */
  async apply(transitionName: string): Promise<void> {
    const transition = this.getTransition(transitionName);
    const state = this.getCurrentState();

    if (!transition.from.includes(state)) {
      throw new TransitionNotAllowedException(this.entity, this.graph, state, transition);
    }

    // Exit current state
    await this.exitState(transition);

    // Set state
    Object.defineProperty(this.entity, this.propertyName, { value: transition.to });

    // Enter new state
    await this.enterState(transition);
  }

  /**
   * Find a transition by name from current graph.
   * @param name - transition name
   * @returns {Transition}
   */
  private getTransition(name: string): Transition {
    const transition = this.graph.transitions.find((t) => t.name === name);
    if (!transition) {
      throw new TransitionNotFoundException(this.entity, this.graph, name);
    }
    return transition;
  }

  /**
   * Get the current value of the state property.
   * @returns {String}
   */
  private getCurrentState(): string {
    // Get value of object property
    return Object.getOwnPropertyDescriptor(this.entity, this.propertyName)?.value;
  }

  /**
   * Announce an exit of current state.
   * @param transition - transition containing the state to be existed.
   */
  private async exitState(transition: Transition): Promise<void> {
    const event = new ExitStateEvent(this.entity, this.graph, transition);
    await this.eventEmitter.emitAsync(event.name(), event);
  }

  /**
   * Announce an entry to a new state.
   * @param transition - transition containing the state to be entered.
   */
  private async enterState(transition: Transition): Promise<void> {
    const event = new EnterStateEvent<T>(this.entity, this.graph, transition);
    await this.eventEmitter.emitAsync(event.name(), event);
  }
}
