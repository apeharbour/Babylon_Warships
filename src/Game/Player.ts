import { Mesh, Scene, Vector3, SceneLoader, AssetContainer, } from "@babylonjs/core";
import { GameManager } from "../Framework/Core/GameManager";
import { GLTFFileLoader } from '@babylonjs/loaders';
//import { vehicleModelUrl } from "../Resources/models/yacht.glb";
import { PointerEventTypes } from "@babylonjs/core";






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
     // const playerModelUrl = "src/​Resources/​models/​yacht.glb";
  
      SceneLoader.LoadAssetContainer(
        "",
         "../Resources/models/yacht.glb",
        //playerModelUrl,
        //vehicleModelUrl,
        this._scene,
        (container: AssetContainer) => {
          const meshes = container.meshes;
          const materials = container.materials;
        
          container.addAllToScene();
          if (container.meshes.length > 0) {
            // Cast the first mesh to a Mesh object
            this._mesh = container.meshes[0] as Mesh;
            this._mesh.position = new Vector3(0, 0, 1); // Adjust the 1 as necessary

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
  const direction = new Vector3(
    this._targetPosition.x - this._mesh.position.x,
    this._targetPosition.y - this._mesh.position.y,
    0 // Ignore Z-axis difference
  ).normalize();

  const speed = 1; // Adjust this as needed
  this._mesh.position.addInPlace(direction.scale(deltaTime * speed));

  // Ensure the player's Z-position remains constant
  this._mesh.position.z = 1;
  }
    

  public setTargetPosition(position: Vector3): void {
    // Ignore the z value from the incoming position
    this._targetPosition = new Vector3(position.x, position.y, /*desired z value*/);
  }


    public getMesh(): Mesh {
      return this._mesh;
    }
/* 
        this.scene.onPointerObservable.add((pointerInfo) => {
          switch (pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
                  if (pointerInfo.pickInfo.hit) {
                      // Get the direction from the camera to the click position
                      let direction = pointerInfo.pickInfo.pickedPoint.subtract(this.scene.activeCamera.position);

                      // Normalize the direction vector (to get a direction vector of length 1)
                      direction = direction.normalize();

                      // Now you can use this direction for movement, e.g.:
                      this._player.moveInDirection(direction);
                  }
                  break;
          }
        
      }
  )
*/
}
