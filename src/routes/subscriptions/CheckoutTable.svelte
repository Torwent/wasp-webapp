<script lang="ts">
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms"
	import { checkoutSchema } from "$lib/client/schemas"
	import type { BundleProduct, Price, ScriptProduct } from "$lib/types/collection"
	import { getCurrentPrice, getPriceIntervalEx, setPriceInterval } from "$lib/utils"
	import ExternalLink from "svelte-lucide/ExternalLink.svelte"
	import ScriptLinks from "./ScriptLinks.svelte"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { goto } from "$app/navigation"

	let {
		data,
		bundles,
		scripts
	}: {
		data: SuperValidated<Infer<typeof checkoutSchema>>
		bundles: BundleProduct[]
		scripts: ScriptProduct[]
	} = $props()

	let { form, errors, enhance } = superForm(data, {
		id: "checkout",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: null,
		validators: zodClient(checkoutSchema)
	})

	function changePriceInterval(prices: Price[], index: number, productIndex: number) {
		setPriceInterval(index, prices)
		$form.products[productIndex].prices = prices
	}

	let search = $state("")
	let type = $state("all")
	let author = $state("all")
	let code = $state("")
	let bundleArray: BundleProduct[] = $state(bundles)
	let scriptArray: ScriptProduct[] = $state(scripts)

	async function getAuthors() {
		const ids: string[] = []
		const usernames: Promise<string | null>[] = []

		bundles.forEach((b) => {
			if (!ids.includes(b.user_id)) {
				ids.push(b.user_id)
				usernames.push(b.username)
			}
		})

		scripts.forEach((s) => {
			if (!ids.includes(s.user_id)) {
				ids.push(s.user_id)
				usernames.push(s.username)
			}
		})

		return await Promise.all(usernames)
	}

	const authorsPromise = getAuthors()

	async function filter() {
		switch (type) {
			case "all":
				bundleArray = bundles
				scriptArray = scripts
				break

			case "bundles":
				bundleArray = bundles
				scriptArray = []
				break

			case "scripts":
				bundleArray = []
				scriptArray = scripts
				break
		}

		if (author === "all") return

		for (let i = bundleArray.length - 1; i >= 0; i--) {
			const username = await bundleArray[i].username
			if (author !== username) bundleArray.splice(i, 1)
		}

		for (let i = scriptArray.length - 1; i >= 0; i--) {
			const username = await scriptArray[i].username
			if (author !== username) scriptArray.splice(i, 1)
		}
	}

	async function searchFilter() {
		await filter()
		if (search === "") return
		const tmp = search.trim().toLowerCase()

		for (let i = bundleArray.length - 1; i >= 0; i--) {
			if (bundleArray[i].id.toLowerCase().includes(tmp)) continue
			if (bundleArray[i].name.toLowerCase().includes(tmp)) continue

			const username = await bundleArray[i].username
			if (username?.toLowerCase().includes(tmp)) continue

			bundleArray.splice(i, 1)
		}

		for (let i = scriptArray.length - 1; i >= 0; i--) {
			if (scriptArray[i].id.toLowerCase().includes(tmp)) continue
			if (scriptArray[i].name.trim().toLowerCase().includes(tmp)) continue
			const username = await scriptArray[i].username
			if (username?.trim().toLowerCase().includes(tmp)) continue

			scriptArray.splice(i, 1)
		}
	}
</script>

