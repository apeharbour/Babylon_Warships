import { Mesh, Scene, Vector3 } from "@babylonjs/core";
import { GameManager } from "../Framework/Core/GameManager";

export class Player {
  private _mesh: Mesh;
  private _scene: Scene;
  private _targetPosition: Vector3; 

  constructor(scene: Scene) {
    this._scene = scene;
    this._targetPosition = Vector3.Zero();
  }

  public async load(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const playerModelUrl = '../Resources/models/yacht.glb';
  
      const loadMeshTask = GameManager.assetManager.addMeshTask(
        "playerTask", // Task Name
        "",           // Mesh Name(s)
        playerModelUrl, // Root URL
        ""            // Scene File Name
      );
  
      loadMeshTask.onSuccess = (task) => {
        this._mesh = task.loadedMeshes[0] as Mesh;  // Type assertion
        resolve();
      }
  
      loadMeshTask.onError = (task, message, exception) => {
        console.error(message, exception);
        reject(exception);
      }
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
