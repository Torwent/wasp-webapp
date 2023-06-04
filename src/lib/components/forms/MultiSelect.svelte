<!-- Based on https://svelte.dev/repl/c7094fb1004b440482d2a88f4d1d7ef5?version=3.14.0 -->
<script lang="ts">
	import { page } from "$app/stores"
	import type { Category } from "$lib/backend/types"
	import { fly } from "svelte/transition"
	export let title: string
	export let value: string[]
	export let error: Record<number, string[]> | undefined
	export let placeholder = ""
	export let entries: Category[]

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

	function clear() {
		value = []
		inputValue = ""
		input.focus()
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

	$: hasError = checkErrors(error)

	$: ({ profile } = $page.data)
	$: if (!profile || !profile.profiles_protected.administrator) {
		if (value.includes("Official") || value.includes("Premium")) {
			for (let i = 0; i < value.length; i++) {
				if (value[i] === "Official" || value[i] === "Premium") {
					value.splice(i, 1)
					i--
				}
			}
		}
		value = ["Community", "Free", ...value]
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

			<svg
				class="fill-white hover:cursor-pointer"
				class:fill-error-500={hasError}
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				class:hidden={!value.length}
				on:keypress={() => clear()}
				on:click={() => clear()}
				on:focus={() => input.focus()}
			>
				<path
					d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
				/>
			</svg>

			<svg
				class="fill-primary-500"
				class:rotate-180={showOptions}
				class:fill-black={hasError}
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 18 18"
				on:focus={() => input.focus()}
			>
				<path d="M5 8l4 4 4-4z" />
			</svg>
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
					<svg
						class={hasError ? "fill-error-500" : "fill-white"}
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
					>
						<path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
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
