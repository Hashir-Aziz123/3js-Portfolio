import * as THREE from 'three'

class CollisionSystem{

}

// Simple spatial grid for broad-phase collision detection
class SpatialGrid{

    constructor(cellSize = 50){
        this.cellSize = cellSize;
        this.grid= new Map();
    }

    add(id, position){
        const key = this._getGridKey(position)
    }

}

export default CollisionSystem