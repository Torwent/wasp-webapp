<script lang="ts">
	import Head from "$lib/components/Head.svelte"
	import CheckoutTable from "./CheckoutTable.svelte"
	import FreeAccessTable from "./FreeAccessTable.svelte"
	import SubscriptionsTable from "./SubscriptionTable.svelte"

	const { data } = $props()
	let {
		profile,
		pageData: { bundles, scripts },
		prices,
		subscriptions,
		freeAccess
	} = $derived(data)
</script>

<Head
	title="Subscriptions"
	description="Start and/or manage your WaspScripts subscriptions."
	keywords="Stats, Scores, Premium, Subscribe, Member"
/>

<main class="my-8 grid">
	{#if profile}
		{#await subscriptions then subscriptions}
			{#if subscriptions.length > 0}
				<SubscriptionsTable
					data={data.subscriptionsform}
					{bundles}
					{scripts}
					{subscriptions}
					{prices}
				/>
			{/if}
		{/await}

		{#await freeAccess then freeAccess}
			{#if freeAccess.length > 0}
				<FreeAccessTable {freeAccess} {bundles} {scripts} />
			{/if}
		{/await}

		<form method="POST" action="?/portal" class="my-8 mt-8 grid place-items-center">
			<button class="btn preset-filled-secondary-500">Customer portal</button>
		</form>
	{/if}

	<CheckoutTable data={data.checkoutForm} {bundles} {scripts} />
</main>

<!-- <h5 class="my-8 text-center">
	By making any purchase you automatically accept the
	<a href="/legal/user_tos">user terms or service</a>
	.
</h5>
<p class="mx-auto my-8 text-center">
	If you have any issues please contact <a
		href="mailto: support@waspscripts.com"
		class="font-semibold hover:underline"
	>
		support@waspscripts.com
	</a>
</p> -->
