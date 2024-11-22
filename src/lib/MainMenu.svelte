<script lang="ts">
    import { slide } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let {
        showMenu = $bindable(true),
        start = () => {},
        stop = () => {},
    }: {
        showMenu: boolean,
        start: () => void,
        stop: () => void,
    } = $props();

    function reset() {
        if (!confirm('Are you sure?')) return;
        localStorage.clear();
        window.location.reload();
    }

    function settings() {
        goto('/settings');
        showMenu = false;
    }

    onMount(() => {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && showMenu) {
                showMenu = false;
                stop();
            }
        });
    });
</script>

{#if showMenu}
    <div class="w-full h-full flex flex-col justify-between items-start gap-4 px-16 py-16 fixed backdrop-blur-sm z-50" transition:slide={{
        duration: 100,
        axis: 'x',
    }}>
        <div>
            <h1 class="italic text-7xl">ForeverMaze</h1>
            <p class="text-yellow-300 text-lg">Beta Testing</p>
        </div>
        <div class="w-64">
            <button onclick={start} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out bg-gray-400 hover-focus:bg-gray-100 text-gray-900">Play</button>
            <button onclick={reset} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out">Reset</button>
            <button onclick={settings} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out">Settings</button>
        </div>
    </div>
{:else}
    <button onclick={stop} class="fixed top-4 right-4 z-50">Pause</button>
{/if}