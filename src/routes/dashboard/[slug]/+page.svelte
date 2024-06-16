<script lang="ts">
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import { onDestroy, onMount } from "svelte"
	import { invalidate } from "$app/navigation"
	import {
		bundleArraySchema,
		countryCodeSchema,
		dbaSchema,
		newBundleSchema,
		newScriptArraySchema,
		scriptArraySchema
	} from "$lib/client/schemas"
	import Table from "./Table.svelte"
	import { superForm } from "sveltekit-superforms/client"
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from "$env/static/public"
	import { browser } from "$app/environment"
	import type { RealtimeChannel } from "@supabase/supabase-js"
	import { Tab, TabGroup } from "@skeletonlabs/skeleton"
	import { FileCode, Landmark, Package } from "lucide-svelte"
	import type { StripeConnectInstance } from "@stripe/connect-js"
	import { zodClient } from "sveltekit-superforms/adapters"
	import TablePlaceholder from "./TablePlaceholder.svelte"

	export let data

	let {
		supabaseClient,
		profile,
		scripterPromise,
		statsPromise,
		subscriptionsPromise,
		stripeData,
		forms: { country, dba }
	} = data
	$: ({
		supabaseClient,
		profile,
		scripterPromise,
		statsPromise,
		subscriptionsPromise,
		stripeData,
		forms: { country, dba }
	} = data)

	let scripter: Awaited<typeof scripterPromise> | null = null
	$: scripterPromise.then((awaited) => (scripter = awaited))

	$: stripeData.account?.then((acc) => ($dbaForm.dba = acc?.business_profile?.name ?? ""))

	const {
		form: countryForm,
		errors: countryErrors,
		enhance: countryEnhance,
		allErrors: countryAllErrors
	} = superForm(country, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(countryCodeSchema),
		resetForm: true
	})

	const {
		form: dbaForm,
		errors: dbaErrors,
		enhance: dbaEnhance,
		allErrors: dbaAllErrors
	} = superForm(dba, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(dbaSchema),
		resetForm: true
	})

	let tabSet: number = 0
	let subscription: RealtimeChannel | undefined
	let paymentContainer: HTMLElement | undefined
	let payoutContainer: HTMLElement | undefined

	let stripeConnectInstance: StripeConnectInstance | undefined

	$: if (paymentContainer && stripeConnectInstance)
		paymentContainer.appendChild(stripeConnectInstance.create("payments"))
	$: if (payoutContainer && stripeConnectInstance)
		payoutContainer.appendChild(stripeConnectInstance.create("payouts"))

	onMount(async () => {
		if (browser && document) {
			const connectJS = await import("@stripe/connect-js")

			async function fetchClientSecret() {
				invalidate("dashboard:stripe_session")
				if (!stripeData.session) return ""
				const stripeSession = await stripeData.session
				return stripeSession ?? ""
			}

			stripeConnectInstance = connectJS.loadConnectAndInitialize({
				publishableKey: PUBLIC_STRIPE_PUBLISHABLE_KEY,
				fetchClientSecret: fetchClientSecret
			})
		}

		subscription = supabaseClient
			.channel("products-subscription-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "scripts",
					table: "prices",
					filter: "active=eq.true"
				},
				() => invalidate("waspscripts:dashboard")
			)
			.subscribe()
	})

	onDestroy(async () => {
		if (subscription) await subscription.unsubscribe()
	})
</script>

