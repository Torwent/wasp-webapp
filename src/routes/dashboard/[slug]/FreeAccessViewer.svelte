<script lang="ts">
	import { page } from "$app/state"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { UserRoundPlus } from "svelte-lucide"

	let {
		id,
		name,
		state = $bindable(),
		count = $bindable()
	}: {
		id: string
		name: string
		state: boolean
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
</script>

<Modal
	bind:open={state}
	triggerBase="btn preset-filled-secondary-500 font-bold"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-5/7 max-w-screen max-h-screen overflow-x-scroll"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}
		<UserRoundPlus size="16" />
		<span>{count}</span>
	{/snippet}
	{#snippet content()}
		<header class="flex flex-col justify-between">
			<h1 class="my-4 flex flex-col gap-4 text-lg lg:h4 lg:flex-row">{name} subscriptions</h1>
			<h2>Total: {count}</h2>
		</header>
		<div class="rounded-md p-1 preset-outlined-surface-500">
			<form method="POST" class="table-wrap max-h-[30rem]">
				<table class="table-compact table">
					<TableHeader {headers} />
					<tbody
						class="max-h-[30rem] overflow-scroll text-xs preset-filled-surface-100-900 md:text-sm xl:text-base hover:[&>tr]:preset-tonal"
					>
						{#await getFreeAccess(id)}
							<tr class="flex w-full">
								<td class="h-full w-full p-0 text-xs"> Loading... </td>
							</tr>
						{:then subscriptions}
							{#each subscriptions as row}
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
			class="mx-auto flex flex-col justify-around rounded-md p-8 preset-outlined-surface-500 md:flex-row"
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
				class="btn my-4 preset-filled-success-500"
				formaction="?/addFree&product={id}"
			>
				<UserRoundPlus /> Add user</button
			>
		</form>

		<footer class="flex justify-end text-xs md:text-sm lg:text-base">
			<button type="button" class="btn preset-tonal" onclick={() => (state = false)}>
				Close
			</button>
		</footer>
	{/snippet}
</Modal>
