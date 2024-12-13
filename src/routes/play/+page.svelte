<script lang="ts">
    import { directions, paused, Game, Maze, type Direction } from "$lib";
    import { onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { goto } from "$app/navigation";
    import MazeUi from "$lib/MazeUI.svelte";

    let w = $state(2), h = $state(2);
    // svelte-ignore state_referenced_locally
    let maze = new Maze(w, h);
    let game = new Game(maze);
    
    let buttonControls = $state(false);
    let allowControl = $state(false);
    let autosave = $state(true);
    let slow = $state(false);
    let busy = $state(true);
    let autogen = $state(true);
    let showMarkers = $state(false);
    let timeDisplay = $state(0);
    let error = $state('');
    let dir: Direction = $state(0);
    let grid = $state(maze.getWalls());
    let isArrow = $state(true);
    let gameState = $state({
        // svelte-ignore state_referenced_locally
        mark: game.mark,
        player: game.player,
        records: game.records,
        last: game.last,
        elapsed: game.elapsed,
    });

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
        if (savedState) {
            gameState = JSON.parse(savedState);
            game.mark = gameState.mark || { x: 0, y: 0 };
            game.player = gameState.player || { x: 0, y: 0 };
            game.last = gameState.last || 0;
            game.elapsed = gameState.elapsed || 0;
            game.records = gameState.records || [];
        }

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
            game.invalid = allowControl;
            if (savedMaze) {
                maze.grid = JSON.parse(savedMaze).map((row: number[]) => row.map((node: number) => ({direction:node})));
                busy = false;
            } else {
                let time = maze.width * maze.height * speed * 10;
                autosave = false;
                error = `${allowControl ? 'WARNING: All records will be marked as invalid when maze generation control is on. ' : ''}(wait ${time/1000}s) generating initial maze...`;

                game.mark = { x: Math.floor(Math.random() * w), y: Math.floor(Math.random() * h) };
                game.player = { x: Math.floor(Math.random() * w), y: Math.floor(Math.random() * h) };
                gameState.mark = game.mark; gameState.player = game.player; gameState.records = [];
                gameState.last = 0; gameState.elapsed = 0;

                setTimeout(() => {
                    busy = false;
                    autosave = true;
                    error = '';
                    game.startTimer();
                }, time);
            }
            grid = maze.getWalls();
        } else return goto('/settings');

        window.addEventListener('keydown', (e) => {
            if (busy || $paused) return;

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

        autogenInterval = setInterval(() => {
            if (autogen && !$paused) maze.originShift().catch(errorCatch);
        }, speed);

        keyInterval = setInterval(() => {
            if (!$paused && dir && isArrow) maze.originShift(dir || 0).catch(errorCatch);
        }, speed*10);
        
        playerInterval = setInterval(() => {
            if (!$paused && dir && !isArrow) game.movePlayer(dir).catch(errorCatch);
        }, 100);

        maze.onGridUpdate(() => {
            grid = maze.getWalls();
            game.maze = maze;
            if (autosave) localStorage.setItem('maze', JSON.stringify(maze.grid.map((row) => row.map((node) => node.direction))));
        });

        game.onTimeTick = () => {
            timeDisplay = game.elapsed;
        };

        game.onGameUpdate((e) => {
            gameState.mark = e.mark;
            gameState.player = e.player;
            gameState.records = e.records;
            gameState.last = e.last;
            gameState.elapsed = e.elapsed;
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

    paused.subscribe((isPaused) => {
        if (isPaused) game.stopTimer();
        else if (!busy) game.startTimer();
    });
</script>

<div class="fixed top-0 left-0 z-20 h-full w-full flex justify-center items-center">
    <span class="text-red-500 bg-black rounded-sm px-2 py-0.5 opacity-75" transition:fly={{ x: -100, duration: 150 }}>{error}</span>
</div>

<MazeUi
    bind:grid={grid} bind:busy={busy}
    bind:player={gameState.player}
    bind:mark={gameState.mark}
    {slow} {showMarkers}
/>

<span class="fixed top-8 left-8 opacity-75 grid grid-cols-3 gap-2 z-20 text-white">{timeDisplay}s</span>

{#if buttonControls}
    <div class="fixed bottom-8 left-8 opacity-75 grid grid-cols-3 gap-2 z-20">
        <div></div>
        <button class="no-ba" disabled={busy} onclick={() => game.movePlayer(directions.up).catch(errorCatch)}>^</button>
        <div></div>
        <button class="no-ba" disabled={busy} onclick={() => game.movePlayer(directions.left).catch(errorCatch)}>{'<'}</button>
        <button class="no-ba" disabled={busy} onclick={() => game.movePlayer(directions.down).catch(errorCatch)}>v</button>
        <button class="no-ba" disabled={busy} onclick={() => game.movePlayer(directions.right).catch(errorCatch)}>{'>'}</button>
    </div>
{/if}

{#if $paused}
    <div transition:fly={{ x: 100, duration: 150 }} class="fixed top-0 right-0 p-8 z-50 h-full max-h-full overflow-y-auto flex flex-col items-end text-right">
        {#if allowControl}
            <span class="text-red-400">
                Maze generation controls is on,<br>
                records will be marked as invalid.<br>
            </span>
        {/if}
        <ol>
            {#each gameState.records as record, i}
                <li class="px-2 data-[invalid=true]:opacity-50 data-[invalid=true]:line-through" data-invalid={record.invalid}>
                    <span class="text-blue-300">{record.time}s</span>
                    <span class="text-green-300">{record.diff}s</span>
                    <span class="text-yellow-300">#{i + 1}</span>
                </li>
            {/each}
        </ol>
    </div>
{/if}