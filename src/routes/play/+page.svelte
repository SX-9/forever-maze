<script lang="ts">
    import { directions, Game, Maze, symbols, type Payload, type Direction } from "$lib";
    import { onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { goto } from "$app/navigation";

    let w = $state(2), h = $state(2);
    // svelte-ignore state_referenced_locally
    let maze = new Maze<Payload>(w, h);
    let game = new Game(maze);
    
    let allowControl = $state(false);
    let autosave = $state(true);
    let slow = $state(false);
    let busy = $state(false);
    let autogen = $state(true);
    let showMarkers = $state(false);
    let error = $state('.');
    let dir: Direction = $state(0);
    let gameState = $state({});
    let grid = $state(maze.getWalls());
    let isArrow = $state(true);
    let playerX = $state(game.player.x);
    let playerY = $state(game.player.y);
    
    let mazeEl: HTMLDivElement;
    let autogenInterval: NodeJS.Timeout | null = null;
    let keyInterval: NodeJS.Timeout | null = null;
    let playerInterval: NodeJS.Timeout | null = null;

    function errorCatch(e: Error) {
        error = e.toString();
        setTimeout(() => {
            error = '.';
        }, 3000);
    }

    onMount(() => {
        const savedState = localStorage.getItem('gameState');
        if (savedState) gameState = JSON.parse(savedState);

        const settings = localStorage.getItem('settings');
        const savedMaze = localStorage.getItem('maze');
        let speed = 10;

        if (settings) {
            const {
                width, height,
                speed: spSetting,
                showMarkers: smSetting,
                allowControl: acSetting,
                slow: slSetting,
            } = JSON.parse(settings);
            showMarkers = smSetting;
            allowControl = acSetting;
            speed = spSetting;
            slow = slSetting;
            w = width; h = height;
            maze = new Maze(width, height);
            if (savedMaze) maze.grid = JSON.parse(savedMaze).map((row: number[]) => row.map((node: number) => ({direction:node})));
            else {
                let time = maze.width * maze.height * speed * 10;
                busy = true;
                autosave = false;
                error = `(wait ${time/1000} seconds) maze is generating...`;
                setTimeout(() => {
                    busy = false;
                    autosave = true;
                    error = '.';
                }, time);
            }
            grid = maze.getWalls();
            autogenInterval = setInterval(() => {
                if (autogen) maze.originShift().catch(errorCatch);
            }, speed);
        } else return goto('/settings');

        window.addEventListener('keydown', (e) => {
            if (busy) return;

            if (allowControl && e.key === ' ') autogen = !autogen;
            if (allowControl && e.key === 'Enter') maze.originShift().catch(errorCatch);

            if (e.key.startsWith('Arrow')) {
                dir = {
                    ArrowUp: directions.up,
                    ArrowDown: directions.down,
                    ArrowLeft: directions.left,
                    ArrowRight: directions.right,
                }[e.key] || 0;
                isArrow = true;
            } else {
                isArrow = false;
                if (e.key === 'w') dir = directions.up;
                if (e.key === 'a') dir = directions.left;
                if (e.key === 's') dir = directions.down;
                if (e.key === 'd') dir = directions.right;
            }
        });

        window.addEventListener('keyup', () => {
            dir = 0;
        });

        keyInterval = setInterval(() => {
            if (dir && isArrow) maze.originShift(dir || 0).catch(errorCatch);
        }, speed*10);
        
        playerInterval = setInterval(() => {
            if (dir && !isArrow) game.movePlayer(dir).catch(errorCatch);
        }, 100);

        maze.onGridUpdate(() => {
            grid = maze.getWalls();
            game.maze = maze;
            if (autosave) localStorage.setItem('maze', JSON.stringify(maze.grid.map((row) => row.map((node) => node.direction))));
        });

        game.onGameUpdate((e) => {
            playerX = e.player.x;
            playerY = e.player.y;
        });
    });

    onDestroy(() => {
        if (autogenInterval) clearInterval(autogenInterval);
        if (keyInterval) clearInterval(keyInterval);
        if (playerInterval) clearInterval(playerInterval);
    });

    $effect(() => {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    });
</script>

<span class="text-red-500 fixed top-8 left-8 z-50 bg-black px-2 py-0.5" transition:fly={{ x: -100, duration: 150 }}>{error}</span>

<div
    transition:fly={{ y: 100, duration: 150 }} bind:this={mazeEl}
    class="w-min h-full max-w-full max-h-full overflow-auto p-4 mx-auto flex">
    <div class="m-auto data-[busy=true]:scale-50 transition-transform" data-busy={busy}>
        <div>
            {#each grid as row, y}
                <div class="flex m-auto">
                    {#each row as node, x}
                        <div
                            class="min-w-8 min-h-8 p-1 border-transparent border border-dotted
                                flex justify-center items-center
                                transition-colors duration-200 data-[slow=true]:duration-1000 ease-linear
                                data-[wall-up=true]:border-t-gray-400
                                data-[wall-down=true]:border-b-gray-400
                                data-[wall-left=true]:border-l-gray-400
                                data-[wall-right=true]:border-r-gray-400"
                            data-wall-up={node.walls[0]} data-wall-down={node.walls[1]} data-wall-left={node.walls[2]} data-wall-right={node.walls[3]}
                            data-direction={node.direction} data-slow={slow}>
                            {#if playerX === x && playerY === y}
                                <span class="text-green-700">O</span>
                            {:else}
                                {#if showMarkers}
                                    <span data-direction={node.direction} class="text-gray-900 data-[direction=0]:text-red-700">{symbols[node.direction]}</span>
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>
