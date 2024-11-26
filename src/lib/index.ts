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

export type Payload = {
    type: 'player' | 'enemy' | 'item', 
    data: any,
};
export type Direction = 0 | 1 | 2 | 3 | 4;
export const symbols = ['+', '>', 'v', '<', '^'];
export const directions: Record<'origin' | 'up' | 'down' | 'left' | 'right', Direction> = {
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
                if (j === 0) {
                    if (i === 0) this.grid[i].push({ direction: directions.origin });
                    else this.grid[i].push({ direction: directions.up });
                } else this.grid[i].push({ direction: directions.left });
            }
        }
    }

    getWalls() {
        return this.grid.map((row: {
            direction: Direction,
        }[], y: number) => row.map((node, x) => ({
            ...node,
            walls: [
                (y === 0 || (this.grid[y - 1][x]?.direction !== directions.down && this.grid[y][x].direction !== directions.up)),
                (y === this.height - 1 || (this.grid[y + 1][x]?.direction !== directions.up && this.grid[y][x].direction !== directions.down)), 
                (x === 0 || (this.grid[y][x - 1]?.direction !== directions.right && this.grid[y][x].direction !== directions.left)),
                (x === this.width - 1 || (this.grid[y][x + 1]?.direction !== directions.left && this.grid[y][x].direction !== directions.right)),
            ],
        })));
    }

    setNode([x, y]: number[], direction: Direction, options: {
        payload?: Type,
        triggerHook?: boolean,
    }) {
        return new Promise<void>((resolve, reject) => {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) reject('out of bound');
    
            if (direction === 0) {
                for (let i = 0; i < this.height; i++) {
                    for (let j = 0; j < this.width; j++) {
                        if (this.grid[i][j].direction === 0) reject('origin node already exists');
                    }
                }
            }
    
            this.grid[y][x].direction = direction;
            if (options.payload) this.grid[y][x].payload = options.payload;
    
            if (options.triggerHook !== false) this.runUpdateHooks();
            resolve();
        });
    }

    getOriginCoords() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x].direction === 0) return [x, y];
            }
        }
        return [0, 0];
    }

    originShift(direction?: Direction) {
        return new Promise<void>(async (resolve, reject) => {
            // debugger
            let origin = this.getOriginCoords();

            if (direction) {
                if (
                    (direction === directions.right && origin[0] + 1 >= this.width) ||
                    (direction === directions.left && origin[0] - 1 < 0) ||
                    (direction === directions.down && origin[1] + 1 >= this.height) ||
                    (direction === directions.up && origin[1] - 1 < 0)
                ) return reject('out of bound');
            } else {
                let availableDirections: Direction[] = [];
                if (origin[0] + 1 < this.width) availableDirections.push(directions.right);
                if (origin[0] - 1 >= 0) availableDirections.push(directions.left);
                if (origin[1] + 1 < this.height) availableDirections.push(directions.down);
                if (origin[1] - 1 >= 0) availableDirections.push(directions.up);
                direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            }

            let selectedNeighbor: [number, number] = [
                origin[0] + (direction === directions.right ? 1 : direction === directions.left ? -1 : 0),
                origin[1] + (direction === directions.down ? 1 : direction === directions.up ? -1 : 0),
            ];
    
            await this.setNode(origin, direction, { triggerHook: false }).catch(reject);
            await this.setNode(selectedNeighbor, 0, { triggerHook: false }).catch(reject);
    
            this.runUpdateHooks();
            resolve();
        });
    }

    runUpdateHooks() {
        this.updateHooks.forEach(hook => hook(this));
    }

    onGridUpdate(hook: (grid: this) => void) {
        this.updateHooks.push(hook);
    }
}

export class Game {
    maze: Maze<Payload>;
    player: {
        x: number,
        y: number,
    };
    updateHooks: ((game: this) => void)[] = [];

    constructor(maze: Maze<Payload>) {
        this.maze = maze;
        this.player = {
            x: 0,
            y: 0,
        }
    }

    movePlayer(direction: Direction) {
        return new Promise<void>(async (resolve, reject) => {
            let walls = this.maze.getWalls()[this.player.y][this.player.x].walls;

            if (direction === directions.right && walls[3] === false) this.player.x++;
            else if (direction === directions.left && walls[2] === false) this.player.x--;
            else if (direction === directions.down && walls[1] === false) this.player.y++;
            else if (direction === directions.up && walls[0] === false) this.player.y--;
            else return reject('wall collision');

            this.runUpdateHooks();
            resolve();
        });
    }

    runUpdateHooks() {
        this.updateHooks.forEach(hook => hook(this));
    }

    onGameUpdate(hook: (game: this) => void) {
        this.updateHooks.push(hook);
    }
}
