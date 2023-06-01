<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte"
	import { fade } from "svelte/transition"
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton"

	export let data

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
</script>

<svelte:head>
	<MetaTags
		title="Premium"
		description="Get WaspScripts premium role and gain access to exclusive scripts. With premium you have scripts for nearly all skills in OSRS."
	/>
</svelte:head>

<div
	class="container mx-auto my-6 max-w-5xl flex-grow text-center"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	{#if data.profile && (data.profile.profiles_protected.vip || data.profile.profiles_protected.premium || data.profile.profiles_protected.tester)}
		<header class="py-8">
			<h2>
				Thank you for having joined
				{#if data.profile.profiles_protected.vip}
					<span class="text-red-600 dark:text-red-500">VIP</span>
				{:else if data.profile.profiles_protected.premium}
					<span class="text-orange-500 dark:text-orange-400">Premium</span>
				{:else if data.profile.profiles_protected.tester}
					<span class="text-green-500 dark:text-green-400">Tester</span>
					you already have access to every script and you don't need to buy
					<span class="text-orange-500 dark:text-orange-400">Premium</span>
					.
					<br />
					But of course, I appreciate it if you do!
				{/if}
			</h2>
		</header>
	{/if}
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
		<a href="mailto: torwent@waspscripts.com" class="font-semibold hover:underline">
			torwent@waspscripts.com
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

	<h4 class="py-8">
		Please read the
		<button
			class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
			on:click={handleClick}
		>
			terms and condictions
		</button>
		before making any purchase.
	</h4>
</div>