<main class="m-4">
	<h3 class="text-center">
		Current user: {profile ? profile.username : "Loading..."}
		<small>({profile ? profile.id : "Loading..."})</small>
	</h3>

	<div class="my-8 grid place-items-center">
		<a href="/scripters/{scripter ? scripter.url : ''}" class="btn variant-filled-secondary">
			{scripter ? "Scripter profile" : "Loading..."}</a
		>
	</div>
	{#if !scripter?.stripe}
		<form
			method="POST"
			action="?/createStripe"
			class="my-32 grid place-items-center"
			use:countryEnhance
		>
			<h3>Stripe Account</h3>

			<div class="my-4">
				<label for="code">Choose a country (this cannot be changed later):</label>
				<select class="select" name="code" id="code" bind:value={$countryForm.code}>
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
			{#if $countryErrors && $countryErrors.code}
				<div
					class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
				>
					{$countryErrors.code}
				</div>
			{/if}
			{#if $countryAllErrors}
				<div
					class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
				>
					{#each $countryAllErrors as error, i}
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
			<button disabled={$countryForm.code === ""} class="btn variant-filled-secondary">
				Create stripe connected account
			</button>
		</form>
	{/if}

	<h3 class="justify-center text-center my-12">General stats</h3>

	<div class="table-container max-w-7xl mx-auto my-8">
		<table class="table table-hover border-separate space-y-6 text-sm">
			<TableHeader
				headers={[
					"Scripts",
					"Premium scripts",
					"Monthly downloads",
					"Premium monthly downloads",
					"Subscribers",
					"Cancelling",
					"Free access"
				]}
			/>
			<tr class="table-row">
				{#await statsPromise}
					{#each Array(4) as _}
						<TableCell>Loading...</TableCell>
					{/each}
				{:then stats}
					<TableCell>{stats.total_user_scripts} / {stats.total_scripts}</TableCell>
					<TableCell>{stats.total_user_premium_scripts} / {stats.total_premium_scripts}</TableCell>
					<TableCell>{stats.month_user_downloads} / {stats.month_downloads}</TableCell>
					<TableCell>
						{stats.month_premium_user_downloads} / {stats.month_premium_downloads}
					</TableCell>
				{/await}

				{#await subscriptionsPromise}
					{#each Array(3) as _}
						<TableCell>Loading...</TableCell>
					{/each}
				{:then subscriptions}
					<TableCell>{subscriptions.total.subscribers}</TableCell>
					<TableCell>{subscriptions.total.cancelling}</TableCell>
					<TableCell>{subscriptions.total.free_access}</TableCell>
				{/await}
			</tr>
			<tbody />
		</table>
	</div>

	<h5 class="my-24 text-center">
		By making premium scripts you automatically accept the
		<a href="/legal/scripter_tos">scripter terms or service</a>
		.
	</h5>

	{#if scripter?.stripe}
		<div class="border-surface-500 border-2 rounded-md">
			<TabGroup
				justify="justify-center"
				regionList="max-w-7xl mx-auto my-8"
				regionPanel="max-w-7xl mx-auto my-8"
				border="border-0"
				active="border-b-2 border-primary-500 text-primary-500"
			>
				<Tab bind:group={tabSet} name="tab1" value={0}>
					<div class="flex justify-end"><Landmark />Stripe</div>
				</Tab>
				<Tab bind:group={tabSet} name="tab2" value={1}>
					<div class="flex justify-end"><Package /> Bundles</div>
				</Tab>
				<Tab bind:group={tabSet} name="tab3" value={2}>
					<div class="flex justify-end"><FileCode /> Scripts</div>
				</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					{#if tabSet === 0}
						<div class="flex justify-around">
							<form
								method="POST"
								action="?/displayName"
								class="my-32 place-items-center flex"
								use:dbaEnhance
							>
								<div class="my-4">
									<label for="dba">Invoice display name:</label>
									<input class="input" name="dba" id="dba" bind:value={$dbaForm.dba} />
									{#if $dbaErrors && $dbaErrors.dba}
										<div
											class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
										>
											{$dbaErrors.dba}
										</div>
									{/if}
									{#if $dbaAllErrors}
										<div
											class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
										>
											{#each $dbaAllErrors as error, i}
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
								</div>
								<button class="btn variant-filled-secondary mt-6 mx-4 h-10">Update</button>
							</form>

							<form method="POST" action="?/updateStripe" class="my-32 block place-items-center">
								<div class="my-4 grid">
									<span>Account information</span>
									<button class="btn variant-filled-secondary h-10 mt-0">
										Update stripe connected account
									</button>
								</div>
							</form>
						</div>

						{#if stripeData.balance}
							<div class="flex justify-around my-8">
								{#await stripeData.balance}
									<h4>Balance: Loading...</h4>
									<h4>Available: Loading...</h4>
									<h4>Settling: Loading...</h4>
								{:then balance}
									{@const available = balance?.available[0].amount ?? 0}
									{@const pending = balance?.pending[0].amount ?? 0}
									{@const currency = balance?.available[0].currency ?? ""}
									<h4>
										Balance: {(available + pending) / 100}
										{currency}
									</h4>
									<h4>Available: {available / 100} {currency}</h4>
									<h4>Settling: {pending / 100} {currency}</h4>
								{/await}
							</div>
						{/if}

						{#if stripeData.account}
							<div class="mb-24">
								<span class="my-2">Missing account information:</span>

								{#await stripeData.account then account}
									{#if account?.requirements?.currently_due && account?.requirements?.currently_due.length > 0}
										<div class="my-2 text-error-500 grid bg-surface-700">
											{#each account?.requirements?.currently_due as requirement}
												<small class="w-full mx-auto">{requirement}</small>
											{/each}
										</div>
									{/if}
								{/await}
								<small>
									This can be updated on the "Update stripe connected account" button. Ask Torwent
									for help if needed.
								</small>
							</div>
						{/if}

						<h5 class="text-center mt-12 mb-4">Payments</h5>
						<div class="my-8" bind:this={paymentContainer} />
						<h5 class="text-center my-4">Payouts</h5>
						<div class="my-8" bind:this={payoutContainer} />
					{:else if tabSet === 1}
						{#await subscriptionsPromise}
							<TablePlaceholder
								headers={[
									"Title",
									"Price (Week/Month/Year)",
									"Subscribers",
									"Cancelling",
									"Free Access",
									"Scripts",
									"Action"
								]}
							/>
						{:then subscriptions}
							<Table
								id="bundleEdit"
								schema={bundleArraySchema}
								headers={[
									"Title",
									"Price (Week/Month/Year)",
									"Subscribers",
									"Cancelling",
									"Free Access",
									"Scripts",
									"Action"
								]}
								subscriptions={subscriptions.bundles}
								action={"bundleEdit&product"}
							/>
						{/await}

						<Table
							id="bundleAdd"
							schema={newBundleSchema}
							headers={["New Bundle", "Price (Week/Month/Year)", "Scripts", "Action"]}
							action={"bundleAdd"}
						/>
					{:else if tabSet === 2}
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
				</svelte:fragment>
			</TabGroup>
		</div>
	{/if}
</main>
