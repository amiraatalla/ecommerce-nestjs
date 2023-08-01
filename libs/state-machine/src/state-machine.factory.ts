import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityHasNoPropertyException } from './exceptions';
import { Graph } from './interfaces/graph.interface';
import { StateMachine } from './state-machine';
import { STATE_MACHINE_GRAPHS, STATE_MACHINE_STORE } from './state-machine.constants';

@Injectable()
export class StateMachineFactory {
  constructor(
    @Inject(STATE_MACHINE_GRAPHS) private graphs: Graph[],
    @Inject(EventEmitter2) private eventEmitter: EventEmitter2,
  ) {}

  create<T>(entity: T, graphName: string): StateMachine<T> {
    const graph = this.graphs.find((g) => g.name === graphName);
    if (!graph) {
      throw new Error("Can't find graph with given name: " + graphName);
    }

    const statePropName = this.findPropertyNameOfEntityWithGraphState(entity, graph);
    if (!statePropName) {
      throw new EntityHasNoPropertyException(entity, graph);
    }

    return new StateMachine<T>(entity, graph, statePropName, this.eventEmitter);
  }

  private findPropertyNameOfEntityWithGraphState<T>(entity: T, graph: Graph): string {
    return Object.getOwnPropertyNames(entity).find((prop) => {
      return Reflect.getMetadata(STATE_MACHINE_STORE, entity, prop) === graph.name;
    });
  }
}
