<script>
	import { onMount } from "svelte"
	import { fly } from "svelte/transition"
	import { profile } from "$lib/stores/authStore"
	export let id = ""
	export let value = []
	export let placeholder = ""

	let input,
		inputValue,
		options = [],
		activeOption,
		showOptions = false,
		selected = {},
		first = true,
		slot
	const iconClearPath =
		"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"

	let isOfficial = $profile.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"

	if (id === "cats") {
		first = false
		if (isOfficial) {
			selected = [{ value: "Official", name: "🏷️Official" }]
			value = ["Official"]
		} else {
			selected = [
				{ value: "Community", name: "🚀Community" },
				{ value: "Free", name: "🎈Free" }
			]
			value = ["Community", "Free"]
		}
	}

	onMount(() => {
		slot.querySelectorAll("option").forEach((o) => {
			options = [...options, { value: o.value, name: o.textContent }]
		})

		value &&
			(selected = options.reduce(
				(obj, op) => (value.includes(op.value) ? { ...obj, [op.value]: op } : obj),
				{}
			))
		first = false
	})

	$: if (!first) value = Object.values(selected).map((o) => o.value)

	$: filtered = options.filter((o) =>
		inputValue ? o.name.toLowerCase().includes(inputValue.toLowerCase()) : o
	)
	$: if ((activeOption && !filtered.includes(activeOption)) || (!activeOption && inputValue))
		activeOption = filtered[0]

	const add = (token) => {
		if (
			id === "cats" &&
			((isOfficial && token.value === "Community") ||
				(!isOfficial && token.value === "Official") ||
				(!isOfficial && token.value === "Premium"))
		)
			return

		selected[token.value] = token
	}

	const remove = (value) => {
		if (
			id === "cats" &&
			((isOfficial && value === "Official") ||
				(!isOfficial && value === "Community") ||
				(!isOfficial && value === "Free"))
		)
			return

		const { [value]: val, ...rest } = selected
		selected = rest
	}

	const optionsVisibility = (show) => {
		if (typeof show === "boolean") {
			showOptions = show
			show && input.focus()
		} else {
			showOptions = !showOptions
		}
		if (!showOptions) {
			activeOption = undefined
		}
	}

	const handleKeyup = (e) => {
		if (e.keyCode === 13) {
			Object.keys(selected).includes(activeOption.value)
				? remove(activeOption.value)
				: add(activeOption)
			inputValue = ""
		}
		if ([38, 40].includes(e.keyCode)) {
			// up and down arrows
			const increment = e.keyCode === 38 ? -1 : 1
			const calcIndex = filtered.indexOf(activeOption) + increment
			activeOption =
				calcIndex < 0
					? filtered[filtered.length - 1]
					: calcIndex === filtered.length
					? filtered[0]
					: filtered[calcIndex]
		}
	}

	const handleBlur = (e) => {
		optionsVisibility(false)
	}

	const handleTokenClick = (e) => {
		if (e.target.closest(".token-remove")) {
			e.stopPropagation()
			remove(e.target.closest(".token").dataset.id)
		} else if (e.target.closest(".remove-all")) {
			if (id === "cats") {
				if (isOfficial) {
					selected = [{ value: "Official", name: "🏷️Official" }]
				} else {
					selected = [
						{ value: "Community", name: "🚀Community" },
						{ value: "Free", name: "🎈Free" }
					]
				}
			} else selected = []

			inputValue = ""
		} else {
			optionsVisibility(true)
		}
	}

	const handleOptionMousedown = (e) => {
		const value = e.target.dataset.value
		if (selected[value]) {
			remove(value)
		} else {
			add(options.filter((o) => o.value === value)[0])
			input.focus()
		}
	}
</script>

<div
	class="rounded-t-md rounded-b-md bg-white relative border-2 border-orange-200"
	class:rounded-b-none={showOptions}
	class:border-orange-600={showOptions}
>
	<div
		class="items-center flex flex-wrap relative after:block after:absolute after:bg-orange-500"
		class:showOptions
		on:click={handleTokenClick}
	>
		{#each Object.values(selected) as s}
			<div
				class="token text-black items-center border-r-2 flex m-1 max-h-6 p-1 pb-2 rounded-xl whitespace-nowrap bg-orange-200 hover:bg-orange-400"
				data-id={s.value}
			>
				<span>{s.name}</span>
				<div
					class="token-remove items-center rounded-full bg-stone-500 flex justify-center h-5 w-6 ml-0.5 hover:cursor-pointer hover:bg-stone-400"
					title="Remove {s.name}"
				>
					<svg
						class="fill-white"
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
					>
						<path d={iconClearPath} />
					</svg>
				</div>
			</div>
		{/each}
		<div class="items-center flex flex-1">
			<input
				class="rounded-md border-none text-black w-full outline-none h-8 p-2"
				{id}
				autocomplete="off"
				bind:value={inputValue}
				bind:this={input}
				on:keyup={handleKeyup}
				on:blur={handleBlur}
				{placeholder}
			/>
			<div
				class="remove-all items-center rounded-full bg-stone-500 flex justify-center h-5 w-6 ml-0.5 hover:cursor-pointer hover:bg-stone-400"
				title="Remove All"
				class:hidden={!Object.keys(selected).length}
			>
				<svg
					class="fill-white"
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
				>
					<path d={iconClearPath} />
				</svg>
			</div>
			{#if showOptions}
				<svg
					class="fill-orange-600 rotate-180"
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 18 18"><path d="M5 8l4 4 4-4z" /></svg
				>
			{:else}
				<svg
					class="fill-orange-600"
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 18 18"><path d="M5 8l4 4 4-4z" /></svg
				>
			{/if}
		</div>
	</div>

	<select bind:this={slot} type="multiple" class="hidden">
		<slot />
	</select>

	{#if showOptions}
		<ul
			class="text-black border-2 border-orange-600 shadow-md"
			transition:fly={{ duration: 200, y: 5 }}
			on:mousedown|preventDefault={handleOptionMousedown}
		>
			{#each filtered as option}
				<li
					class="p-2 cursor-pointer hover:bg-stone-200"
					class:bg-orange-500={selected[option.value]}
					class:hover:bg-orange-300={selected[option.value]}
					data-value={option.value}
				>
					{option.name}
				</li>
			{/each}
		</ul>
	{/if}
</div>
