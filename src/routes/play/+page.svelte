<script lang="ts">
    import { onMount } from "svelte";

    let gameState = $state({
        health: 100,
    });

    onMount(() => {
        const savedState = localStorage.getItem('gameState');
        if (savedState) gameState = JSON.parse(savedState);
    });

    $effect(() => {
        if (gameState.health > 100) gameState.health = 100;
        if (gameState.health < 0) gameState.health = 0;
        
        localStorage.setItem('gameState', JSON.stringify(gameState));

        if (gameState.health <= 0) {
            alert('You died! Triggering reset...');
            localStorage.clear();
            window.location.reload();
        }
    });
</script>

<div class="w-full h-full flex flex-col justify-center items-center shadow-inner data-[]:shadow-red-500">
    <h1>Testing...</h1>
    <div>
        <button onclick={() => gameState.health += 10}>Heal (+10)</button>
        <button onclick={() => gameState.health -= 10}>Hurt (-10)</button>
    </div>
</div>

<div class="fixed bottom-0 px-10 w-full object-cover h-10 flex gap-2 justify-between items-center bg-gray-800">
    <div class="flex gap-2 justify-between items-center">
        <span class="text-sm">Health ({gameState.health})</span>
        <progress
            class="w-64 h-4 [&::-webkit-progress-value]:bg-red-800 [&::-moz-progress-bar]:bg-red-800"
            value={gameState.health}
            max="100"
        ></progress>
    </div>
</div>