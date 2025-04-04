<script lang="ts">
	import { page } from "$app/state"
	import TableHeader from "$lib/components/TableHeader.svelte"
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { UserRoundPlus } from "svelte-lucide"

	let {
		id,
		name,
		count
	}: {
		id: string
		name: string
		count: number
	} = $props()

	async function getFreeAccess(id: string) {
		const { data, error } = await page.data.supabaseClient
			.schema("profiles")
			.from("free_access")
			.select("id, date_start, date_end, profiles(username)")
			.eq("product", id)

		if (error) {
			console.error(error)
			return []
		}

		return data.map((access) => {
			return {
				id: access.id,
				date_start: access.date_start,
				date_end: access.date_end,
				username: access.profiles?.username ?? "Null"
			}
		})
	}

	const headers = ["WaspScripts ID", "Username", "Start Date", "End Date", "Action"]

	let userLocale = navigator.language ?? "pt-PT"
	let open = $state(false)
</script>

<Modal
	{open}
	onOpenChange={(e) => (open = e.open)}
	triggerBase="btn preset-filled-secondary-500 font-bold"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[95%] max-w-fit max-h-[95%] overflow-y-auto"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}
		<UserRoundPlus size="16" />
		<span>{count}</span>
	{/snippet}
	{#snippet content()}
		<header class="flex flex-col justify-between">
			<h1 class="lg:h4 my-4 flex flex-col gap-4 text-lg lg:flex-row">{name} subscriptions</h1>
			<h2>Total: {count}</h2>
		</header>
		<div class="preset-outlined-surface-500 rounded-md p-1">
			<form method="POST" class="table-wrap max-h-[28rem]">
				<table class="table">
					<TableHeader {headers} />
					<tbody class="[&>tr]:hover:preset-tonal text-xs md:text-sm xl:text-base">
						{#await getFreeAccess(id)}
							<tr class="flex w-full">
								<td class="h-full w-full p-0 text-xs"> Loading... </td>
							</tr>
						{:then freeAccess}
							{#each freeAccess as row (row.id)}
								<tr>
									<td>{row.id}</td>
									<td class="text-center">{row.username}</td>

									<td class="text-center">{new Date(row.date_start).toLocaleString(userLocale)}</td>
									<td class="text-center">{new Date(row.date_end).toLocaleString(userLocale)}</td>

									<td class="text-center">
										<button
											type="submit"
											class="btn preset-outlined-error-500"
											formaction="?/cancelFree&product={id}&id={row.id}"
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
		</div>
		<form
			method="POST"
			class="preset-outlined-surface-500 mx-auto flex flex-col justify-around rounded-md p-8 md:flex-row"
		>
			<label>
				<span class="label-text">Add user:</span>
				<input name="userid" type="text" placeholder="User UUID" class="input" />
			</label>

			<label>
				<span class="label-text">End date:</span>
				<input name="enddate" type="date" class="input" />
			</label>

			<button
				type="submit"
				class="btn preset-filled-success-500 my-4"
				formaction="?/addFree&product={id}"
			>
				<UserRoundPlus /> Add user</button
			>
		</form>

		<footer class="flex justify-end text-xs md:text-sm lg:text-base">
			<button type="button" class="btn preset-tonal" onclick={() => (open = false)}> Close </button>
		</footer>
	{/snippet}
</Modal>
