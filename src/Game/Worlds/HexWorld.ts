import { SkyMaterial } from '@babylonjs/materials'

import store from 'store';
  
import { GameManager } from '../../Framework/Core/GameManager';
import { WorldInterface } from '../../Framework/Worlds/World';
import { AbstractNetworkWorld } from '../../Framework/Worlds/NetworkWorld';
import { RoomState } from '../../Framework/Network/Schemas/RoomState';
import { Transform } from '../../Framework/Network/Schemas/Transform';
import {
  GAME_SERVER_HOST,
  GAME_SERVER_PORT,
} from '../Config';
import { ArcRotateCamera, ArcRotateCameraKeyboardMoveInput, ArcRotateCameraMouseWheelInput, ArcRotateCameraPointersInput, Color3, HemisphericLight, MeshBuilder, StandardMaterial, Tools, Vector3 } from '@babylonjs/core';
  
  export class HexWorld extends AbstractNetworkWorld {
    public networkHost: string = GAME_SERVER_HOST;
    public networkPort: number = GAME_SERVER_PORT;
    public groundSize: number = 128;
    start() {
      super.start();
  
      this.scene.getEngine().displayLoadingUI();
    }
  
    load(): Promise<WorldInterface> {
        return new Promise((resolve) => {
            this.prepareCamera();
            this.prepareLights();
            this.prepareEnvironment();
            this.prepareNetwork();
      
            // Hide preloader
            this.scene.getEngine().hideLoadingUI();
      
            // Force pointer lock
            GameManager.inputManager.setForcePointerLock(true);
      
            resolve(this);
      });
    }
  
    prepareCamera() {
        let cameraTarget = new Vector3(0, 0, 0); // Set the target point for the camera to rotate around
      
        let camera = new ArcRotateCamera(
          'camera',
          Tools.ToRadians(0),
          Tools.ToRadians(60),
          10,
          cameraTarget,
          this.scene
        );
      
        camera.lowerBetaLimit = Tools.ToRadians(10);
        camera.upperBetaLimit = Tools.ToRadians(80);
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 20;
      
        this.scene.activeCamera = camera;
        this.scene.activeCamera.attachControl(this.scene.getEngine().getRenderingCanvas());
      
        // Enable camera movement using keyboard and mouse
        camera.inputs.add(new ArcRotateCameraKeyboardMoveInput());
        camera.inputs.add(new ArcRotateCameraMouseWheelInput());
        camera.inputs.add(new ArcRotateCameraPointersInput());
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
      var skyboxMaterial = new SkyMaterial('skyboxMaterial', this.scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.useSunPosition = true;
      skyboxMaterial.sunPosition = new Vector3(0, 100, 0);
      skybox.material = skyboxMaterial;
  
      // Ground
      let radius = 0.5;
    const cylinder = MeshBuilder.CreateCylinder("cylinder", {tessellation: 6, height:0.3, diameter: 2 * radius}, this.scene);
    const block_mat = new StandardMaterial("block_mat", this.scene);
    block_mat.diffuseColor = Color3.Blue();

    //const water = new WaterMaterial("water", this.scene);
    //water.bumpTexture = new BABYLON.Texture("../Recources/textures/waterbump.png", this.scene); // Set the bump texture
  	// Water properties
	//water.windForce = -5;
	//water.waveHeight = 1.3;
	//water.windDirection = new BABYLON.Vector2(1, 1);
	//water.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
	//water.colorBlendFactor = 0.3;
	//water.bumpHeight = 0.1;
	//water.waveLength = 0.1;
	
	// Add skybox and ground to the reflection and refraction
	//water.addToRenderList(skybox);

    cylinder.material = block_mat;
    cylinder.setEnabled(false);
    
    radius += 0.025; //add a small gap
    const bigHexRadius = 42;
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
        instance.position = new Vector3(colStartAt, 0, currentRow);
        currentRow += 2 * height;
    }
    colStartAt += deltaCol;
    rowStartAt += height;
    currentRow = rowStartAt;
    nbInCol--;
    while (nbInCol > bigHexRadius) {
        for(let i = 0; i < nbInCol; i++) {
            const instanceR = cylinder.createInstance("ins_cy" + (hexCount++))
            instanceR.position = new Vector3(colStartAt, 0, currentRow);
            const instanceL = cylinder.createInstance("ins_cy" + (hexCount++))
            instanceL.position = new Vector3(-colStartAt, 0, currentRow);
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
  }
  