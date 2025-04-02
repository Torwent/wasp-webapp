<script lang="ts">
	import { browser } from "$app/environment"
	import { invalidate } from "$app/navigation"
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from "$env/static/public"
	import { countryCodeSchema, dbaSchema } from "$lib/client/schemas"
	import { onMount } from "svelte"
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"

	const { data } = $props()
	const { scripter, stripeAccount, stripeBalance, stripeSession } = $derived(data)

	const {
		form: countryForm,
		errors: countryErrors,
		enhance: countryEnhance,
		allErrors: countryAllErrors
	} = superForm(data.countryForm, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(countryCodeSchema),
		resetForm: true
	})

	const {
		form: dbaForm,
		errors: dbaErrors,
		enhance: dbaEnhance
	} = superForm(data.dbaForm, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(dbaSchema),
		resetForm: true
	})

	onMount(async () => {
		if (browser && document) {
			const connectJS = await import("@stripe/connect-js")

			async function fetchClientSecret() {
				invalidate("dashboard:stripe_session")
				return (await stripeSession) ?? ""
			}

			const stripeConnectInstance = connectJS.loadConnectAndInitialize({
				publishableKey: PUBLIC_STRIPE_PUBLISHABLE_KEY,
				fetchClientSecret
			})

			if (stripeConnectInstance) {
				let paymentContainer = document.getElementById("paymentContainer")
				if (paymentContainer) paymentContainer.appendChild(stripeConnectInstance.create("payments"))
				let payoutContainer = document.getElementById("payoutContainer")
				if (payoutContainer) payoutContainer.appendChild(stripeConnectInstance.create("payouts"))
			}
		}
	})
</script>

<main class="m-4 min-h-96">
	{#if !scripter.stripe}
		<form
			method="POST"
			action="?/createStripe"
			class="my-32 grid place-items-center"
			use:countryEnhance
		>
			<h3>Stripe Account</h3>

			<div class="my-4">
				<label for="code">Choose a country (this cannot be changed later):</label>
				<select class="select my-2" name="code" id="code" bind:value={$countryForm.code}>
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
					class="bg-surface-700 text-error-500 max-h-24 overflow-x-hidden overflow-y-scroll rounded-md"
				>
					{$countryErrors.code}
				</div>
			{/if}
			{#if $countryAllErrors}
				<div
					class="bg-surface-700 text-error-500 max-h-24 overflow-x-hidden overflow-y-scroll rounded-md"
				>
					{#each $countryAllErrors as err, i (err.path)}
						{#if i === 0}
							Errors:
						{/if}
						<small class="text-error-500 mx-8 flex rounded-md">
							Error path: {err.path}
							{#each err.messages as message (message)}
								{message}
							{/each}
						</small>
					{/each}
				</div>
			{/if}
			<button disabled={$countryForm.code === ""} class="btn preset-filled-secondary-500">
				Create stripe connected account
			</button>
		</form>
	{:else}
		<div class="flex justify-around">
			<form
				method="POST"
				action="?/displayName"
				class="my-32 flex place-items-center"
				use:dbaEnhance
			>
				<div class="my-4">
					<label for="dba">Invoice display name:</label>
					<input class="input my-2" name="dba" id="dba" bind:value={$dbaForm.dba} />
					{#if $dbaErrors.dba}
						<div
							class="bg-surface-700 text-error-500 max-h-24 overflow-x-hidden overflow-y-scroll rounded-md"
						>
							{#each $dbaErrors.dba as err (err)}
								{err}
							{/each}
						</div>
					{/if}
				</div>
				<button class="btn preset-filled-secondary-500 mx-4 mt-6 h-10">Update</button>
			</form>

			<form method="POST" action="?/updateStripe" class="my-32 block place-items-center">
				<div class="my-4 grid">
					<span>Account information</span>
					<button class="btn preset-filled-secondary-500 my-2 h-10">
						Update stripe connected account
					</button>
				</div>
			</form>
		</div>

		{#if stripeBalance}
			{@const available = stripeBalance?.available[0].amount ?? 0}
			{@const pending = stripeBalance?.pending[0].amount ?? 0}
			{@const currency = stripeBalance?.available[0].currency ?? ""}
			<div class="my-8 flex justify-around">
				<h4>
					Balance: {(available + pending) / 100}
					{currency}
				</h4>
				<h4>Available: {available / 100} {currency}</h4>
				<h4>Settling: {pending / 100} {currency}</h4>
			</div>
		{/if}

		{#if stripeAccount}
			{#if stripeAccount.requirements?.currently_due && stripeAccount.requirements?.currently_due.length > 0}
				<div class="mb-24 flex flex-col">
					<span class="text-error-500 my-2">Missing account information:</span>

					<div class="bg-surface-700 text-error-500 my-2 grid">
						{#each stripeAccount.requirements?.currently_due as requirement (requirement)}
							<small class="mx-auto w-full">{requirement}</small>
						{/each}
					</div>
					<small>
						This can be updated on the "Update stripe connected account" button. Ask Torwent for
						help if needed.
					</small>
					<small class="text-error-500">
						Not having this complete may result in you not getting paid.
					</small>
				</div>
			{/if}
		{/if}

		<h5 class="mt-12 mb-4 text-center">Payments</h5>
		<div id="paymentContainer" class="my-8"></div>
		<h5 class="my-4 text-center">Payouts</h5>
		<div id="payoutContainer" class="my-8"></div>
	{/if}
</main>
