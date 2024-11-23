<script>
    import { onMount } from "svelte";
    let a = 0, b = 0;
    onMount(async () => {
        a = 1;
        setInterval(() => {
            b = 1;
            setTimeout(() => b = 0, 1000);
        }, 2000);
    });
</script>

<div class="
    w-full h-full flex flex-col justify-start items-end gap-4 fixed opacity-0 data-[a=1]:opacity-10
    transition-all duration-1000 ease-linear
    bg-gradient-to-tr from-red-700 via-purple-700 to-blue-700 bg-right-top data-[b=1]:bg-left-bottom bg-[length:500%_400%]"
    data-a={a}
    data-b={b}></div>