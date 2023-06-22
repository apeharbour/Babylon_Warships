import * as BABYLON from '@babylonjs/core';
import { GLTFFileLoader } from '@babylonjs/loaders';
import { SkyMaterial, WaterMaterial } from '@babylonjs/materials';
import { HexTile } from '../HexTile';
import store from 'store';

 // Register the GLTF loader plugin
 BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader());

const {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Tools,
  Color3,
  Scene,
  Mesh,
} = BABYLON;
  
import { GameManager } from '../../Framework/Core/GameManager';
import { WorldInterface } from '../../Framework/Worlds/World';
import { AbstractNetworkWorld } from '../../Framework/Worlds/NetworkWorld';
import { RoomState } from '../../Framework/Network/Schemas/RoomState';
import { Transform } from '../../Framework/Network/Schemas/Transform';
import {
  GAME_SERVER_HOST,
  GAME_SERVER_PORT,
} from '../Config';
import { Player } from '../Player';

  
  export class HexWorld extends AbstractNetworkWorld {
    public networkHost: string = GAME_SERVER_HOST;
    public networkPort: number = GAME_SERVER_PORT;
    public groundSize: number = 128;
    private _player: Player;
    private hexTiles: HexTile[] = [];

    

    start() {
      super.start();
    
      this.scene.getEngine().displayLoadingUI();
    
      window.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          this.logWorldState();
        }
      });
    }
  
    load(): Promise<WorldInterface> {
        return new Promise((resolve) => {
            this.prepareCamera();
            this.prepareLights();
            this.prepareEnvironment();

             // Register the GLTF loader plugin
             //BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader());

            // Initialize the players
            const playerModels = [
              "/Resources/models/yacht2.glb", 
              "/Resources/models/1067.glb", 
              "/Resources/models/2186.glb", 
              "/Resources/models/2774.glb",
              /* more model paths... */
            ];
            
            const initialPositions = [new Vector3(0, 0, 20), new Vector3(10, 0, 20), new Vector3(20, 0, 20), new Vector3(30, 0, 20) /* more initial positions... */];
            
            // Register the GLTF loader plugin
//            BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader());

            const players = playerModels.map((modelPath, index) => {
              const player = new Player(this.scene, modelPath, initialPositions[index]);
              return player;
            });
            
            Promise.all(players.map(player => player.load()))
            .then(() => {
              console.log("All player models loaded successfully");
            })
            .catch((error) => {
              console.error("Error loading player models: ", error);
            });
            
          

            // ... more setup code ...
            
            this.prepareNetwork();
      
            // Hide preloader
            this.scene.getEngine().hideLoadingUI();
      
            // Force pointer lock
            GameManager.inputManager.setForcePointerLock(true);

            this.scene.onPointerObservable.add((pointerInfo) => {
              switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                  const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
                  if (pickResult && pickResult.hit) {
                    const clickedMesh = pickResult.pickedMesh;
                    if (clickedMesh instanceof BABYLON.InstancedMesh) {
                      if (!this.player) {
                        console.warn("No Player");
                        resolve(this);
                      } else {
                      this.player.setTargetPosition(clickedMesh.position);
                      this.player._isMoving = true;
                      this.player._isTurning = true;
                    }
                  }
                }
                  break;
                
                
              }
            });
            

            resolve(this);
      });
    }
  
    prepareCamera() {
// Assuming you have a valid Babylon.js scene
let scene: BABYLON.Scene;

// Create a UniversalCamera, set its position, and attach it to the canvas
let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 50, 0), scene);

// Set the target of the camera
camera.setTarget(BABYLON.Vector3.Zero());

// This applies to the canvas being used for rendering
let canvas: HTMLCanvasElement;

// Attach control to the canvas
camera.attachControl(canvas, true);


// These values of alpha, beta and radius are just example values
let alpha = Math.PI / 2;
let beta = Math.PI / 2;
let radius = 2;

// Create a target for the camera
let target = new BABYLON.Vector3(0, 0, 0);

