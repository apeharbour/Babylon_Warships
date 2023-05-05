import {
  GameManager,
} from '../Framework/Core/GameManager';

import {
  ThirdPersonController,
} from '../Framework/Gameplay/Controller';
import {
  ThirdPersonInputBindings,
} from '../Framework/Gameplay/InputBindings';
import {
  DefaultNetworkWorld,
} from './Worlds/DefaultNetworkWorld';
import {
  HexWorld,
} from './Worlds/HexWorld';

const canvasElement = <HTMLCanvasElement>document.getElementById('canvas');

GameManager.boot({
  defaultWorld: HexWorld,
  canvasElement,
  controller: ThirdPersonController,
  inputBindings: ThirdPersonInputBindings,
  engineOptions: {
    stencil: true,
  },
});
