<script lang="ts">
	const { data } = $props()
	const { scripter } = $derived(data)
</script>

<main class="m-4">
	{#if !scripter.stripe}
		<h1 class="my-24 text-center">
			To use this section of the dashboard you need to go through and finish the stripe on-boarding.
		</h1>
	{:else}
		<h1 class="my-24 text-center">
			By making premium scripts you automatically accept the
			<a href="/legal/scripter_tos">scripter terms or service</a>
			.
		</h1>

		{#await subscriptionsPromise}
							<TablePlaceholder
								headers={[
									"Title",
									"Price (Week/Month/Year)",
									"Subscribers",
									"Cancelling",
									"Free Access",
									"Action"
								]}
							/>
						{:then subscriptions}
							<Table
								id="scriptEdit"
								schema={scriptArraySchema}
								headers={[
									"Title",
									"Price (Week/Month/Year)",
									"Subscribers",
									"Cancelling",
									"Free Access",
									"Action"
								]}
								subscriptions={subscriptions.scripts}
								action={"scriptEdit&product"}
							/>
						{/await}

						<Table
							id="scriptAdd"
							schema={newScriptArraySchema}
							headers={["New Premium Script", "Price (Week/Month/Year)", "Action"]}
							action={"scriptAdd&script"}
						/>
					{/if}
	{/if}
</main>
