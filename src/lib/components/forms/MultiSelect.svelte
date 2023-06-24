<!-- Based on https://svelte.dev/repl/c7094fb1004b440482d2a88f4d1d7ef5?version=3.14.0 -->
<script lang="ts">
	import { page } from "$app/stores"
	import type { Category, SubCategory } from "$lib/types/collection"
	import { ChevronDown, X } from "lucide-svelte"
	import { fly } from "svelte/transition"
	export let title: string
	export let value: string[]
	export let error: Record<number, string[]> | undefined
	export let placeholder = ""
	export let entries: Category[] | SubCategory[]

	function checkErrors(err: Record<number, string[]> | undefined) {
		if (!err) return false

		for (const e of Object.entries(err)) {
			if (e[1] != null) return true
		}
		return false
	}

	let input: HTMLInputElement
	let hasError: boolean = false
	let showOptions: boolean = false

	let inputValue: string = ""

	function add(category: Category) {
		if (!value.includes(category.name)) value = [...value, category.name]
	}

	function remove(category: Category) {
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
		add(entries.filter((e) => e.name === val)[0])
	}

	entries.forEach((e) => {
		if (value.length < 2 && (e.name === "Community" || e.name === "Free")) add(e)
	})

	const hadPremium = value.includes("Premium")
	$: hasError = checkErrors(error)

	$: ({ profile } = $page.data)

	$: if (!profile || !profile.profiles_protected.administrator) {
		if (value.includes("Official") || (value.includes("Premium") && !hadPremium)) {
			for (let i = 0; i < value.length; i++) {
				if (value[i] === "Official" || (value[i] === "Premium" && !hadPremium)) {
					value.splice(i, 1)
					i--
				}
			}
		}
		value = hadPremium ? ["Community", "Premium", ...value] : ["Community", "Free", ...value]
	}
</script>

<div class="mb-8">
	<select id={title.toLowerCase()} name={title.toLowerCase()} multiple class="hidden" bind:value>
		{#each entries as entry}
			<option value={entry.name}>{entry.name}</option>
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

		{#each entries as entry}
			{#if value.includes(entry.name)}
				<button
					class="chip variant-soft hover:variant-filled-surface"
					data-id={entry.name}
					on:focus={() => input.focus()}
					on:click={() => remove(entry)}
				>
					<span class:text-error-500={hasError}>{entry.emoji + entry.name}</span>
					<X class="h-4 {hasError ? 'text-error-500' : 'text-black dark:text-white'}" />
				</button>
			{/if}
		{/each}
		{#if !value.length}
			<div class="h-7" />
		{/if}

		{#if showOptions}
			<ul
				transition:fly={{ duration: 200, y: 5 }}
				on:mousedown|preventDefault={handleOptionMousedown}
			>
				{#each entries as entry}
					<li
						class="p-2 cursor-pointer {value.includes(entry.name)
							? 'variant-filled-primary hover:bg-primary-400'
							: 'variant-filled-surface hover:bg-surface-400'}"
						data-value={entry.name}
					>
						{entry.emoji + entry.name}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="grid">
		{#if error}
			{#each Object.entries(error) as err, idx}
				{#if err[1]}
					<small class="text-error-500 mx-auto w-full">{err[1]}</small>
				{/if}
			{/each}
		{/if}
	</div>
</div>
