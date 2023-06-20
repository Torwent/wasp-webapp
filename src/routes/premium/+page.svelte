<script lang="ts">
	import { fade } from "svelte/transition"
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton"
	import { canDownload } from "$lib/backend/data"
	import { page } from "$app/stores"

	export let data

	$: ({ profile } = data)

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

<main
	class="container mx-auto my-6 max-w-5xl flex-grow text-center"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	{#if profile && canDownload(profile)}
		<header class="py-8">
			<h2 class="my-4">Thank you for having joined WaspScripts!</h2>
			<h3>
				You already have the
				{#if profile.profiles_protected.administrator}
					<span class="text-orange-500">Administrator</span>
				{:else if profile.profiles_protected.moderator}
					<span class="text-purple-500">Moderator</span>
				{:else if profile.profiles_protected.scripter}
					<span class="text-teal-500">Scripter</span>
				{:else if profile.profiles_protected.tester}
					<span class="text-green-500">Tester</span>
				{:else if profile.profiles_protected.vip}
					<span class="text-red-500">VIP</span>
				{:else if profile.profiles_protected.premium}
					<span class="text-orange-500">Premium</span>
				{/if}
				Role.
				{#if !profile.profiles_protected.vip || profile.profiles_protected.premium}
					You already have access to every script and you don't need to buy
					<span class="text-orange-500 dark:text-orange-400">Premium</span>
					<br />
					But of course, I appreciate it if you do!
				{/if}
			</h3>
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
</main>
