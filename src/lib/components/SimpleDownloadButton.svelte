<script lang="ts">
	import { getSignedURL, type Script } from "$lib/supabaseStorage"

	const download = () => {
		getSignedURL("scripts", "premium", "wasp-premium.zip").then((url) => {
			if (url == null) return

			fetch(url)
				.then((resp) => resp.blob())
				.then((blobobject) => {
					const blob = window.URL.createObjectURL(blobobject)
					const anchor = document.createElement("a")
					anchor.style.display = "none"
					anchor.href = blob
					anchor.download = "wasp-premium.zip"
					document.body.appendChild(anchor)
					anchor.click()
					window.URL.revokeObjectURL(blob)
				})
				.catch(() => console.log("An error occured while downloading the file, sorry!"))
		})
	}
</script>

<div class="flex justify-center text-white text-xs font-semibold">
	<button
		type="button"
		class="leading-tight px-6 py-2.5 uppercase rounded transition duration-300 ease-in-out flex justify-start shadow-md hover:shadow-lg
			 bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 outline-orange-300 active:outline"
		on:click|preventDefault={download}
	>
		<span class="mx-4 my-auto">wasp-premium.zip</span>
		<svg
			class="h-5 w-5 animate-bounce"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
</div>
