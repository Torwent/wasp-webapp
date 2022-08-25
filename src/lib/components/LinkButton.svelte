<script lang="ts">
	export let url: string
	export let text: string
	export let arrow = true
</script>

<div class="flex justify-center">
	<a href={url} class="px-2">
		<button
			type="button"
			class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 active:outline outline-orange-300 my-2"
		>
			{text}
			{#if arrow}
				<svg
					class="-mr-1 ml-2 h-5 w-5 rotate-180 animate-bounce"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
	</a>
</div>
