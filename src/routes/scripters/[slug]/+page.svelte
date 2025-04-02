<script lang="ts">
	import Head from "$lib/components/Head.svelte"
	import { Github } from "svelte-lucide"
	import PayPal from "./PayPal.svelte"
	import { page } from "$app/state"
	import { Tabs } from "@skeletonlabs/skeleton-svelte"
	import { replaceQuery } from "$lib/client/utils"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"

	const { data } = $props()
	const { scripter, count, scripts } = $derived(data)

	let { amount } = $state(data)

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = $state(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)
	)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())

	let tab = $state("info")
</script>

<Head
	title={scripter.profiles.username}
	description={scripter.profiles.username +
		(scripter.description ? ", " + scripter.description : "")}
	keywords={"Scripter, Scripters, Developer, Developers, " +
		scripter.profiles.username +
		(scripter.realname ? ", " + scripter.realname : "")}
	author={scripter.profiles.username}
	img={scripter.profiles.avatar}
/>

<main class="my-16">
	<div class="my-16 flex justify-around text-center">
		<div class="my-auto flex">
			<header>
				<h3 class="text-2xl font-bold">
					{#if scripter.realname && scripter.realname != ""}
						{scripter.realname} /
					{/if}
					{scripter.profiles.username}
				</h3>
			</header>
		</div>
		{#if scripter.github || (scripter.paypal_id && scripter.paypal_id != "")}
			<div class="my-auto flex">
				{#if scripter.github}
					<a
						href={scripter.github}
						class="btn preset-filled-surface-300-700 hover:text-secondary-500 mx-5 h-full"
					>
						<Github />
					</a>
				{/if}
				{#if scripter.paypal_id && scripter.paypal_id != ""}
					<div class="mx-auto w-full">
						<PayPal id={scripter.paypal_id} username={scripter.profiles.username} />
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<Tabs value={tab} onValueChange={(e) => (tab = e.value)} listJustify="justify-center">
		{#snippet list()}
			<Tabs.Control value="info">Information</Tabs.Control>
			<Tabs.Control value="scripts">Scripts</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="info">
				<h4 class="my-24 text-center">
					{scripter.description ?? "This scripter did not add a description."}
				</h4>
				<article class="prose dark:prose-invert mx-auto my-24">
					{#if scripter.content}
						{@html scripter.content}
					{:else}
						This scripter did not add information about him.
					{/if}
				</article>

				<div class="mx-auto flex justify-around">
					<a href="./" class="btn preset-filled-secondary-500">Back</a>

					<a href={page.url.pathname + "/edit"} class="btn preset-filled-primary-500">Edit</a>
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="scripts">
				<input
					type="text"
					placeholder="🔍Search script by id, name, categories, author, content, ..."
					class="input mx-auto my-8 max-w-3xl"
					bind:value={search}
					oninput={() =>
						replaceQuery(page.url, {
							page: "1",
							search: search
						})}
				/>

				<main class="my-4 flex h-fit flex-col">
					<div
						class="3xl:grid-cols-5 mx-8 my-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
					>
						{#each scripts as script (script.id)}
							<ScriptCard {script} link={"/scripts/" + script.url} />
						{/each}
					</div>
					<div class="mx-8">
						<Paginator data={scripts} {currentPage} bind:pageSize={amount} {count} />
					</div>
				</main>
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</main>
