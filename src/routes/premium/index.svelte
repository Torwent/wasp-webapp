<script>
	import { fade } from "svelte/transition"
	import { user, profile } from "$lib/stores/authStore"

	let show = false
</script>

<div
	class="container mx-auto my-6 max-w-5xl flex-grow text-center"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	{#if $profile.vip || $profile.premium}
		<header class="py-8">
			<h2>
				Thank you for having joined
				{#if $profile.vip}
					<span class="text-red-600 dark:text-red-500">VIP</span>
				{:else}
					<span class="text-orange-500 dark:text-orange-400">Premium</span>
				{/if}
				!
			</h2>
		</header>
	{/if}
	<p class="py-4">
		The shop is handled by <a
			href="https://upgrade.chat/waspscripts"
			class="font-semibold text-amber-500 dark:text-amber-200 hover:underline">upgrade.chat</a
		> for now.
	</p>

	<button
		class="w-32 shadow-sm rounded bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300 text-white py-2 px-4 my-4"
	>
		<a href="https://upgrade.chat/waspscripts"> Upgrade.Chat </a>
	</button>

	<p class="py-4">
		If you need to manage your subscription you can do so by visiting your upgrade.chat profile:
	</p>

	<button
		class="w-32 shadow-sm rounded bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300 text-white py-2 px-4 my-4"
	>
		<a href="https://upgrade.chat/profile"> Profile </a>
	</button>

	<p class="py-4">
		If you are having issues with your roles not appearing, go to that last page and click to
		"reprocess". If after that they are still missing, you can contact me at <a
			href="mailto: torwent@waspscripts.com"
			class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
			>torwent@waspscripts.com</a
		>
		or better yet, via
		<a
			href="https://discord.gg/YMYUahmww9"
			class="font-semibold text-amber-500 dark:text-amber-200 hover:underline">discord</a
		>.
	</p>

	<h4 class="py-8">
		Please read the
		<span
			class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
			on:click={() => (show = true)}
		>
			terms and condictions
		</span> before making any purchase.
	</h4>

	{#if show}
		<div
			class="fixed inset-0 bg-stone-900 bg-opacity-50 overflow-y-auto h-full w-full backdrop-blur transition-colors"
			in:fade={{ duration: 300, delay: 300 }}
			out:fade={{ duration: 300 }}
			on:click={() => (show = false)}
		>
			<div class="m-auto my-36 p-12 max-w-4xl rounded-md shadow-md bg-stone-100 dark:bg-stone-800">
				<h4 class="py-4 text-amber-500 dark:text-amber-200">Terms and Conditions:</h4>
				<p class="py-4">
					Not all scripts are guaranteed to be working all the time. They can be broken at times and
					take some time to be fixed. So you shouldn't buy or subscribe to Premium for one specific
					script.
				</p>
				<p class="py-4">
					<span class="font-bold text-red-600 dark:text-red-500">VIP</span> is not sold directly. You
					earn it after being subscribed for at least 3 months or buying a subscription longer than that
					or permanent.
				</p>
				<p class="py-4">
					As this is a digital product, all sales are final and refunds are not accepted except in
					rare occasions that I deem appropriate.
				</p>
				<p class="py-4">
					Permanent purchage is not literally permanent, it's for how long WaspScripts is doing
					business. The same applies to temporary subscriptions which might end earlier than they
					would be expected to in case WaspScripts shuts down.
				</p>
				<p class="py-4">
					In case of an early termination, subscriptions will be reimbursed a percentage of the
					price you paid depending on how long you had left and as long as it surpasses 1 month
					left.
				</p>
				<p class="py-4">
					For permanent purchase, you will be reimbursed the same way assuming it was a subscription
					of 1 year and a half.
				</p>
				<p class="py-4">
					This means that if you had your permanent premium for 1 year and 8 months and it gets
					terminated you will not get any refund.
				</p>
			</div>
		</div>
	{/if}
</div>
