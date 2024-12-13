<script lang="ts">
    import MainMenu from '$lib/MainMenu.svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { paused } from '$lib';
	import '../app.css';

	let { children } = $props();
	let isPlaying = false;

	function start() {
		if ($page.url.pathname !== '/play') goto('/play');
		$paused = false;
	}

	function stop() {
		$paused = true;
	}
	
	function playOnLoop(file: string) {
		if (isPlaying) return;
		else isPlaying = true;
		const audio = new Audio(file);
		audio.addEventListener('ended', () => {
			audio.currentTime = 0;
			audio.play();
		});
		audio.play();
	}

	onMount(() => {
		if ($page.url.pathname === '/') $paused = true;
		
		const sound = localStorage.getItem('sound');
		if (sound === null) localStorage.setItem('sound', 'true');
		if (sound === 'true') {
			let music = $page.url.pathname === '/play' ? '/game-music-loop.mp3' : '/menu-music-loop.mp3';
			document.addEventListener('click', () => playOnLoop(music), { once: true });
			document.addEventListener('keydown', () => playOnLoop(music), { once: true });
		}

		window.onkeydown = (e) => {
			$paused = e.key === 'Escape' ? !$paused : $paused
		};
	});

	$effect(() => {
		if ($paused) $paused = true;
		else $paused = false;
	});
</script>

{#if !dev}
	<div class="sm:hidden flex justify-center items-center h-full w-full text-center">
		<h1>Please use a bigger screen</h1>
	</div>
{/if}

<MainMenu bind:showMenu={$paused} {start} {stop}/>
{@render children()}
