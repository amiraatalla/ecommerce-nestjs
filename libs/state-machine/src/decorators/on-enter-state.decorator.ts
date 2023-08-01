import { SetMetadata } from '@nestjs/common';
import { OnEventMetadata } from '@nestjs/event-emitter';

export const OnExitState = (graphName = '*', state = '*', async = false): MethodDecorator =>
  SetMetadata('EVENT_LISTENER_METADATA', {
    event: `${graphName}.exit.${state}`,
    options: { async },
  } as OnEventMetadata);
