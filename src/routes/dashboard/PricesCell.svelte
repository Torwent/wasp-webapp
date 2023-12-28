<script lang="ts">
	export let prices: {
		id?: string
		amount: number
		currency: string
		interval: string
	}[]

	export let errors: string[] | undefined
</script>

<div>
	<div class="grid md:flex">
		{#each prices as _, i}
			<input
				name="prices"
				class="input mx-1 my-1 md:my-0"
				type="number"
				bind:value={prices[i].amount}
				step="0.01"
			/>
		{/each}
	</div>
	{#if errors}
		{#each errors as error}
			<small class="text-error-500">
				{error}
			</small>
		{/each}
	{/if}
</div>
