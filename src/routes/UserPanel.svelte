<script lang="ts">
	import { Avatar, popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { randomString } from "$lib/utils"
	import { browser } from "$app/environment"
	import { page } from "$app/stores"
	import { LogOut, RotateCcw, User2 } from "lucide-svelte"
	import { enhance } from "$app/forms"

	export let large: boolean

	let { profile } = $page.data
	$: ({ profile } = $page.data)

	let src = profile
		? profile.avatar
		: "https://api.dicebear.com/6.x/bottts/svg?seed=" + randomString()

	let popupSettings: PopupSettings = {
		event: "click",
		target: "userPanelPopup",
		placement: "bottom-end"
	}

	$: if (profile) src = profile.avatar
	$: if (!profile) src = "https://api.dicebear.com/6.x/bottts/svg?seed=" + randomString()
</script>

{#if large && profile}
	<span class="hidden lg:block">{profile.username}</span>
{/if}
<button name="User panel" use:popup={popupSettings} aria-label="Open user panel">
	{#if browser || profile}
		<Avatar
			{src}
			width="w-12"
			border="border-4 border-surface-300-600-token hover:!border-primary-500"
			cursor="cursor-pointer"
			class={large ? "hidden md:block" : ""}
			initials="WS"
			loading="lazy"
		/>
	{:else}
		<div class="placeholder-circle w-12 animate-pulse" />
	{/if}
</button>
{#if !large && profile}
	<span class="mx-4">{profile.username}</span>
{/if}

<form method="POST" class="card variant-filled-surface p-4" data-popup="userPanelPopup" use:enhance>
	<div class="arrow variant-filled-surface" />
	{#if profile}
		<header class="card-header flex">
			<div class="mx-auto">
				<h3 class="hidden md:block lg:hidden my-6">{profile.username}</h3>

				<a href="/user/{profile.id}" aria-label="Open profile page">
					<button
						name="Profile"
						aria-label="Open profile page"
						class="btn variant-filled-secondary flex mx-auto"
					>
						<User2 />
						Profile
					</button>
				</a>
			</div>
		</header>

		<section class="p-4">
			<h3 class="text-center py-2">Roles</h3>
			<div class="flex pt-2 pb-8">
				<RoleBadges {profile} />
				<button
					name="Refresh"
					aria-label="Refresh roles"
					class="mx-4 text-secondary-500 hover:text-secondary-400"
					formaction="/?/refresh"
				>
					<RotateCcw />
				</button>
			</div>
		</section>
		<footer class="card-footer flex">
			<button
				name="Logout"
				aria-label="Logout"
				class="btn variant-filled-secondary mx-auto"
				formaction="/?/logout"
			>
				<LogOut />
				Logout
			</button>
		</footer>
	{:else}
		<header class="card-header">
			<h3 class="text-2x1 font-bold text-center md:text-3x1">Log In</h3>
		</header>

		<div class="p-4">
			<button
				name="Login"
				aria-label="Login to your account"
				class="btn variant-filled-secondary"
				formaction="/?/login&provider=discord"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="w-4 h-4">
					<path
						fill="currentColor"
						d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
					/>
				</svg>

				<span class="px-2">Login with Discord</span>
			</button>
		</div>
	{/if}
</form>
