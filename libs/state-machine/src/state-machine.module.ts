import { DynamicModule, Module, Provider } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Graph } from './interfaces';
import { STATE_MACHINE_GRAPHS } from './state-machine.constants';
import { StateMachineFactory } from './state-machine.factory';

@Module({})
export class StateMachineModule {
  static forRoot(graphs: Graph[]): DynamicModule {
    const graphsProvider: Provider = {
      provide: STATE_MACHINE_GRAPHS,
      useValue: graphs,
    };

    return {
      module: StateMachineModule,
      imports: [EventEmitterModule.forRoot({ wildcard: true })],
      providers: [graphsProvider, StateMachineFactory],
      exports: [StateMachineFactory],
    };
  }
}
