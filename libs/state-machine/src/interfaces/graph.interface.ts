import { Transition } from './transition.interface';

/**
 * A representation and settings of an entity controlled with state machine.
 */
export interface Graph {
  /**
   * State graph name.
   */
  name: string;
  /**
   * The initial state of the graph.
   */
  initialState: string;
  /**
   * Possible states that the graph has.
   */
  states: string[];
  /**
   * Possible transitions from and to graph states.
   */
  transitions: Transition[];
}
