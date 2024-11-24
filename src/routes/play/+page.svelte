<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { directions, Game, Maze, symbols, type Payload } from "$lib";
    import { fly } from "svelte/transition";
    import { goto } from "$app/navigation";

    let w = $state(2), h = $state(2);
    // svelte-ignore state_referenced_locally
    let maze = new Maze<Payload>(w, h);
    let game = new Game(maze);
    
    let mazeEl: HTMLDivElement;
    let allowControl = $state(false);

    let busy = $state(false);
    let grid = $state(maze.getWalls());
    let autogen = $state(true);
    let error = $state('.');
    let gameState = $state({});
    let showMarkers = $state(false);
    let autogenInterval: NodeJS.Timeout | null = null;

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
            const {
                width, height, speed,
                showMarkers: smSetting, allowControl: acSetting,
            } = JSON.parse(settings);
            showMarkers = smSetting;
            allowControl = acSetting;
            w = width; h = height;
            maze = new Maze(width, height);
            if (savedMaze) maze.grid = JSON.parse(savedMaze).map((row: number[]) => row.map((node: number) => ({direction:node})));
            else {
                let time = maze.width * maze.height * speed * 10;
                busy = true;
                error = `(wait ${time/1000} seconds) maze is generating...`;
                setTimeout(() => {
                    busy = false;
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
            
            if (allowControl && e.key === 'ArrowUp') maze.originShift(directions.up).catch(errorCatch);
            if (allowControl && e.key === 'ArrowDown') maze.originShift(directions.down).catch(errorCatch);
            if (allowControl && e.key === 'ArrowLeft') maze.originShift(directions.left).catch(errorCatch);
            if (allowControl && e.key === 'ArrowRight') maze.originShift(directions.right).catch(errorCatch);
        });

        maze.onGridUpdate(() => {
            grid = maze.getWalls();
            localStorage.setItem('maze', JSON.stringify(maze.grid.map((row) => row.map((node) => node.direction))));
        });
    });


    onDestroy(() => {
        if (autogenInterval) clearInterval(autogenInterval);
    });

    $effect(() => {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    });
</script>

<span class="text-red-500 fixed top-8 left-8 z-50 bg-black px-2 py-0.5" transition:fly={{ x: -100, duration: 150 }}>{error}</span>

<div
    transition:fly={{ y: 100, duration: 150 }} bind:this={mazeEl}
    class="w-min h-full max-w-full max-h-full overflow-auto p-4 mx-auto flex">
    <div class="m-auto data-[busy=true]:scale-50" data-busy={busy}>
        <div>
            {#each grid as row}
                <div class="flex m-auto">
                    {#each row as node}
                        <div
                            class="min-w-8 min-h-8 p-1 border-transparent border flex justify-center items-center
                                data-[wall-up=true]:border-t-gray-400
                                data-[wall-down=true]:border-b-gray-400
                                data-[wall-left=true]:border-l-gray-400
                                data-[wall-right=true]:border-r-gray-400"
                            data-wall-up={node.walls[0]} data-wall-down={node.walls[1]} data-wall-left={node.walls[2]} data-wall-right={node.walls[3]}
                            data-direction={node.direction}>
                            {#if showMarkers}
                                <span data-direction={node.direction} class="text-gray-900 data-[direction=0]:text-red-700">{symbols[node.direction]}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>
