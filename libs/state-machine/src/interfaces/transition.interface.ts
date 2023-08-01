/**
 * Passing from state A to a state B.
 */
export interface Transition {
  /**
   * Transition name.
   */
  name: string;
  /**
   * Possible states to start the transition.
   */
  from: string[];
  /**
   * Next state of transition4
   */
  to: string;
}
