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
        goto('/settings');
        setTimeout(() => {
            localStorage.removeItem('maze');
            location.reload();
        }, 1000);
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
            <!-- svelte-ignore a11y_autofocus -->
            <button onclick={start} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out bg-gray-400 hover-focus:bg-gray-100 text-gray-950" autofocus>Play</button>
            <button onclick={settings} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out">Settings</button>
            <button onclick={reset} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out bg-red-600 hover-focus:bg-red-500 text-red-950">Reset</button>
        </div>
    </div>
{:else}
    <button onclick={stop} class="fixed top-4 right-4 z-50" transition:slide={{ axis: 'y', duration: 100 }}>Pause</button>
{/if}