<script lang="ts">
	import { browser } from "$app/environment"
	import type { Script } from "svelte/types/compiler/interfaces"

	export let script: Script

	function getCover(path: string) {
		if (path.endsWith(".jpg")) return path
		return path + "cover.jpg"
	}

	let imgLink: string = getCover(script.scripts_protected.assets_path)
	$: imgLink = getCover(script.scripts_protected.assets_path)
	$: script = script
</script>

<div
	class="flex w-[300px] h-[200px] my-8 shadow-sm rounded-md
    outline-sky-400 outline-2 outline-double"
>
	<div
		class="w-[300px] h-[200px] text-xs whitespace-nowrap rounded-md bg-no-repeat"
		style="background-image: url({imgLink}); filter: blur(2px) brightness(0.8);"
	/>
	<div class="grid relative m-auto text-shadow whitespace-nowrap text-center">
		<h5 class="font-semibold text-primary-600 dark:text-primary-500">
			{script.title}
		</h5>
		<span>
			by {script.scripts_protected.profiles_public.username}
		</span>
	</div>
</div>
