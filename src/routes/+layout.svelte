<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
    import MainMenu from '$lib/MainMenu.svelte';
	import { navigating } from '$app/stores';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { paused } from '$lib';
	import '../app.css';
  	import { get } from 'svelte/store';

	let { children } = $props();
	let isPlaying = false;
	let audioInstances: HTMLAudioElement[] = [];
	let path = '';

	function start() {
		if ($page.url.pathname !== '/play') goto('/play');
		$paused = false;
	}

	function stop() {
		$paused = true;
	}
	
	function playOnLoop(file: string) {
		if (isPlaying) return;
		const audio = new Audio(file);
		audio.addEventListener('ended', () => {
			audio.currentTime = 0;
			audio.play();
		});
		audio.play().then(() => {
			isPlaying = true;
			audioInstances.push(audio);
		});
	}

	function startMusic() {
		let music = path === '/play' ? '/game-music-loop.mp3' : '/menu-music-loop.mp3';
		playOnLoop(music);
		document.addEventListener('click', () => playOnLoop(music), { once: true });
		document.addEventListener('keypress', () => playOnLoop(music), { once: true });
	}

	onMount(() => {
		path = $page.url.pathname;
		if (['/', '/play'].includes($page.url.pathname)) $paused = true;
		
		const sound = localStorage.getItem('sound');
		if (sound === null) localStorage.setItem('sound', 'true');
		if (sound === 'true') startMusic();

		window.onkeydown = (e) => {
			$paused = e.key === 'Escape' ? !$paused : $paused
		};
	});

	onDestroy(() => {
		audioInstances.forEach(audio => audio.pause());
		audioInstances = [];
	});

	onNavigate(() => {
		path = get(navigating)?.to?.url.pathname || get(page).url.pathname;
		if ([$navigating?.from?.url.pathname, $navigating?.to?.url.pathname].includes('/play')) {
			isPlaying = false;
			audioInstances.forEach(audio => audio.pause());
			audioInstances = [];
			startMusic();
		}
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
