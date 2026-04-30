<script lang="ts">
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import Head from "$lib/components/Head.svelte"
	import UUID from "$lib/components/UUID.svelte"
	import { Tabs } from "@skeletonlabs/skeleton-svelte"
	import { CreditCard, FileCode, HandCoins, Landmark, Package, Settings } from "svelte-lucide"
	const { data, children } = $props()

	const profile = $derived(data.profile!)
	let tab = $derived(page.url.pathname.split("/")[3])
</script>

<Head
	title="Dashboard"
	description="Scripter dashboard"
	keywords="Dashboard, Scripter, Developer"
/>

<main class="">
	{#if profile.id != data.scripter.id}
		<h3 class="text-primary-500 my-4 text-center font-bold">
			Current user: {profile.username}
			<UUID uuid={profile.id}></UUID>
		</h3>
	{/if}

	<h3 class="my-4 text-center">
		Viewing user: {data.scripter.profiles.username}
		<small>
			<UUID uuid={data.scripter.id}></UUID>
		</small>
	</h3>

	<div class="my-8 grid place-items-center">
		<a
			href="/scripters/{data.scripter ? data.scripter.url : ''}"
			class="btn preset-filled-primary-500"
		>
			Scripter profile
		</a>
	</div>

	<Tabs
		value={tab}
		onValueChange={async (e) => {
			const pathParts = page.url.pathname.split("/")
			const { slug } = page.params
			const len = pathParts.indexOf(slug)
			let url = "/"
			for (let i = 1; i < len; i++) {
				url += pathParts[i] + "/"
			}
			url += slug + "/" + e.value
			await goto(url)
		}}
		listJustify="justify-center flex flex-col sm:flex-row"
	>
		{#snippet list()}
			<Tabs.Control value="general">
				{#snippet lead()}<Settings />{/snippet} General
			</Tabs.Control>
			<Tabs.Control value="stripe">{#snippet lead()}<Landmark />{/snippet} Stripe</Tabs.Control>
			<Tabs.Control value="payouts">
				{#snippet lead()}<HandCoins />{/snippet} Payouts
			</Tabs.Control>
			<Tabs.Control value="transactions">
				{#snippet lead()}<CreditCard />{/snippet} Transactions
			</Tabs.Control>
			<Tabs.Control value="bundles">{#snippet lead()}<Package />{/snippet} Bundles</Tabs.Control>
			<Tabs.Control value="scripts">{#snippet lead()}<FileCode />{/snippet} Scripts</Tabs.Control>
		{/snippet}
		{#snippet content()}
			{@render children()}
		{/snippet}
	</Tabs>
</main>
