import { Mesh, Scene } from "@babylonjs/core";
import { GameManager } from "../Framework/Core/GameManager";

export class Player {
  private _mesh: Mesh;
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  public async load(): Promise<void> {
    return new Promise((resolve) => {
      // Load your player model
      // Example: import playerModelUrl from '../../Resources/models/player.glb';
      const playerModelUrl = "../Recources/models/yacht.glb";

      GameManager.assetManager.loadAssetContainer(
        "",
        playerModelUrl,
        this._scene,
        (container) => {
          this._mesh = container.meshes[0];
          resolve();
        }
      );
    });
  }

  public update(deltaTime: number): void {
    // Handle player movement and actions based on input
    const axes = GameManager.inputManager.getAxes();
    const actions = GameManager.inputManager.getActions();

    // Example: Move player based on axes input
    //if (axes.horizontal) {
    //  this._mesh.position.x += axes.horizontal * deltaTime;
  //  }
  //  if (axes.vertical) {
 //  if (actions.jump) {
      // Implement jump logic here
  //  }
  }

  public getMesh(): Mesh {
    return this._mesh;
  }
  
}
