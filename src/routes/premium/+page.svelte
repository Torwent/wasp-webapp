<script lang="ts">
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import { superForm } from "sveltekit-superforms/client"
	import { premiumSchema } from "$lib/backend/schemas.js"
	export let data

	let { profile, prices, subscription, scripts } = data
	$: ({ profile, prices, subscription, scripts } = data)

	function getDays(start_date: number) {
		let future = new Date(start_date)
		future.setMonth(future.getMonth() + 3)
		let now = Date.now()
		return Math.ceil((future.getTime() - now) / (1000 * 3600 * 24))
	}

	const { form, errors, enhance } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: null,
		validators: premiumSchema
	})

	const plans = prices
	type Plan = (typeof plans)[number]

	let plan: Plan = plans[0]

	$: $form.plan = plan.id
	$: if ($form.code === "") $form.code = undefined

	const confirm: ModalSettings = {
		type: "alert",
		// Data
		title: "Terms and Conditions:",
		buttonTextCancel: "Confirm",
		body: `
		<p class="py-2">
			Not all scripts are guaranteed to be working all the time. They can be broken at times and
			take some time to be fixed. So you shouldn't buy or subscribe to Premium for one specific
			script.
		</p>
		<p class="py-2">
			<span class="font-bold text-red-600 dark:text-red-500">VIP</span> is not sold directly.
			You earn it after being subscribed for at least 3 months or buying a subscription longer than that
			or permanent.
		</p>
		<p class="py-2">
			As this is a digital product, all sales are final and refunds are not accepted except in rare
			occasions that I deem appropriate.
		</p>
		<p class="py-2">
			Permanent purchage is not literally permanent, it's for how long WaspScripts is doing
			business. The same applies to temporary subscriptions which might end earlier than they would
			be expected to in case WaspScripts shuts down.
		</p>
		<p class="py-2">
			In case of an early termination, subscriptions will be reimbursed a percentage of the price
			you paid depending on how long you had left and as long as it surpasses 1 month left.
		</p>
		<p class="py-2">
			For permanent purchase, you will be reimbursed the same way assuming it was a subscription of
			1 year and a half.
		</p>
		<p class="py-2">
			This means that if you had your permanent premium for 1 year and 8 months and it gets
			terminated you will not get any refund.
		</p>`
	}

	function handleClick() {
		modalStore.trigger(confirm)
	}

	const headTitle = "Premium - WaspScripts"
	const headDescription =
		"Get WaspScripts premium role and gain access to exclusive scripts. With premium you have scripts for nearly all skills in OSRS."
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Colour, Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main class="flex">
	{#if profile?.profiles_protected.premium && profile?.profiles_protected.subscription_external}
		<div class="my-8 mx-auto text-center">
			<p class="py-4">
				The shop is handled by <a href="https://upgrade.chat/waspscripts">upgrade.chat</a>
				for now.
			</p>

			<a href="https://upgrade.chat/waspscripts">
				<button class="btn variant-filled-secondary">Upgrade.Chat</button>
			</a>

			<p class="py-4">
				If you need to manage your subscription you can do so by visiting your upgrade.chat profile:
			</p>

			<a href="https://upgrade.chat/profile">
				<button class="btn variant-filled-secondary">Profile</button>
			</a>

			<p class="py-4">
				If you are having issues with your roles not appearing:
				<br />
				Go to that last page and click to "reprocess".
				<br />
				Hover your profile on the top right corner and make sure the roles are not there.
				<br />
				<br />
				If after that they are still missing, you can contact me at
				<a href="mailto: support@waspscripts.com" class="font-semibold hover:underline">
					support@waspscripts.com
				</a>
				or better yet, via
				<a
					href="https://discord.gg/YMYUahmww9"
					class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
				>
					discord
				</a>
				.
			</p>
		</div>
	{:else if !subscription}
		<form
			method="POST"
			class="md:flex w-4/5 variant-ghost-surface mx-auto my-24 rounded-md"
			action="?/checkout"
			use:enhance
		>
			<div
				class="grid h-fit w-2/3 mx-auto content-between border-b-2 md:border-r-2 border-surface-500"
			>
				<div class="grid m-8 text-center">
					<h4 class="mt-4">Choose a pricing plan:</h4>
					<div class="my-4 btn-group-vertical md:btn-group variant-ghost justify-evenly">
						{#each plans as p}
							{#if p.recurring}
								{@const price = p.recurring.interval}
								<button
									class="w-full"
									class:variant-glass-primary={plan === p}
									on:click|preventDefault={() => (plan = p)}
								>
									{price.slice(0)[0].toUpperCase() + price.slice(1) + "ly"}
								</button>
							{/if}
						{/each}
					</div>
					<div>
						<h5>Access to {scripts} premium scripts regularly updated and maintained.</h5>
						<p class="my-4">
							Get <span class="font-bold text-yellow-500">Premium*</span>
							{#if plan.recurring?.interval === "week"}
								role instantly and
								<span class="font-bold text-red-500">VIP**</span>
								role after 12 consecutive weeks subscribed.
							{:else if plan.recurring?.interval === "month"}
								role instantly and
								<span class="font-bold text-red-500">VIP**</span>
								role after 3 consecutive months subscribed.
							{:else if plan.recurring?.interval === "year"}
								and
								<span class="font-bold text-red-500">VIP**</span>
								role instantly.
							{/if}
						</p>
						<p class="text-xs">
							Canceling the subscription will remove both roles when the next payment is due.
						</p>
					</div>
				</div>

				<p class="text-xs text-left items-end m-4">
					<span class="font-bold text-yellow-500">*Premium</span>
					gives you access to all
					<a href="/scripts?categories=Premium">premium scripts</a>
					.
					<br />
					<span class="font-bold text-red-500">**VIP</span>
					if mostly cosmetic but gives you early access to scripts under development posted on Discord.
				</p>
			</div>
			<div class="grid mx-auto w-2/3 md:w-1/3 content-between">
				<div class="grid m-8 text-center h-full content-center">
					{#if plan.recurring}
						<header class="card-header">
							<h3>
								{plan.recurring.interval.slice(0)[0].toUpperCase() +
									plan.recurring.interval.slice(1) +
									"ly"} plan
							</h3>
						</header>

						{#if plan.unit_amount}
							<section class="p-4">
								{new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
									plan.unit_amount / 100
								)} per {plan.recurring.interval}
							</section>
						{/if}
					{/if}
					<input
						type="text"
						placeholder="Discount code"
						class="input"
						class:input-error={$errors.code}
						bind:value={$form.code}
					/>
					{#if $errors.code}
						{#each $errors.code as err}
							<small class="text-error-500">{err}</small>
						{/each}
					{:else}
						<div class="m-0 h-5" />
					{/if}
				</div>

				<button
					class="m-4 btn variant-filled-secondary flex"
					name="Checkout"
					aria-label="Go to checkout"
				>
					Checkout
				</button>
			</div>
		</form>
	{:else}
		<form
			method="POST"
			class="md:flex w-4/5 variant-ghost-surface mx-auto my-24 rounded-md"
			use:enhance
		>
			<div class="grid h-full w-2/3 mx-auto content-between md:border-r-2 border-surface-500">
				<div class="grid m-8 text-center">
					<h4 class="my-4">Subscription information</h4>

					<div class="w-full flex content-end">
						<div class="mx-auto">
							Start date: {new Date(subscription.start_date * 1000).toLocaleString("pt-PT")}
						</div>
						<div class="mx-auto">
							Period end: {new Date(subscription.current_period_end * 1000).toLocaleString("pt-PT")}
						</div>
					</div>
					<div class="w-full flex content-end">
						<div class="mx-auto">
							<span class="font-bold text-yellow-500">*Premium</span>
							active
						</div>
						<div class="mx-auto">
							{#if profile && profile.profiles_protected.vip}
								<span class="font-bold text-red-500">**VIP</span>
								active
							{:else}
								{getDays(subscription.start_date * 1000)} days left for
								<span class="font-bold text-red-500">**VIP</span>
							{/if}
						</div>
					</div>
					{#if subscription.cancel_at_period_end}
						<span class="my-8 text-error-500">Will be canceled at period end</span>
					{:else}
						<div class="h-6 w-full my-8" />
					{/if}
				</div>

				<p class="text-xs text-left items-end m-4">
					<span class="font-bold text-yellow-500">*Premium</span>
					gives you access to all
					<a href="/scripts?categories=Premium">premium scripts</a>
					.
					<br />
					<span class="font-bold text-red-500">**VIP</span>
					if mostly cosmetic but gives you early access to scripts under development posted on Discord.
				</p>
			</div>
			<div class="grid mx-auto w-2/3 md:w-1/3 content-between">
				<div class="grid m-8 text-center h-full content-center">
					{#if plan.recurring}
						{@const currentPlan = subscription.items.data[0].plan}
						{@const price =
							currentPlan.interval.slice(0)[0].toUpperCase() + currentPlan.interval.slice(1) + "ly"}
						<header class="card-header">
							<h3>{price} plan</h3>
						</header>

						{#if currentPlan.amount}
							<section class="p-4">
								{new Intl.NumberFormat("pt-PT", {
									style: "currency",
									currency: currentPlan.currency
								}).format(currentPlan.amount / 100)} per {currentPlan.interval}
							</section>
						{/if}
					{/if}

					{#if $errors.code}
						{#each $errors.code as err}
							<small class="text-error-500">{err}</small>
						{/each}
					{:else}
						<div class="m-0 h-5" />
					{/if}
				</div>

				{#if subscription.cancel_at_period_end}
					<button
						class="m-4 btn variant-filled-success flex"
						name="Re-enable"
						aria-label="Re-enable subscription"
						formaction="?/reenable"
					>
						Re-enable
					</button>
				{:else}
					<button
						class="m-4 btn variant-filled-error flex"
						name="Cancel"
						aria-label="Cancel subscription"
						formaction="?/cancel"
					>
						Cancel
					</button>
				{/if}
			</div>
		</form>
	{/if}
</main>

<h5 class="my-8 text-center">
	Please read the
	<button
		class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
		on:click={handleClick}
	>
		terms and condictions
	</button>
	before making any purchase.
</h5>
<p class="my-8 mx-auto text-center">
	If you have any issues please contact <a
		href="mailto: support@waspscripts.com"
		class="font-semibold hover:underline"
	>
		support@waspscripts.com
	</a>
</p>
