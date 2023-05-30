<script lang="ts">
	export let value: number
	export let error: string[] | undefined
</script>

<div>
	<div class="justify-center md:flex md:space-x-5 mb-2 text-xs font-bold text-white">
		<button
			class="w-full my-2 md:w-auto py-1 px-8 rounded-md bg-sky-400 dark:bg-sky-500 border-sky-600 dark:border-sky-300"
			class:border-r-8={value === 0}
			class:pr-6={value === 0}
			on:click|preventDefault={() => (value = 0)}
		>
			Basic tutorial
		</button>
		<button
			class="w-full my-2 md:w-auto py-1 px-8 rounded-md bg-orange-400 dark:bg-orange-500 border-orange-600 dark:border-orange-300"
			class:border-r-8={value === 1}
			class:pr-6={value === 1}
			on:click|preventDefault={() => (value = 1)}
		>
			Intermidiate tutorial
		</button>
		<button
			class="w-full my-2 md:w-auto py-1 px-8 rounded-md bg-red-400 dark:bg-red-500 border-red-600 dark:border-red-300"
			class:border-r-8={value === 2}
			class:pr-6={value === 2}
			on:click|preventDefault={() => (value = 2)}
		>
			Advanced tutorial
		</button>
	</div>
	{#if error}
		<small class="text-error-500">{error}</small>
	{:else}
		<div class="m-0 h-5" />
	{/if}
</div>
