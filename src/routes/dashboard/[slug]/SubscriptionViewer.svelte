<script lang="ts">
	import { page } from "$app/state"
	import TableHeader from "$lib/components/TableHeader.svelte"
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { UserCheck } from "svelte-lucide"

	let {
		id,
		name,
		count
	}: {
		id: string
		name: string
		count: number
	} = $props()

	async function getSubscriptions(id: string) {
		const { data: subData, error: subError } = await page.data.supabaseClient
			.schema("profiles")
			.from("subscription")
			.select("id, subscription, price, date_start, date_end, cancel, disabled, profiles(username)")
			.eq("product", id)

		if (subError) {
			console.error(subError)
			return []
		}

		const { data: priceData, error: priceError } = await page.data.supabaseClient
			.schema("scripts")
			.from("prices")
			.select("id, amount, interval")
			.eq("product", id)

		if (priceError) {
			console.error(priceError)
			return []
		}

		return subData.map((sub) => {
			const i = priceData.findIndex((price) => price.id === sub.price)
			return {
				id: sub.id,
				subscription: sub.subscription,
				username: sub.profiles?.username ?? "Null",
				date_start: sub.date_start,
				date_end: sub.date_end,
				price: priceData[i].amount,
				interval:
					priceData[i].interval.charAt(0).toUpperCase() + priceData[i].interval.slice(1) + "ly",
				state: sub.cancel ? (sub.disabled ? 2 : 1) : 0
			}
		})
	}

	const headers = [
		"WaspScripts ID",
		"Username",
		"Start Date",
		"End Date",
		"Price",
		"Interval",
		"State",
		"Action"
	]

	let userLocale = navigator.language ?? "pt-PT"
	let open = $state(false)
	let allOpen = $state(false)
</script>

<Modal
	{open}
	onOpenChange={(e) => (open = e.open)}
	triggerBase="btn preset-filled-secondary-500 font-bold"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[95%] max-w-fit max-h-[95%] overflow-y-auto"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}
		<UserCheck size="16" />
		<span>{count}</span>
	{/snippet}
	{#snippet content()}
		<header class="flex flex-col justify-between">
			<h1 class="lg:h4 my-4 flex flex-col gap-4 text-lg lg:flex-row">{name} subscriptions</h1>
			<h2>Total: {count}</h2>
		</header>
		<form method="POST" class="table-wrap max-h-[28rem]">
			<table class="table">
				<TableHeader {headers} />
				<tbody class="[&>tr]:hover:preset-tonal text-xs md:text-sm xl:text-base">
					{#await getSubscriptions(id)}
						<tr class="flex w-full">
							<td class="h-full w-full p-0 text-xs"> Loading... </td>
						</tr>
					{:then subscriptions}
						{#each subscriptions as row (row.subscription)}
							<tr>
								<td>{row.id}</td>
								<td class="text-center">{row.username}</td>

								<td class="text-center">{new Date(row.date_start).toLocaleString(userLocale)}</td>
								<td class="text-center">{new Date(row.date_end).toLocaleString(userLocale)}</td>
								<td class="text-center">{Number(row.price / 100).toLocaleString(userLocale)} €</td>

								<td class="text-center">{row.interval}</td>

								<td class="text-center">
									{#if row.state === 0}
										<span class="text-success-500">Active</span>
									{:else if row.state === 1}
										<span class="text-error-500">Canceling</span>
									{:else}
										<span class="text-warning-500">Author canceling</span>
									{/if}
								</td>

								<td class="text-center">
									<button
										type="submit"
										class="btn preset-outlined-error-500"
										formaction="?/cancelSub&subscription={row.subscription}"
										class:disabled={row.state === 2}
										disabled={row.state === 2}
									>
										Cancel
									</button>
								</td>
							</tr>
						{/each}
					{/await}
				</tbody>
			</table>
		</form>
		<footer class="flex flex-col justify-between gap-2 text-xs md:flex-row md:text-sm lg:text-base">
			<form method="POST" class="flex">
				<button
					type="button"
					class="btn preset-outlined-warning-500"
					class:hidden={allOpen}
					onclick={() => (allOpen = true)}
				>
					CANCEL ALL SUBSCRIPTIONS
				</button>
				<div class:hidden={!allOpen}>
					<h1 class="h2">ARE YOU SURE?</h1>
					<p>This cannot be undone!</p>
					<button type="button" class="btn preset-tonal" onclick={() => (allOpen = false)}>
						Go Back
					</button>
					<button
						type="submit"
						class="btn preset-filled-error-500 hover:text-error-500"
						formaction="?/cancelAllSubs&product={id}"
					>
						I AM SURE!
					</button>
				</div>
			</form>

			<div class="my-auto">
				<button type="button" class="btn preset-tonal m-auto" onclick={() => (open = false)}>
					Close
				</button>
			</div>
		</footer>
	{/snippet}
</Modal>
