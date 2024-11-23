<script lang="ts">
    import { onMount } from "svelte";
    import { Maze, symbols } from "$lib";

    let w = $state(10), h = $state(10);
    // svelte-ignore state_referenced_locally
        let maze = new Maze<any>(w, h);
    let grid = $state(maze.grid);
    let autogen = $state(false);
    let gameState = $state({
        health: 100,
    });

    onMount(() => {
        const savedState = localStorage.getItem('gameState');
        if (savedState) gameState = JSON.parse(savedState);

        const settings = localStorage.getItem('settings');
        if (settings) {
            const { width, height, speed } = JSON.parse(settings);
            w = width; h = height;
            maze = new Maze(width, height);
            grid = maze.grid;
            setInterval(() => {
                if (autogen) maze.originShift();
            }, speed);
        }

        maze.onGridUpdate(() => {
            grid = maze.grid;
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

<div class="w-full h-full flex flex-col justify-center items-center shadow-inner data-[]:shadow-red-500">
    <div class="flex flex-col gap-2">
        <div class="flex gap-4 w-full justify-evenly">
            <span class="text-green-500">++</span>
            {#each new Array(w) as _,x}
                <span class="text-blue-500">{String(x).padStart(2, '0')}</span>
            {/each}
        </div>
        {#each grid as row, y}
            <div class="flex gap-4 w-full justify-evenly">
                <span class="text-blue-500">{String(y).padStart(2, '0')}</span>
                {#each row as node}
                    <span class="data-[direction=0]:text-red-500" data-direction={node.direction}>{symbols[node.direction]}</span>
                {/each}
            </div>
        {/each}
    </div>
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
        <button onclick={() => maze.originShift()}>Origin Shift</button>
    </div>
</div>