<div class="mx-auto my-8 w-screen max-w-fit">
	<div class="mx-auto my-8">
		<h3 class="my-12 justify-center text-center">New subscriptions</h3>

		<label class="label w-full">
			<span class="label-text">Search:</span>
			<input
				type="text"
				placeholder="🔍Search products by id, name or author"
				class="input"
				bind:value={search}
				oninput={searchFilter}
			/>
		</label>

		<div class="mx-auto my-2 flex flex-col justify-center gap-4 md:flex-row">

			<label class="label">
				<span class="label-text">Type:</span>
				<select
					class="select"
					bind:value={type}
					onchange={() => {
						search = ""
						filter()
					}}
				>
					<option value="all">All</option>
					<option value="bundles">Bundles</option>
					<option value="scripts">Scripts</option>
				</select>
			</label>
			<label class="label">
				<span class="label-text">Author:</span>
				<select
					class="select"
					bind:value={author}
					onchange={() => {
						search = ""
						filter()
					}}
				>
					<option value="all">All</option>
					{#await authorsPromise}
						<option value="all">Loading...</option>
						<option value="all">Loading...</option>
						<option value="all">Loading...</option>
					{:then authors}
						{#each authors as a}
							{#if a}
								<option value={a}>{a}</option>
							{/if}
						{/each}
					{/await}
				</select>
			</label>
		</div>

		<label class="label">
			<span class="label-text">Discount code:</span>
			<input type="text" placeholder="Discount code" class="input" bind:value={code} />
		</label>
	</div>
	<!-- class="xl:mx-w-7xl table-wrap mx-auto w-full max-w-md rounded-md preset-outlined-surface-500 md:max-w-3xl lg:max-w-6xl" -->
	<form method="POST" class="overflow-x-auto rounded-md preset-outlined-surface-500 max-w-fit mx-auto" use:enhance>
		<table class="table table-auto border-separate space-y-6 text-xs md:text-sm">
			<colgroup>
				<col class="w-2/6 xl:w-5/12" />
				<col class="w-1/5" />
				<col class="w-1/5" />
				<col class="w-3/12 sm:w-4/12 md:w-3/12 lg:w-5/12" />
				<col class="w-1/5" />
			</colgroup>
			<TableHeader headers={["Product", "Type", "Price", "Interval", "Checkout"]} />
			<tbody class="preset-filled-surface-200-800 hover:[&>tr]:preset-tonal">
				{#each bundleArray, i}
					{#if bundleArray[i].active}
						<tr class="table-row">
							<TableCell alignment="left" padding={0}>
								<div class="mx-3">
									<div>{bundleArray[i].name}</div>
									<div class="text-left text-xs">
										{#await bundleArray[i].username}
											by Loading...
										{:then username}
											by {username}
										{/await}
									</div>
								</div>
							</TableCell>

							<TableCell padding={0}>
								<ScriptLinks bind:bundle={bundleArray[i]} />
							</TableCell>

							<TableCell>
								{#if bundleArray[i].active}
									{getCurrentPrice(bundleArray[i].prices)}
								{:else}
									-
								{/if}
							</TableCell>

							<TableCell padding={bundleArray[i].active ? 0 : 3}>
								<div class="btn-group flex flex-col preset-outlined-surface-500 lg:flex-row">
									{#each bundleArray[i].prices, j}
										<button
											class="btn"
											class:preset-outlined-primary-500={bundleArray[i].prices[j].active}
											onclick={(e) => {
												e.preventDefault()
												changePriceInterval(bundleArray[i].prices, j, bundleArray[i].index)
											}}
										>
											{getPriceIntervalEx(bundleArray[i].prices[j])}
										</button>
									{/each}
								</div>
							</TableCell>

							<TableCell padding={0}>
								<button
									class="btn preset-filled-secondary-500"
									formaction="?/checkout&product={bundleArray[i].id}&code={code}"
								>
									Checkout
								</button>
							</TableCell>
						</tr>
					{/if}
				{/each}

				{#each scriptArray, i}
					{#if scriptArray[i].active}
						<tr>
							<TableCell alignment="left" padding={0}>
								<div class="mx-3">
									<div class="">{scriptArray[i].name}</div>
									<div class="text-xs">
										{#await scriptArray[i].username}
											by Loading...
										{:then username}
											by {username}
										{/await}
									</div>
								</div>
							</TableCell>

							<TableCell padding={0}>
								<button
									class="btn hover:cursor-pointer hover:text-primary-500"
									onclick={() => goto("/scripts/" + scriptArray[i].url)}
								>
									<ExternalLink size="16" />
									<span>Script</span>
								</button>
							</TableCell>

							<TableCell>{getCurrentPrice(scriptArray[i].prices)}</TableCell>

							<TableCell padding={scriptArray[i].active ? 0 : 3}>
								{#if scriptArray[i].active}
									<div class="btn-group flex flex-col preset-outlined-surface-500 lg:flex-row">
										{#each scriptArray[i].prices, j}
											<button
												class="btn"
												class:preset-outlined-primary-500={scriptArray[i].prices[j].active}
												onclick={(e) => {
													e.preventDefault()
													changePriceInterval(scriptArray[i].prices, j, scriptArray[i].index)
												}}
											>
												{getPriceIntervalEx(scriptArray[i].prices[j])}
											</button>
										{/each}
									</div>
								{:else}
									Unavailable
								{/if}
							</TableCell>

							<TableCell padding={0}>
								<button
									class="btn preset-filled-secondary-500"
									formaction="?/checkout&product={scriptArray[i].id}&code={code}"
								>
									Checkout
								</button>
							</TableCell>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</form>

	<div class="mx-auto max-w-7xl">
		{#if $errors._errors}
			<div class="mx-auto my-8 w-full text-center">
				{#each $errors._errors as err}
					<span class="text-error-500">{err}</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