// The attachControl function will allow the camera to respond to mouse events
camera.attachControl(canvas, true);

// You can set the keys for moving forward, back, left, and right. For example:
camera.keysUp.push(87);    // "W"
camera.keysDown.push(83);  // "S"
camera.keysLeft.push(65);  // "A"
camera.keysRight.push(68); // "D"


        // Create cursor
        let cursor = BABYLON.Mesh.CreateSphere('cursor', 16, 0.1, this.scene);
        cursor.position = new BABYLON.Vector3(0, 0, 1); // initial position
      

        // Update cursor position before each render
        this.scene.registerBeforeRender(() => {
            let forward = this.scene.activeCamera.getForwardRay().direction.scale(10); // 10 units in front of the camera
            cursor.position = this.scene.activeCamera.position.add(forward);
        });
    






  }
  
      
  
    prepareLights() {
      new HemisphericLight(
        'light',
        Vector3.Up(),
        this.scene
      );
    }
  
    prepareEnvironment() {
      // Skybox
      let skybox = MeshBuilder.CreateBox('skybox', {
        size: 1024,
      }, this.scene);
      var skyboxMaterial = new StandardMaterial('skyBox', this.scene);
  
      
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/Resources/textures/skybox", this.scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.backFaceCulling = false;
      //skyboxMaterial.useSunPosition = true;
      //skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
  
 
        // Use your existing code to generate the hexagonal grid here...
      // Ground
      let radius = 7.5;
    const cylinder = MeshBuilder.CreateCylinder("cylinder", {tessellation: 6, height:0.01, diameter: 2 * radius}, this.scene);
    //const block_mat = new StandardMaterial("block_mat", this.scene);
    //block_mat.diffuseColor = Color3.Blue();
     // const waterMesh = new BABYLON.Mesh("waterMesh", this.scene);
    const water = new WaterMaterial("water", this.scene);
    water.bumpTexture = new BABYLON.Texture("/Resources/textures/waterbump.png", this.scene); // Set the bump texture
       //Water properties
       water.backFaceCulling = true;
       water.windForce = 5;
    water.waveHeight = 0.01;
    water.windDirection = new BABYLON.Vector2(1, 1);
    water.waterColor = new BABYLON.Color3(0.1, 0, 1);

    water.bumpHeight = 2;
    water.waveLength = 10;
    water.colorBlendFactor = 0.1;
    //Add skybox and ground to the reflection and refraction
    water.addToRenderList(skybox);
 
    // const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {tessellation: 6, height:0.3, diameter: 2 * radius});
    //  const block_mat = new BABYLON.StandardMaterial("block_mat",scene);
    //  block_mat.diffuseColor = BABYLON.Color3.Blue();
    // cylinder.material = water;
    // cylinder.setEnabled(false);
    let sourceCylinder = BABYLON.MeshBuilder.CreateCylinder('ins_cy', { tessellation: 6, height: 0.001, diameter: 2 * radius });
    sourceCylinder.setEnabled(false)
    radius += 0.25; //add a small gap
    const bigHexRadius = 12;
    const height = Math.sqrt(3) * 0.5 * radius;
    let nbInCol = 2 * bigHexRadius + 1;
    const deltaCol = 1.5 * radius;
    let rowStartAt = -2 * bigHexRadius * height;
    let currentRow = rowStartAt;
    let colStartAt = 0;
    let hexCount = 0;
    //center row
    let cylinders = []
    for (let i = 0; i < nbInCol; i++) {
        const instance = sourceCylinder.clone()
        instance.position = new BABYLON.Vector3(colStartAt, 0, currentRow);
        currentRow += 2 * height;
        cylinders.push(instance)
    }
    colStartAt += deltaCol;
    rowStartAt += height;
    currentRow = rowStartAt;
    nbInCol--;
    while (nbInCol > bigHexRadius) {
        for (let i = 0; i < nbInCol; i++) {
            const instanceR = sourceCylinder.clone()
            cylinders.push(instanceR)
            instanceR.position = new BABYLON.Vector3(colStartAt, 0, currentRow);
            const instanceL = sourceCylinder.clone()
            cylinders.push(instanceL)
            instanceL.position = new BABYLON.Vector3(-colStartAt, 0, currentRow);
            currentRow += 2 * height;
        }
        colStartAt += deltaCol;
        rowStartAt += height;
        currentRow = rowStartAt;
        nbInCol--;
    }

    let ground = BABYLON.Mesh.MergeMeshes(cylinders, true, true, null, false, false)
    ground.material = water
    }

    
  
    prepareInspector() {
      this.scene.debugLayer.show();
    }
  
    prepareNetwork() {
        const lastNetworkRoomId = store.get('lastNetworkRoomId');
        const lastNetworkRoomSessionId = store.get('lastNetworkRoomSessionId');
        if (
          lastNetworkRoomId &&
          lastNetworkRoomSessionId
        ) {
          this.prepareNetworkReconnect(lastNetworkRoomId, lastNetworkRoomSessionId)
            .then(() => {
              this.prepareNetworkPing();
              this.prepareNetworkToReplicateTransformsMovement();
            })
            .catch((throws) => {
              // Fallback if the room doesn't exist
              this.prepareNetworkClientAndJoinLobbyRoom();
            });
        } else {
          this.prepareNetworkClientAndJoinLobbyRoom();
        }
      }
    
      prepareNetworkClientAndJoinLobbyRoom() {
        this.prepareNetworkClientAndJoinRoom('lobby').then(() => {
          this.prepareNetworkPing();
          this.prepareNetworkToReplicateTransformsMovement();
        });
      }


      get player() {
        return this._player;
      }

      getNearestHexCenter(point: BABYLON.Vector3): BABYLON.Vector3 {
        const hexSize = 1; // Set this to the size of your hexagons
        const x = point.x;
        const z = point.z;
    
        const a = Math.floor(x / (hexSize * 3/2));
        const b = Math.floor((x / (hexSize * 3/2) - Math.floor(x / (hexSize * 3/2)) + z / (hexSize * Math.sqrt(3))) / 2);
        const c = Math.floor((z / (hexSize * Math.sqrt(3))) - b);
    
        const candidateHexCenter1 = new BABYLON.Vector3(
            hexSize * 3/2 * a,
            0, 
            hexSize * Math.sqrt(3) * (b + c)
        );
    
        const candidateHexCenter2 = new BABYLON.Vector3(
            hexSize * 3/2 * (a + 1),
            0,
            hexSize * Math.sqrt(3) * (b + c + 1)
        );
    
        if (BABYLON.Vector3.DistanceSquared(point, candidateHexCenter1) < BABYLON.Vector3.DistanceSquared(point, candidateHexCenter2)) {
            return candidateHexCenter1;
        } else {
            return candidateHexCenter2;
        }
    }
    
    private getHexCenter(position: BABYLON.Vector3): BABYLON.Vector3 {
      const radius = 7.5;
     // const bigHexRadius = 12;
      const height = Math.sqrt(3) * 0.5 * radius;
      const deltaCol = 1.5 * radius;
    
      // Berechnen Sie die Spalte und Reihe basierend auf der Position
      const col = Math.round(position.x / deltaCol);
      const row = Math.round(position.z / (2 * height));
    
      // Berechnen Sie die Position des Zentrums des nächstgelegenen Hexagons
      const hexX = col * deltaCol;
      const hexZ = row * 2 * height + (col % 2 === 0 ? 0 : height);
    
      return new Vector3(hexX, position.y, hexZ);
    }


  
      // Gets the HexTile at a given position
  getHexTileAt(position: BABYLON.Vector3): HexTile {
    const hexCenter = this.getHexCenter(position);
    return this.hexTiles.find(hexTile => hexTile.center.equals(hexCenter));
  }

  logWorldState() {
    let worldState = {
        playerPosition: this.player.getPosition(),
        playerTarget: this.player.getTargetPosition(),
        hexTiles: this.hexTiles  // Directly use the hexTiles array
    };
    console.log(worldState);
  }

  }


  