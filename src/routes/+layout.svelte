<script lang="ts">
    import MainMenu from '$lib/MainMenu.svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();
	let showMenu = $state(false);

	function start() {
		if ($page.url.pathname !== '/play') goto('/play');
		showMenu = false;
	}

	function stop() {
		showMenu = true;
	}

	onMount(() => {
		if ($page.url.pathname === '/') showMenu = true;
	});
</script>

{#if !dev}
	<div class="sm:hidden flex justify-center items-center h-full w-full text-center">
		<h1>Please use a bigger screen</h1>
	</div>
{/if}

<MainMenu bind:showMenu={showMenu} {start} {stop}/>
{@render children()}
