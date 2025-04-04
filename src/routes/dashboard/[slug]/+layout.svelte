<script lang="ts">
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import Head from "$lib/components/Head.svelte"
	import { Tabs } from "@skeletonlabs/skeleton-svelte"
	import { FileCode, Landmark, Package, Settings } from "svelte-lucide"
	const { data, children } = $props()

	const profile = $derived(data.profile!)
	let tab = $derived(page.url.pathname.split("/").pop())
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
			<small>{profile.id}</small>
		</h3>
	{/if}

	<h3 class="my-4 text-center">
		Viewing user: {data.scripter.profiles.username}
		<small>{data.scripter.id}</small>
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
		onValueChange={(e) => goto(e.value)}
		listJustify="justify-center flex flex-col sm:flex-row"
	>
		{#snippet list()}
			<Tabs.Control value="general">
				{#snippet lead()}<Settings />{/snippet} General
			</Tabs.Control>
			<Tabs.Control value="stripe">{#snippet lead()}<Landmark />{/snippet} Stripe</Tabs.Control>
			<Tabs.Control value="bundles">{#snippet lead()}<Package />{/snippet} Bundles</Tabs.Control>
			<Tabs.Control value="scripts">{#snippet lead()}<FileCode />{/snippet} Scripts</Tabs.Control>
		{/snippet}
		{#snippet content()}
			{@render children()}
		{/snippet}
	</Tabs>
</main>
