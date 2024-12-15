<script lang="ts">
    import { fly } from "svelte/transition";
    import { directions, Maze, symbols } from "$lib";

    let maze = new Maze(2, 2);
    let {
        grid = $bindable(maze.getWalls()),
        mark = $bindable({ x: 0, y: 0 }),
        player = $bindable({ x: 0, y: 0 }),
        busy = $bindable(false),
        slow = false, showMarkers = false,
    } = $props();
</script>

<div
    transition:fly={{ y: 100, duration: 150 }}
    class="w-min h-full max-w-full max-h-full overflow-auto p-4 mx-auto flex">
    <div class="m-auto data-[busy=true]:scale-50 transition-transform" data-busy={busy}>
        <div>
            {#each grid as row, y}
                <div class="flex m-auto">
                    {#each row as node, x}
                        <div
                            class="max-w-8 max-h-8 size-8 p-1 border-transparent border border-solid
                                flex justify-center items-center
                                transition-colors duration-200 data-[slow=true]:duration-1000 ease-linear
                                data-[wall-up=true]:border-t-white
                                data-[wall-down=true]:border-b-white
                                data-[wall-left=true]:border-l-white
                                data-[wall-right=true]:border-r-white"
                            data-wall-up={node.walls[0]} data-wall-down={node.walls[1]} data-wall-left={node.walls[2]} data-wall-right={node.walls[3]}
                            data-direction={node.direction} data-slow={slow}>
                            {#if player.x === x && player.y === y}
                                <span class="text-green-400"><b>#</b></span>
                            {:else if mark.x === x && mark.y === y}
                                <span class="text-yellow-400"><b>*</b></span>
                            {:else}
                                {#if showMarkers}
                                    <span class="text-blue-400">{symbols[node.direction]}</span>
                                {:else}
                                    {#if node.direction === 0}
                                        <span class="text-red-400">+</span>
                                    {:else}
                                        {#if player.x === x && player.y - 1 === y && !node.walls[1]}
                                            <span class="text-blue-900">w</span>
                                        {:else if player.x === x && player.y + 1 === y && !node.walls[0]}
                                            <span class="text-blue-900">s</span>
                                        {:else if player.x - 1 === x && player.y === y && !node.walls[3]}
                                            <span class="text-blue-900">a</span>
                                        {:else if player.x + 1 === x && player.y === y && !node.walls[2]}
                                            <span class="text-blue-900">d</span>
                                        {:else if mark.x === x && mark.y - 1 === y && !node.walls[1]}
                                            <span class="text-blue-900">|</span>
                                        {:else if mark.x === x && mark.y + 1 === y && !node.walls[0]}
                                            <span class="text-blue-900">|</span>
                                        {:else if mark.x - 1 === x && mark.y === y && !node.walls[3]}
                                            <span class="text-blue-900">-</span>
                                        {:else if mark.x + 1 === x && mark.y === y && !node.walls[2]}
                                            <span class="text-blue-900">-</span>
                                        {/if}
                                    {/if}
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>
