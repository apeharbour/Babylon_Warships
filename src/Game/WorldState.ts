import * as BABYLON from '@babylonjs/core';

const {
    Vector3
} = BABYLON;

class WorldState {
    playerPosition: BABYLON.Vector3;
    targetPosition: BABYLON.Vector3;
    hexTiles: Array<{position: BABYLON.Vector3, type: string}>;
  
    constructor(playerPosition: BABYLON.Vector3, targetPosition: BABYLON.Vector3, hexTiles: Array<{position: BABYLON.Vector3, type: string}>) {
      this.playerPosition = playerPosition;
      this.targetPosition = targetPosition;
      this.hexTiles = hexTiles;
    }
  
    logState() {
      console.log(`Player position: ${this.playerPosition}`);
      console.log(`Target position: ${this.targetPosition}`);
      console.log(`HexTiles: ${this.hexTiles.length}`);
      this.hexTiles.forEach((tile, index) => {
        console.log(`Tile ${index + 1}: position - ${tile.position}, type - ${tile.type}`);
      });
    }
  }
  