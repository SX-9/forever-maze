<script>
    import BgGradient from "$lib/BgGradient.svelte";
    import { fade } from "svelte/transition";
    import Logo from "$lib/Logo.svelte";
    import { paused } from "$lib";
</script>

<BgGradient/>
{#if !$paused}
    <div class="flex justify-center items-center h-full" transition:fade={{ duration: 100 }}>
        <div class="gap-8 flex flex-col z-50">
            <Logo />
            <span class="text-sm">
                game made by <a href="//satr14.my.id" target="_blank" class="underline">satr14</a>
                <br>music and sfx by <a href="//pixabay.com/users/xtremefreddy-32332307/" target="_blank" class="underline">xtremefreddy</a>
            </span>
        </div>
    </div>
{/if}
