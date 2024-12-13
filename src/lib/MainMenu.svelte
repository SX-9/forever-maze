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
            localStorage.removeItem('gameState');
            location.reload();
        }, 1000);
    }

    function settings() {
        goto('/settings');
        showMenu = false;
    }

    function toggleSound() {
        localStorage.setItem('sound', localStorage.getItem('sound') === 'true' ? 'false' : 'true');
        location.reload();
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
    <div class="w-full h-full flex flex-col justify-between items-start gap-4 px-16 py-16 fixed backdrop-blur-sm z-40" transition:slide={{
        duration: 100,
        axis: 'x',
    }}>
        <div>
            <h1 class="italic text-7xl">ForeverMaze</h1>
            <p class="text-yellow-300 text-lg">Do It Live.</p>
        </div>
        <div class="w-64">
            <button class="no-ba bg-transparent opacity-50 hover-focus:opacity-75 hover-focus:bg-transparent px-0" onclick={toggleSound}>Toggle sound</button>
            <!-- svelte-ignore a11y_autofocus -->
            <button onclick={start} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out bg-gray-400 hover-focus:bg-gray-100 text-gray-950" autofocus>Play</button>
            <button onclick={settings} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out">Settings</button>
            <button onclick={reset} class="w-full my-2 hover-focus:translate-x-10 transition-all duration-150 ease-out bg-red-600 hover-focus:bg-red-500 text-red-950">Reset</button>
            <span class="text-sm">
                game made by <a href="//satr14.my.id" target="_blank" class="underline">satr14</a>
                <br>music and sfx by <a href="https://pixabay.com/users/xtremefreddy-32332307/" target="_blank" class="underline">xtremefreddy</a>
            </span>
        </div>
    </div>
{:else}
    <button onclick={stop} class="fixed top-4 right-4 z-50 opacity-75" transition:slide={{ axis: 'y', duration: 100 }}>Pause</button>
{/if}