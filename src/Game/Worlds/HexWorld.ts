import * as BABYLON from '@babylonjs/core';
import { SkyMaterial, WaterMaterial } from '@babylonjs/materials';
import store from 'store';

const {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Tools,
  Color3,
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

    start() {
      super.start();
  
      this.scene.getEngine().displayLoadingUI();
    }
  
    load(): Promise<WorldInterface> {
        return new Promise((resolve) => {
            this.prepareCamera();
            this.prepareLights();
            this.prepareEnvironment();

                        // Initialize the player
            this._player = new Player(this.scene);
            this._player.load().then(() => {
              console.log("Player loaded successfully");
            }).catch((error) => {
              console.error("Error loading player: ", error);
            });

            
            this.prepareNetwork();
      
            // Hide preloader
            this.scene.getEngine().hideLoadingUI();
      
            // Force pointer lock
            GameManager.inputManager.setForcePointerLock(true);

            this.scene.onPointerObservable.add((pointerInfo) => {
              switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                  if (pointerInfo.pickInfo.hit) {
                    this._player.setTargetPosition(pointerInfo.pickInfo.pickedPoint);
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
let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);

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
  
      
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../Resources/textures/skybox", this.scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.backFaceCulling = false;
      //skyboxMaterial.useSunPosition = true;
      //skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
  
      // Ground
      let radius = 7.5;
    const cylinder = MeshBuilder.CreateCylinder("cylinder", {tessellation: 6, height:0.01, diameter: 2 * radius}, this.scene);
    //const block_mat = new StandardMaterial("block_mat", this.scene);
    //block_mat.diffuseColor = Color3.Blue();
     // const waterMesh = new BABYLON.Mesh("waterMesh", this.scene);
    const water = new WaterMaterial("water", this.scene);
    water.bumpTexture = new BABYLON.Texture("../Resources/textures/waterbump.png", this.scene); // Set the bump texture
       //Water properties
       water.backFaceCulling = true;
    water.windForce = -10;
    water.waveHeight = 0.05;
    water.windDirection = new BABYLON.Vector2(1, 1);
    water.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
    water.colorBlendFactor = 0.0;
    water.bumpHeight = 0.01;
    water.waveLength = 0.1;
    
    //Add skybox and ground to the reflection and refraction
    water.addToRenderList(skybox);
    //water.addToRenderList(cylinder);

    cylinder.material = water;
    cylinder.setEnabled(false);
    
    radius += 0.5; //add a small gap
    const bigHexRadius = 12;
    const height = Math.sqrt(3) * 0.5 * radius;
    let nbInCol = 2 * bigHexRadius + 1;
    const deltaCol = 1.5 * radius;
    let rowStartAt = -2 * bigHexRadius * height;
    let currentRow = rowStartAt;
    let colStartAt = 0;
    let hexCount = 0;
    //center row
    for(let i = 0; i < nbInCol; i++) {
        const instance = cylinder.createInstance("ins_cy" + (hexCount++))
        instance.position = new BABYLON.Vector3(colStartAt, 0, currentRow);
        currentRow += 2 * height;
    }
    colStartAt += deltaCol;
    rowStartAt += height;
    currentRow = rowStartAt;
    nbInCol--;
    while (nbInCol > bigHexRadius) {
        for(let i = 0; i < nbInCol; i++) {
            const instanceR = cylinder.createInstance("ins_cy" + (hexCount++))
            instanceR.position = new BABYLON.Vector3(colStartAt, 0, currentRow);
            const instanceL = cylinder.createInstance("ins_cy" + (hexCount++))
            instanceL.position = new BABYLON.Vector3(-colStartAt, 0, currentRow);
            currentRow += 2 * height;
        }
        colStartAt += deltaCol;
        rowStartAt += height;
        currentRow = rowStartAt;
        nbInCol--;
    }

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

    /*
    //prepare player movement
      prepareNetworkToReplicateTransformsMovement() {
        super.prepareNetworkToReplicateTransformsMovement();
    
        const networkRoomState = <RoomState>this.networkRoom.state;
    
        // Transforms
        this.networkRoom.onStateChange.once((state: RoomState) => {
          state.transforms.forEach((transform: Transform) => {
            this.prepareNetworkTransform(transform);
          });
        });
    
        networkRoomState.transforms.onAdd = (transform: Transform) => {
          this.prepareNetworkTransform(transform);
        };
    
        networkRoomState.transforms.onRemove = (transform: Transform) => {
          this.scene.getMeshById(transform.id)?.dispose();
        };
      }
    
      //create player instance
      
      prepareNetworkTransform(transform: Transform) {
        if (transform.type === 'player') {
          const existingTransform = this.scene.getNodeById(transform.id);
          if (existingTransform) {
            return;
          }
          //create player mesh
          let transformMesh = MeshBuilder.CreateCylinder(transform.id, {
            height: 2,
          }, this.scene);
    
          transformMesh.position = new Vector3(
            transform.position.x,
            transform.position.y,
            transform.position.z
          );
          transformMesh.rotation = new Vector3(
            transform.rotation.x,
            transform.rotation.y,
            transform.rotation.z
          );
    
          if (transform.sessionId === this.networkRoomSessionId) {
            this.controller.posessTransformNode(transformMesh);
            this.prepareNetworkReplicateMovementForLocalTransform(transformMesh);
          } else {
            // Sync metadata
            if (
              !transformMesh.metadata ||
              !transformMesh.metadata.network
            ) {
              this.prepareTransformNodeNetworkMetadata(transformMesh);
            }
    
            transformMesh.metadata.network.serverData = {
              position: new Vector3(
                transform.position.x,
                transform.position.y,
                transform.position.z
              ),
              rotation: new Vector3(
                transform.rotation.x,
                transform.rotation.y,
                transform.rotation.z
              ),
            };
    
            transform.rotation.onChange = (changes) => {
              let newValue = transformMesh.rotation.clone();
              changes.forEach((change) => {
                newValue[change.field] = change.value;
              });
              transformMesh.metadata.network.serverData.rotation = newValue;
              transformMesh.metadata.network.serverLastUpdate = (new Date()).getTime();
            };
    
            transform.position.onChange = (changes) => {
              let newValue = transformMesh.position.clone();
              changes.forEach((change) => {
                newValue[change.field] = change.value;
              });
              transformMesh.metadata.network.serverData.position = newValue;
              transformMesh.metadata.network.serverLastUpdate = (new Date()).getTime();
            };
          }
        }
      }
      */

      get player() {
        return this._player;
      }
  }
  