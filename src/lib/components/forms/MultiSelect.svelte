<!-- Based on https://svelte.dev/repl/c7094fb1004b440482d2a88f4d1d7ef5?version=3.14.0 -->
<script lang="ts">
	import { page } from "$app/stores"
	import type { Tooltip } from "$lib/types/collection"
	import { ChevronDown, X } from "lucide-svelte"
	export let title: string
	export let value: string[]
	export let errors: string[] | undefined = undefined
	export let placeholder = ""
	export let tooltips: Tooltip[]

	function checkErrors(err: string[] | undefined) {
		if (!err) return false
		return err.length > 0
	}

	let input: HTMLInputElement
	let hasError: boolean = false
	let showOptions: boolean = false

	let inputValue: string = ""

	function add(category: Tooltip) {
		if (!value.includes(category.name)) value = [...value, category.name]
	}

	function remove(category: Tooltip) {
		showOptions = true
		input.focus()
		for (let i = 0; i < value.length; i++) {
			if (value[i] === category.name) {
				value.splice(i, 1)
				value = value
				return
			}
		}
	}

	function handleOptionMousedown(e: any) {
		const val = e.target.dataset.value
		input.focus()

		for (let i = 0; i < value.length; i++) {
			if (value[i] === val) {
				value.splice(i, 1)
				value = value
				return
			}
		}
		add(tooltips.filter((e) => e.name === val)[0])
	}

	tooltips.forEach((tooltip) => {
		if (value.length < 2 && (tooltip.name === "Community" || tooltip.name === "Free")) add(tooltip)
	})

	$: hasError = checkErrors(errors)

	let { roles } = $page.data
	$: ({ roles } = $page.data)

	$: if (!roles?.administrator) {
		if (value.includes("Official")) {
			for (let i = 0; i < value.length; i++) {
				if (value[i] === "Official") {
					value.splice(i, 1)
					i--
				}
			}
		}
	}

	$: if (value.includes("Official") && value.includes("Community")) {
		for (let i = 0; i < value.length; i++) {
			if (value[i] === (roles?.administrator ? "Official" : "Community")) {
				value.splice(i, 1)
				i--
			}
		}
	}

	$: if (value.includes("Premium") && value.includes("Free")) {
		for (let i = 0; i < value.length; i++) {
			if (value[i] === "Premium") {
				value.splice(i, 1)
				i--
			}
		}
	}
</script>

<div class="mb-8">
	<select id={title.toLowerCase()} name={title.toLowerCase()} multiple class="hidden" bind:value>
		{#each tooltips as tooltip}
			<option value={tooltip.name}>{tooltip.name}</option>
		{/each}
	</select>
	<label for={title.toLowerCase()}>{title}:</label>
	<div
		class="input rounded-md {showOptions ? 'border-2 border-primary-500' : ''}"
		class:input-error={hasError}
		on:focus={() => (showOptions = true)}
		on:focusout={() => (showOptions = false)}
	>
		<div class="w-full items-center flex" class:input-error={hasError}>
			<input
				class="input outline-none border-none h-10"
				class:input-error={hasError}
				autocomplete="off"
				bind:value={inputValue}
				bind:this={input}
				on:focus={() => (showOptions = true)}
				{placeholder}
			/>

			<ChevronDown
				class="{hasError ? 'text-error-500' : 'text-black dark:text-white'} {showOptions
					? 'rotate-180'
					: ''}"
			/>
		</div>

		{#each tooltips as tooltip}
			{#if value.includes(tooltip.name)}
				<button
					class="chip variant-soft hover:variant-filled-surface"
					data-id={tooltip.name}
					on:focus={() => input.focus()}
					on:click={() => remove(tooltip)}
				>
					<span class:text-error-500={hasError}>{tooltip.emoji + tooltip.name}</span>
					<X class="h-4 {hasError ? 'text-error-500' : 'text-black dark:text-white'}" />
				</button>
			{/if}
		{/each}
		{#if !value.length}
			<div class="h-7" />
		{/if}

		{#if showOptions}
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<ul on:mousedown|preventDefault={handleOptionMousedown}>
				{#each tooltips as tooltip}
					<li
						class="p-2 cursor-pointer {value.includes(tooltip.name)
							? 'variant-filled-primary hover:bg-primary-400'
							: 'variant-filled-surface hover:bg-surface-400'}"
						data-value={tooltip.name}
					>
						{tooltip.emoji + tooltip.name}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	{#if errors}
		<div class="grid">
			{#each errors as err}
				<small class="text-error-500 mx-auto w-full">{err}</small>
			{/each}
		</div>
	{/if}
</div>
