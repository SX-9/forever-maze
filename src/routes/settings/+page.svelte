<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    let statusText = $state('');
    let settings = $state({
        width: 40,
        height: 15,
        speed: 10,
        slow: false,
        showMarkers: false,
        allowControl: false,
    });

    function updateSettings(e: Event) {
        e.preventDefault();
        localStorage.setItem('settings', JSON.stringify(settings));
        statusText = 'Settings saved!';
        setTimeout(() => statusText = '', 2000);
    }

    onMount(() => {
        const fetchedSettings = localStorage.getItem('settings');
        if (fetchedSettings) {
            const o = JSON.parse(fetchedSettings);
            settings = o;
        }
    });
</script>

<div class="p-8 h-full flex justify-between items-center">
    <form onsubmit={updateSettings} class="h-full flex flex-col justify-between" transition:fly={{ x: -100, duration: 250 }}>
        <div>
            <span class="text-sm">made by <a href="//satr14.my.id" class="underline">satr14</a></span>
            <h1 class="text-4xl">Settings</h1>
            <p>{statusText}</p>
        </div>
        <div class="w-72">
            <div class="flex justify-between items-center w-full">
                <label for="speed">Generation speed:</label>
                <input class="w-24" type="number" min="0" placeholder="speed" bind:value={settings.speed}>
            </div>
            <div class="flex justify-between items-center w-full">
                <label for="width">Maze width:</label>
                <input class="w-24" type="number" min="0" placeholder="width" bind:value={settings.width}>
            </div>
            <div class="flex justify-between items-center w-full">
                <label for="height">Maze height:</label>
                <input class="w-24" type="number" min="0" placeholder="height" bind:value={settings.height}>
            </div>
            <div class="flex justify-between items-center w-full">
                <label for="showMarkers">Show markers:</label>
                <input type="checkbox" id="showMarkers" bind:checked={settings.showMarkers}>
            </div>
            <div class="flex justify-between items-center w-full">
                <label for="allowControl">Allow control:</label>
                <input type="checkbox" id="allowControl" bind:checked={settings.allowControl}>
            </div>
            <div class="flex justify-between items-center w-full">
                <label for="slow">Slow animation:</label>
                <input type="checkbox" id="slow" bind:checked={settings.slow}>
            </div>
        </div>
        <div class="flex gap-4 items-center">
            <button type="submit" class="w-min whitespace-nowrap">Save</button>
        </div>
    </form>
    <dir transition:fly={{ x: 100, duration: 250 }}>
        <p class="text-right">
            Pause/Resume the game - <kbd>Esc</kbd><br>
            Move the player - <kbd>WASD</kbd><br>
            <br>
            These controls the maze generation only if <u>Allow Control</u> is enabled:<br>
            Shift Origin to specified direction - <kbd>ArrowKeys</kbd><br>
            Shift Origin to random direction - <kbd>Enter</kbd><br>
            Play/Pause Auto-Shift - <kbd>Space</kbd><br>
            <br>
            <span class="text-red-500">
                Changing maze sizes on a saved game is incompatible!<br>
                It's recommended to reset the game before changing the sizes.<br>
            </span>
        </p>
    </dir>
</div>