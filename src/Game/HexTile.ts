import * as BABYLON from '@babylonjs/core';
const{
    Mesh,
    Vector3,
} = BABYLON;

export class HexTile {
    private mesh: BABYLON.Mesh;
    public center: BABYLON.Vector3; // Vector3 is used as an example. Replace it with the type you need.
    public radius: number; 

    constructor(mesh: BABYLON.Mesh, center: BABYLON.Vector3, radius: number) {
        this.mesh = mesh;
        this.center = center;
        this.radius = radius;
    }

    getMesh(): BABYLON.Mesh {
        return this.mesh;
    }

    getCenter(): BABYLON.Vector3 {
        return this.center;
    }

    
    getRadius(): number {
        return this.radius;
    }
}
