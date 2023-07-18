import { Mesh, Scene, SceneLoader, AssetContainer } from "@babylonjs/core";
import { Vector3, Quaternion, Matrix } from "@babylonjs/core/Maths/math";
import { GLTFFileLoader } from '@babylonjs/loaders';
import { PointerEventTypes } from "@babylonjs/core";

// Register the GLTF file loader
SceneLoader.RegisterPlugin(new GLTFFileLoader());

export class Player {
  private _mesh: Mesh;
  private _scene: Scene;
  private _targetPosition: Vector3; 
  private _initialPosition: Vector3;
  public _isMoving: boolean = false;
  public _isTurning: boolean = false;
  private _currentDirection: Vector3;
  private _turnStepSize: number; // The amount to turn by in each step, in degrees
  private _maxTurn: number; // The maximum amount the player can turn, in degrees
  private _targetAngle: number; // The angle that the player is trying to turn to
  private _position: Vector3;
  private _modelPath: string;


  constructor(scene: Scene, modelPath: string, initialPosition: Vector3) {
    this._scene = scene;
    this._targetPosition = Vector3.Zero();
    this._isMoving = false;
    this._isTurning = false;
    this._initialPosition = initialPosition.clone();
    this._position = initialPosition.clone();
    this._modelPath = modelPath;
  
    // Set forward direction based on model's orientation
    this._currentDirection = new Vector3(0, 1, 0);  // Replace with your model's forward vector
    this._turnStepSize = 60; // Adjust as needed
    this._maxTurn = 360; // Adjust as needed

    // Subscribe to pointer events
    scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          const pickResult = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
          if (pickResult && pickResult.hit) {
            this.setTargetPosition(pickResult.pickedPoint);
            this._isMoving = true;
            this._isTurning = true;
          }
          break;
      }
    });

    this.load();
  }

  public async load(): Promise<void> {
    console.log(`Loading model from: ${this._modelPath}`); // Debug print statement

    console.log(`Model path: ${this._modelPath}`); // This will print the model path
    return new Promise((resolve, reject) => {
      SceneLoader.ImportMesh(
        "",
        "/Resources/models/",
        "2186.glb",
        this._scene,
        (meshes, particleSystems, skeletons, animationGroups, transformNodes, geometries, lights) => {
          if (meshes && meshes.length > 0) {
            this._mesh = meshes[0] as Mesh;
        this._mesh.position = this._initialPosition; // Set the mesh position here
        this._position = this._mesh.position.clone(); // Update _position here
        this._mesh.scaling = new Vector3(2, 2, 2);
        resolve();
            // Rest of the code...
          //  this._mesh.addRotation(0, Math.PI/2, 0);
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
    this.updateRotation(deltaTime);
    this.updateMovement(deltaTime);
  }
  
  private updateMovement(deltaTime: number): void {
    if (!this._isMoving) {
      return;
    }
  
    // Move player towards target position
    const direction = new Vector3(
      this._targetPosition.x - this._mesh.position.x,
      0, // Ignore Y-axis difference
      this._targetPosition.z - this._mesh.position.z,
    ).normalize();
  
    const speed = 4; // Adjust this as needed
    const moveAmount = deltaTime * speed;
    const distanceToTarget = Vector3.Distance(this._mesh.position, this._targetPosition);
    

    if (distanceToTarget < moveAmount) {
      // If we are close enough to the target that we would overshoot it,
      // set our position directly to the target position instead of moving normally.
      this._mesh.position = this._targetPosition.clone();
      this._isMoving = false;
    } else {
      this._mesh.position.addInPlace(direction.scale(moveAmount));
  
      // Ensure the player's Y-position remains constant
      this._mesh.position.y = 1;
    }
    if (distanceToTarget < moveAmount) {
      // If we are close enough to the target that we would overshoot it,
      // set our position directly to the target position instead of moving normally.
      this._mesh.position = this._targetPosition.clone();
      this._position = this._mesh.position.clone(); // Update _position here
      this._isMoving = false;
    } else {
      this._mesh.position.addInPlace(direction.scale(moveAmount));
      this._position = this._mesh.position.clone(); // Update _position here
  
      // Ensure the player's Y-position remains constant
      this._mesh.position.y = 1;
    }
  }
  
  

  private updateRotation(deltaTime: number): void {
    if (!this._isTurning) {
      return;
    }
  
    // Calculate the desired direction
    const desiredDirection = new Vector3(
      this._targetPosition.x - this._mesh.position.x,
      0,
      this._targetPosition.z - this._mesh.position.z,
    ).normalize();
  
    // Calculate the angle between the current and desired direction
    const angle = Math.atan2(desiredDirection.x, desiredDirection.z);
  
    // Create the target rotation quaternion based on the calculated angle
    const targetRotation = Quaternion.RotationAxis(Vector3.Up(), angle);
  
    // Create a reference quaternion for the new rotation
    let newRotation = new Quaternion();
  
    // Smoothly interpolate from the current rotation to the target rotation
    const step = this._turnStepSize * deltaTime;
  
    // Apply the rotation to the new quaternion
    Quaternion.SlerpToRef(this._mesh.rotationQuaternion, targetRotation, step, newRotation);
  
    // Assign the new rotation to the mesh
    this._mesh.rotationQuaternion = newRotation;
  
    // If the target rotation is reached, stop turning
    if (Quaternion.Dot(this._mesh.rotationQuaternion, targetRotation) > 0.9999) { // Dot product is near 1
      this._isTurning = false;
    }
  }
  

  public setTargetPosition(position: Vector3): void {
    if (!this._mesh) {
      console.warn("No mesh", this)
      return
      }
       const gridOrigin = new Vector3(0, 0, 0);
       const tileHeight = 8;
       const tileRadius = 8;

    // Transform world coordinates to grid coordinates
    let gridPosition = position.subtract(gridOrigin);
  
    // Calculate array indices
    let i = Math.round(gridPosition.z / tileHeight);
    let j = Math.round(gridPosition.x / (1.5 * tileRadius));
  
    // Check if the clicked position is actually inside the hexagonal tile
    // (You need to implement this. It might involve checking the distance to the center of the tile, 
    // or it might involve checking if the point is inside the hexagonal shape.)
  
    // Get center of tile
    let tileCenter = new Vector3(
      j * 1.5 * tileRadius + gridOrigin.x,
      1, // Adjust this as necessary
      i * tileHeight + gridOrigin.z
    );

    // Ignore the y value from the incoming position
    this._targetPosition = new Vector3(position.x, 1, position.z);
  
    // Calculate the desired direction
    let deltaI = i - this._mesh.position.z / tileHeight;
    let deltaJ = j - this._mesh.position.x / (1.5 * tileRadius);

    const desiredDirection = new Vector3(
      deltaJ * 1.5 * tileRadius,
      0,
      deltaI * tileHeight + (deltaJ % 2) * (tileHeight / 2),
    ).normalize();

  
    // Calculate the distance between current and target position
    const distance = Vector3.Distance(this._mesh.position, this._targetPosition);
  
    // Define the maximum allowed distance
    const maxDistance = 15; // Adjust this as needed
  
    // If the distance is greater than the maximum allowed distance,
    // adjust the target position to be within the maximum distance
    if (distance > maxDistance) {
      this._targetPosition = this._mesh.position.add(desiredDirection.scale(maxDistance));
    }
  
    console.log(`Set target position to: ${this._targetPosition}`);
  
    // Calculate the target angle
    let targetAngle = Math.acos(Vector3.Dot(this._currentDirection, desiredDirection));
  
    // Convert the target angle to degrees
    this._targetAngle = targetAngle * (180 / Math.PI);
  
    // Start the turning process
    this._isTurning = true;
  }
  

  public getMesh(): Mesh {
    return this._mesh;
  }

  getPosition(): Vector3 {
    return this._position; // return the player's current position
  }

  getTargetPosition(): Vector3 {
    return this._targetPosition; // return the player's current target position
  }
}
