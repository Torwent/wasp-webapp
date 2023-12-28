<script lang="ts">
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"

	import { onMount } from "svelte"
	import { invalidate } from "$app/navigation"
	import {
		bundleArraySchema,
		countryCodeSchema,
		newBundleSchema,
		newScriptArraySchema,
		scriptArraySchema
	} from "$lib/backend/schemas"
	import Table from "./Table.svelte"
	import { superForm } from "sveltekit-superforms/client"

	export let data
	let { supabaseClient, profile, scripter, stats } = data

	const { form, errors, enhance, allErrors } = superForm(data.countryForm, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: countryCodeSchema
	})

	onMount(() => {
		const subscription = supabaseClient
			.channel("products-subscription-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "scripts",
					table: "prices",
					filter: "active=eq.true"
				},
				() => invalidate("dashboard")
			)
			.subscribe()

		return () => subscription.unsubscribe()
	})
</script>

<main class="m-4">
	<h3 class="text-center">
		Current user: {profile.username}
		<small>({profile.id})</small>
	</h3>

	<div class="my-8 grid place-items-center">
		<a href="/scripters/{scripter.url}" class="btn variant-filled-secondary">Scripter profile</a>
	</div>

	<form method="POST" class="my-32 grid place-items-center" action="?/linkStripe" use:enhance>
		<h3>Stripe Account</h3>
		{#if !scripter.stripe}
			<div class="my-4">
				<label for="code">Choose a country (this cannot be changed later):</label>
				<select class="select" name="code" id="code" bind:value={$form.code}>
					<option value="AU">Australia (AU)</option>
					<option value="AT">Austria (AT)</option>
					<option value="BE">Belgium (BE)</option>
					<option value="BG">Bulgaria (BG)</option>
					<option value="CA">Canada (CA)</option>
					<option value="HR">Croatia (HR)</option>
					<option value="CY">Cyprus (CY)</option>
					<option value="CZ">Czech Republic (CZ)</option>
					<option value="DK">Denmark (DK)</option>
					<option value="EE">Estonia (EE)</option>
					<option value="FI">Finland (FI)</option>
					<option value="FR">France (FR)</option>
					<option value="DE">Germany (DE)</option>
					<option value="GI">Gibraltar (GI)</option>
					<option value="GR">Greece (GR)</option>
					<option value="HK">Hong Kong (HK)</option>
					<option value="HU">Hungary (HU)</option>
					<option value="IE">Ireland (IE)</option>
					<option value="IT">Italy (IT)</option>
					<option value="JP">Japan (JP)</option>
					<option value="LV">Latvia (LV)</option>
					<option value="LI">Liechtenstein (LI)</option>
					<option value="LT">Lithuania (LT)</option>
					<option value="LU">Luxembourg (LU)</option>
					<option value="MT">Malta (MT)</option>
					<option value="MX">Mexico (MX)</option>
					<option value="NL">Netherlands (NL)</option>
					<option value="NZ">New Zealand (NZ)</option>
					<option value="NO">Norway (NO)</option>
					<option value="PL">Poland (PL)</option>
					<option value="PT">Portugal (PT)</option>
					<option value="RO">Romania (RO)</option>
					<option value="SG">Singapore (SG)</option>
					<option value="SK">Slovakia (SK)</option>
					<option value="SI">Slovenia (SI)</option>
					<option value="ES">Spain (ES)</option>
					<option value="SE">Sweden (SE)</option>
					<option value="CH">Switzerland (CH)</option>
					<option value="TH">Thailand (TH)</option>
					<option value="AE">United Arab Emirates (AE)</option>
					<option value="GB">United Kingdom (GB)</option>
					<option value="US">United States (US)</option>
				</select>
			</div>
			{#if $errors && $errors.code}
				<div
					class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
				>
					{$errors.code}
				</div>
			{/if}
			{#if $allErrors}
				<div
					class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
				>
					{#each $allErrors as error, i}
						{#if i === 0}
							Errors:
						{/if}
						<small class="mx-8 text-error-500 flex rounded-md">
							Error path: {error.path}
							{#each error.messages as messages}
								{messages}
							{/each}
						</small>
					{/each}
				</div>
			{/if}
			<button disabled={$form.code === ""} class="btn variant-filled-secondary">
				Create stripe connected account
			</button>
		{:else}
			<button class="btn variant-filled-secondary">Update stripe connected account</button>
		{/if}
	</form>

	<h3 class="justify-center text-center my-12">General stats</h3>

	<div class="table-container max-w-7xl mx-auto my-8">
		<table class="table table-hover border-separate space-y-6 text-sm">
			<TableHeader
				headers={[
					"Scripts",
					"Premium scripts",
					"Monthly downloads",
					"Premium monthly downloads",
					"Weekly subscribers",
					"Monthly subscribers",
					"Yearly subscribers"
				]}
			/>
			<tr class="table-row">
				<TableCell>{stats.total_user_scripts} / {stats.total_scripts}</TableCell>
				<TableCell>{stats.total_user_premium_scripts} / {stats.total_premium_scripts}</TableCell>
				<TableCell>{stats.month_user_downloads} / {stats.month_downloads}</TableCell>
				<TableCell>
					{stats.month_premium_user_downloads} / {stats.month_premium_downloads}
				</TableCell>
				<TableCell>0</TableCell>
				<TableCell>0</TableCell>
				<TableCell>0</TableCell>
			</tr>
			<tbody />
		</table>
	</div>

	<h5 class="my-24 text-center">
		By making premium scripts you automatically accept the
		<a href="/legal/scripter_terms_of_service">scripter terms or service</a>
		.
	</h5>

	{#if scripter.stripe}
		<h3 class="justify-center text-center my-12">Bundles</h3>

		<Table
			id="bundleEdit"
			schema={bundleArraySchema}
			data={data.bundlesForm}
			headers={[
				"Title",
				"Price (Week/Month/Year)",
				"Subscribers (Week/Month/Year)",
				"Scripts",
				"Action"
			]}
			subscriptions={[0, 5, 10]}
			action={"bundleEdit&product"}
		/>

		<Table
			id="bundleAdd"
			schema={newBundleSchema}
			data={data.newBundleForm}
			headers={["New Bundle", "Price (Week/Month/Year)", "Scripts", "Action"]}
			action={"bundleAdd"}
		/>

		<h3 class="justify-center text-center mt-32 my-12">Premium scripts</h3>

		<Table
			id="scriptEdit"
			schema={scriptArraySchema}
			data={data.scriptsForm}
			headers={["Title", "Price (Week/Month/Year)", "Subscribers (Week/Month/Year)", "Action"]}
			subscriptions={[0, 5, 10]}
			action={"scriptEdit&product"}
		/>

		<Table
			id="scriptAdd"
			schema={newScriptArraySchema}
			data={data.newScriptForm}
			headers={["New Premium Script", "Price (Week/Month/Year)", "Action"]}
			action={"scriptAdd&script"}
		/>
	{/if}
</main>
