<script lang="ts">
    import { onMount } from "svelte";

    let statusText = $state('');
    let settings = $state({
        width: 10,
        height: 10,
        speed: 1,
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

<form onsubmit={updateSettings} class="p-8 h-full flex flex-col justify-between">
    <div>
        <h1 class="text-4xl">Settings</h1>
        <p>{statusText}</p>
    </div>
    <div class="w-48">
        <div class="flex justify-between items-center w-full">
            <label for="speed">Speed:</label>
            <input class="w-24" type="number" placeholder="speed" bind:value={settings.speed}>
        </div>
        <div class="flex justify-between items-center w-full">
            <label for="width">Width:</label>
            <input class="w-24" type="number" placeholder="width" bind:value={settings.width}>
        </div>
        <div class="flex justify-between items-center w-full">
            <label for="height">Height:</label>
            <input class="w-24" type="number" placeholder="height" bind:value={settings.height}>
        </div>
    </div>
    <button type="submit" class="w-min whitespace-nowrap">Save</button>
</form>