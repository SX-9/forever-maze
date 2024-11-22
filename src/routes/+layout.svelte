<script lang="ts">
    import MainMenu from '$lib/MainMenu.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
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

<div class="sm:hidden flex justify-center items-center h-full w-full text-center">
	<h1>Please use a bigger screen</h1>
</div>

<MainMenu bind:showMenu={showMenu} {start} {stop}/>
{@render children()}
