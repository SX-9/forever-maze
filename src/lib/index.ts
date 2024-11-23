/*
    maze generation library
    algorithm: origin shift
    data structure: grid of nodes with pointers and an origin node
    
    starting position:
    1. grid of nodes with any size
    2. all nodes point to the right
    3. the rightmost nodes points to the bottom
    4. bottom right node is the origin node

    origin shift algorithm steps:
    1. start with a grid of nodes with the format above
    2. pick a random neighbor around the origin node
    3. make the origin node point to the selected neighbor
    4. make the selected neighbor the new origin node
    5. remove the new origin's outbound edge
    6. repeat steps 2-5 for as long as you want
*/

type Direction = 0 | 1 | 2 | 3 | 4;
export const symbols = ['--', '=>', 'VV', '<<', '^^'];
export const directions: Record<string, Direction> = {
    origin: 0,
    right: 1,
    down: 2,
    left: 3,
    up: 4,
};
export class Maze<Type> {
    grid: {
        direction: Direction,
        payload?: Type,
    }[][] = [];
    width = 0; height = 0;
    updateHooks: ((grid: this) => void)[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.loadDefault();
    }

    loadDefault() {
        for (let i = 0; i < this.height; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.width; j++) {
                if (j === this.width - 1) {
                    if (i === this.height - 1) this.grid[i].push({ direction: 0 });
                    else this.grid[i].push({ direction: 2 });
                } else this.grid[i].push({ direction: 1 });
            }
        }
    }

    setNode([x, y]: number[], direction: Direction, options: {
        payload?: Type,
        triggerHook?: boolean,
    }) {
        if (direction === 0) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.grid[i][j].direction === 0) return console.error(`origin node already exists for ${x} ${y} at ${j} ${i}`);
                }
            }
        }
        
        this.grid[y][x].direction = direction;
        if (options.payload) this.grid[y][x].payload = options.payload;

        if (options.triggerHook !== false) this.runUpdateHooks();
    }

    getOriginCoords() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x].direction === 0) return [x, y];
            }
        }
        return [0, 0];
    }

    getNeighbors([y, x]: number[]) {
        let neighbors = [];
        if (x > 0) neighbors.push([y, x - 1]);
        if (x < this.width - 1) neighbors.push([y, x + 1]);
        if (y > 0) neighbors.push([y - 1, x]);
        if (y < this.height - 1) neighbors.push([y + 1, x]);
        return neighbors;
    }

    originShift() {
        let origin = this.getOriginCoords();
        let neighbors = this.getNeighbors(origin);
        let selectedNeighbor = this.getNeighbors(origin)[Math.floor(Math.random() * neighbors.length)];
        
        let direction: Direction = 0;
        if (selectedNeighbor[0] === origin[0] && selectedNeighbor[1] < origin[1]) direction = directions.up; // x is same and selected y is less than origin y (up)
        if (selectedNeighbor[0] === origin[0] && selectedNeighbor[1] > origin[1]) direction = directions.down; // x is same and selected y is more than origin y (down)
        if (selectedNeighbor[1] === origin[1] && selectedNeighbor[0] < origin[0]) direction = directions.left; // y is same and selected x is less than origin x (left)
        if (selectedNeighbor[1] === origin[1] && selectedNeighbor[0] > origin[0]) direction = directions.right; // y is same and selected x is more than origin x (right)

        this.setNode(origin, direction, { triggerHook: false });
        this.setNode(selectedNeighbor, 0, { triggerHook: false });

        this.runUpdateHooks();
    }

    runUpdateHooks() {
        this.updateHooks.forEach(hook => hook(this));
    }

    onGridUpdate(hook: (grid: this) => void) {
        this.updateHooks.push(hook);
    }
}
