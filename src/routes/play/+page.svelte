<script lang="ts">
    import { onMount } from "svelte";
    import { directions, Maze, symbols } from "$lib";
    import type { Direction } from "$lib";

    let w = $state(10), h = $state(10);
    // svelte-ignore state_referenced_locally
    let maze = new Maze<any>(w, h);
    let grid = $state(maze.getWalls());
    let autogen = $state(false);
    let error = $state('.');
    let gameState = $state({
        health: 100,
    });

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
        if (settings) {
            const { width, height, speed } = JSON.parse(settings);
            w = width; h = height;
            maze = new Maze(width, height);
            if (savedMaze) maze.grid = JSON.parse(savedMaze);
            grid = maze.getWalls();
            setInterval(() => {
                if (autogen) maze.originShift();
            }, speed);
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') maze.originShift(directions.up).catch(errorCatch);
            if (e.key === 'ArrowDown') maze.originShift(directions.down).catch(errorCatch);
            if (e.key === 'ArrowLeft') maze.originShift(directions.left).catch(errorCatch);
            if (e.key === 'ArrowRight') maze.originShift(directions.right).catch(errorCatch);
        });

        maze.onGridUpdate(() => {
            grid = maze.getWalls();
            localStorage.setItem('maze', JSON.stringify(grid));
        });
    });

    $effect(() => {
        if (gameState.health > 100) gameState.health = 100;
        if (gameState.health < 0) gameState.health = 0;

        localStorage.setItem('gameState', JSON.stringify(gameState));

        if (gameState.health <= 0) {
            alert('You died! Triggering reset...');
            localStorage.clear();
            window.location.reload();
        }
    });
</script>

<div class="w-full h-full flex flex-col gap-2 justify-center items-center shadow-inner data-[]:shadow-red-500">
    <div class="flex flex-col">
        {#each grid as row}
            <div class="flex w-full justify-evenly">
                {#each row as node}
                    <div
                        class="size-8 p-1 border-transparent border
                            data-[wall-up=true]:border-t-gray-400
                            data-[wall-down=true]:border-b-gray-400
                            data-[wall-left=true]:border-l-gray-400
                            data-[wall-right=true]:border-r-gray-400"
                        data-wall-up={node.walls[0]} data-wall-down={node.walls[1]} data-wall-left={node.walls[2]} data-wall-right={node.walls[3]}
                        data-direction={node.direction}
                    >
                        <span data-direction={node.direction} class="text-gray-900 data-[direction=0]:text-red-900">{symbols[node.direction]}</span>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
    <span class="text-red-500">{error}</span>
</div>

<div class="fixed bottom-0 px-10 w-full object-cover h-10 flex gap-2 justify-between items-center bg-gray-800">
    <div class="flex gap-2 justify-between items-center">
        <span class="text-sm">Health ({gameState.health})</span>
        <progress
            class="w-64 h-4 [&::-webkit-progress-value]:bg-red-800 [&::-moz-progress-bar]:bg-red-800"
            value={gameState.health}
            max="100"
        ></progress>
    </div>
    <div>
        <input type="checkbox" name="auto" bind:checked={autogen}>
        <label for="auto">Auto Shift</label>
    </div>
    <div>
        <button onclick={() => {
            maze.originShift().catch(errorCatch);
        }}>Origin Shift</button>
    </div>
</div>