<script lang="ts">
    import { onMount } from "svelte";

    let difficulty = $state(2);
    let volume = $state(100);
    let sfx = $state(true);
    let statusText = $state('');

    function updateSettings(e: Event) {
        e.preventDefault();
        localStorage.setItem('settings', JSON.stringify({
            difficulty, volume, sfx,
        }));

        statusText = 'Settings saved!';
        setTimeout(() => statusText = '', 2000);
    }

    onMount(() => {
        const settings = localStorage.getItem('settings');
        if (settings) {
            const o = JSON.parse(settings);
            difficulty = o?.difficulty || 2;
            volume = o?.volume || 100;
            sfx = o?.sfx || true;
        }
    });
</script>

<form onsubmit={updateSettings} class="p-8 h-full flex flex-col justify-between">
    <div>
        <h1 class="text-4xl">Settings</h1>
        <p>{statusText}</p>
    </div>
    <div class="w-64">
        <label for="difficulty">Difficulty</label>
        <select id="difficulty" bind:value={difficulty}>
            <option value="0">Peaceful</option>
            <option value="1">Easy</option>
            <option value="2">Normal</option>
            <option value="3">Hard</option>
            <option value="4">Insane</option>
        </select>
        <label for="volume">Volume: {volume}%</label>
        <input type="range" min="0" max="100" bind:value={volume} />
        <label for="sfx">SFX:</label>
        <input type="checkbox" id="sfx" bind:checked={sfx} />
    </div>
    <button type="submit" class="w-min whitespace-nowrap">Save</button>
</form>