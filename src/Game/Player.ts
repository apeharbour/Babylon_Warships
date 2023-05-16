import { Mesh, Scene, Vector3, SceneLoader, AssetContainer, } from "@babylonjs/core";
import { GameManager } from "../Framework/Core/GameManager";
import { GLTFFileLoader } from '@babylonjs/loaders';




// Register the GLTF file loader
SceneLoader.RegisterPlugin(new GLTFFileLoader());

// ...
export class Player {
  private _mesh: Mesh;
  private _scene: Scene;
  private _targetPosition: Vector3; 

  constructor(scene: Scene) {
    this._scene = scene;
    this._targetPosition = Vector3.Zero();

  }

  

  public async load(): Promise<void> {
    return new Promise((resolve, reject) => {
      const playerModelUrl = "../​Resources/​models/​yacht.glb";
  
      SceneLoader.LoadAssetContainer(
        "",
        playerModelUrl,
        this._scene,
        (container: AssetContainer) => {
          if (container.meshes.length > 0) {
            // Cast the first mesh to a Mesh object
            this._mesh = container.meshes[0] as Mesh;
            resolve();
          } else {
            reject(new Error('No meshes found in the player model'));
          }
        },
        null, 
        (message, exception) => {
          // Handle errors during loading
          reject(exception);
        }
      );
    });
  }
  
  

  public update(deltaTime: number): void {
    if (!this._mesh) {
      return;
    }
  
    // Move player towards target position
    const direction = this._targetPosition.subtract(this._mesh.position).normalize();
    const speed = 1; // Adjust this as needed
    this._mesh.position.addInPlace(direction.scale(deltaTime * speed));
  }
  

  public setTargetPosition(position: Vector3): void {
    this._targetPosition = position;
  }

  public getMesh(): Mesh {
    return this._mesh;
  }
  
}
