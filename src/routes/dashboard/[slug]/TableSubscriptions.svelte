<script lang="ts">
	import { page } from "$app/stores"
	import type { TBundleArraySchema, TScriptArraySchema } from "$lib/backend/schemas"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton"

	export let products: TScriptArraySchema["scripts"] | TBundleArraySchema["bundles"]
	export let index: number

	let warn: ModalSettings = {
		type: "confirm",
		// Data
		title: "Are you sure?",
		buttonTextConfirm: "Cancel Subscription",
		buttonTextCancel: "Return",
		modalClasses: "!bg-error-500"
	}

	async function getSubscriptions(id: string) {
		const { data: subData, error: subError } = await $page.data.supabaseClient
			.schema("profiles")
			.from("subscription")
			.select("id, subscription, price, date_start, date_end, cancel, disabled, profiles(username)")
			.eq("product", id)

		if (subError) {
			console.error(subError)
			return []
		}

		const { data: priceData, error: priceError } = await $page.data.supabaseClient
			.schema("scripts")
			.from("prices")
			.select("id, amount, interval")
			.eq("product", id)

		if (priceError) {
			console.error(priceError)
			return []
		}

		return subData.map((sub) => {
			const i = priceData.findIndex((price) => price.id, sub.price)
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

	let subsPromise = getSubscriptions(products[index].id)

	async function cancelSub(sub: string, r: boolean) {
		if (!r) return
		const response = await fetch($page.url + "?/cancelSub&subscription=" + sub, {
			body: new FormData(),
			method: "POST"
		})

		if (response.status === 200) await toggleSubs()
	}

	async function triggerModal(sub: string) {
		warn.body =
			`<p class="my-4">This is permanent and can't be undone.</p>` +
			`<p>This will set this subscription to cancel and disable the user from reenabling it.</p>` +
			`<p>This will cancel the subscription with the id: <b>` +
			sub +
			`</b></p>`
		warn.response = async (r: boolean) => await cancelSub(sub, r)
		modalStore.trigger(warn)
	}

	async function toggleSubs() {
		products[index].subsOpen = !products[index].subsOpen
		if (products[index].subsOpen) {
			subsPromise = getSubscriptions(products[index].id)

			for (let i = 0; i < products.length; i++) {
				products[i].freeOpen = false
				if (i !== index) products[i].subsOpen = false
			}
		}
	}

	async function cancelAll(r: boolean) {
		if (!r) return
		const response = await fetch($page.url + "?/cancelAllSubs&product=" + products[index].id, {
			body: new FormData(),
			method: "POST"
		})

		if (response.status === 200) await toggleSubs()
	}

	const warnAll: ModalSettings = {
		type: "confirm",
		title: "Are you sure?",
		buttonTextConfirm: "CANCEL ALL SUBSCRIPTIONS",
		buttonTextCancel: "Return",
		modalClasses: "!bg-error-500",
		body: `<p class="my-4">This is permanent and can't be undone.</p>
		<p class="my-4">This will <b>CANCEL ALL SUBSCRIPTIONS</b> for the product: <b>${products[index].id}</b></p>
		<p class="my-4">This is also a slow proccess and may take a few minutes to show the changes, don't spam it.</p>
		`,
		response: async (r: boolean) => await cancelAll(r)
	}

	async function triggerAllModal() {
		modalStore.trigger(warnAll)
	}

	let userLocale = "pt-PT"
</script>

<table class="table table-compact">
	<thead class="font-bold text-lg variant-outline-surface rounded-t-md">
		<tr>
			<th><span class="flex justify-center text-center">WaspScripts ID</span></th>
			<th><span class="flex justify-center text-center">Username</span></th>
			<th><span class="flex justify-center text-center">Start Date</span></th>
			<th><span class="flex justify-center text-center">End Date</span></th>
			<th><span class="flex justify-center text-center">Price</span></th>
			<th><span class="flex justify-center text-center">Interval</span></th>
			<th><span class="flex justify-center text-center">State</span></th>
			<th><span class="flex justify-center text-center">Action</span></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td colspan="8">
				<span class="flex justify-center text-center py-0">
					<button
						type="submit"
						class="btn variant-outline-error hover:text-error-500"
						on:click|preventDefault={async () => await triggerAllModal()}
					>
						CANCEL All SUBSCRIPTIONS
					</button>
				</span>
			</td>
		</tr>
		{#await subsPromise then subscriptionRows}
			{#each subscriptionRows as row}
				<tr>
					<TableCell>{row.id}</TableCell>
					<TableCell>{row.username}</TableCell>

					<TableCell>{new Date(row.date_start).toLocaleString(userLocale)}</TableCell>
					<TableCell>{new Date(row.date_end).toLocaleString(userLocale)}</TableCell>
					<TableCell>{Number(row.price / 100).toLocaleString(userLocale)} €</TableCell>

					<TableCell>{row.interval}</TableCell>

					{#if row.state === 0}
						<TableCell><span class="text-lime-500">Active</span></TableCell>
					{:else if row.state === 1}
						<TableCell><span class="text-error-500">Canceling</span></TableCell>
					{:else}
						<TableCell>
							<span class="text-warning-500">Author canceling</span>
						</TableCell>
					{/if}

					<TableCell padding={0}>
						<button
							type="button"
							class="btn variant-outline-error"
							on:click|preventDefault={async () => await triggerModal(row.subscription)}
						>
							Cancel
						</button>
					</TableCell>
				</tr>
			{/each}
		{/await}
	</tbody>
</table>
