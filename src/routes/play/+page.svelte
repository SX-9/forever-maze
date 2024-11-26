<script lang="ts">
    import { directions, Game, Maze, type Payload, type Direction } from "$lib";
    import { onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { goto } from "$app/navigation";
    import MazeUi from "$lib/MazeUI.svelte";

    let w = $state(2), h = $state(2);
    // svelte-ignore state_referenced_locally
    let maze = new Maze<Payload>(w, h);
    let game = new Game(maze);
    
    let buttonControls = $state(false);
    let allowControl = $state(false);
    let autosave = $state(true);
    let slow = $state(false);
    let busy = $state(false);
    let autogen = $state(true);
    let showMarkers = $state(false);
    let error = $state('');
    let dir: Direction = $state(0);
    let gameState = $state({
        scores: [],
    });
    let grid = $state(maze.getWalls());
    let isArrow = $state(true);
    let playerX = $state(game.player.x);
    let playerY = $state(game.player.y);
    
    let autogenInterval: NodeJS.Timeout | null = null;
    let keyInterval: NodeJS.Timeout | null = null;
    let playerInterval: NodeJS.Timeout | null = null;

    function errorCatch(e: Error) {
        error = e.toString();
        setTimeout(() => {
            error = '';
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
                buttonControls: bcSetting,
                slow: slSetting,
            } = JSON.parse(settings);
            showMarkers = smSetting;
            allowControl = acSetting;
            buttonControls = bcSetting;
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

<MazeUi
    bind:grid={grid}
    bind:playerX={playerX}
    bind:playerY={playerY}
    bind:busy={busy}
    {slow} {showMarkers}
/>

{#if buttonControls}
    <div class="fixed bottom-8 left-8 opacity-50 grid grid-cols-3 gap-2">
        <div></div>
        <button class="no-ba" onclick={() => game.movePlayer(directions.up).catch(errorCatch)}>^</button>
        <div></div>
        <button class="no-ba" onclick={() => game.movePlayer(directions.left).catch(errorCatch)}>{'<'}</button>
        <button class="no-ba" onclick={() => game.movePlayer(directions.down).catch(errorCatch)}>v</button>
        <button class="no-ba" onclick={() => game.movePlayer(directions.right).catch(errorCatch)}>{'>'}</button>
    </div>
{/if}