<script lang="ts">
	import { enhance } from "$app/forms"
	import { page } from "$app/state"
	import { Avatar } from "@skeletonlabs/skeleton-svelte"
	import Menu from "svelte-lucide/Menu.svelte"
	import X from "svelte-lucide/X.svelte"
	import LogOut from "svelte-lucide/LogOut.svelte"
	import UserRound from "svelte-lucide/UserRound.svelte"
	import Logo from "./Logo.svelte"
	import Lightswitch from "./Lightswitch.svelte"
	import ThemeSwitcher from "./ThemeSwitcher.svelte"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import Discord from "./Discord.svelte"
	import GitHub from "./GitHub.svelte"

	let showMenu = $state(false)
	let showProfile = $state(false)

	const { profile, roles } = $derived(page.data)

	const routes = [
		"Home",
		"Setup",
		"Scripts",
		"Stats",
		"Subscriptions",
		"FAQ",
		"Tutorials",
		"Dashboard"
	] as const

	function setCurrentPage(currentPath: string) {
		const path = currentPath.split("/")[1]
		if (path.length === 0) return "Home"
		for (const route of routes) {
			if (route.toLowerCase().replace("home", "") === path) return route
		}
		return "Home"
	}

	let currentPage: (typeof routes)[number] = $derived(setCurrentPage(page.url.pathname))

	function getLink(route: string): string {
		return "/" + route.toLowerCase().replace("home", "")
	}

	function randomString() {
		return (Math.random() + 1).toString(36).substring(7)
	}

	const src = $derived(
		profile ? profile.avatar : "https://api.dicebear.com/6.x/bottts/svg?seed=" + randomString()
	)

	const avatarName = $derived(profile?.username ?? "Avatar")
</script>

<nav class="col-span-12 row-span-1 w-full flex-col text-sm xl:text-base">
	<div
		class="bg-surface-200/30 dark:bg-surface-800/30 flex h-full justify-between font-semibold backdrop-blur-md"
	>
		<button
			name="Menu"
			aria-label="Open the navigation menu"
			class="justify-left text-primary-500 my-auto flex h-full p-2 align-middle lg:hidden"
			onclick={() => {
				showMenu = !showMenu
				if (showMenu) showProfile = false
			}}
		>
			{#if showMenu}
				<X class="text-surface-900-100 mx-2 my-auto" />
			{:else}
				<Menu class="text-surface-900-100 mx-2 my-auto" />
			{/if}
			<Logo selected={true} />
		</button>

		<ul class="my-auto hidden w-9/12 justify-evenly lg:flex lg:text-xs xl:w-7/12 xl:text-base">
			<li class="h-12">
				<a
					href="/"
					class="hover:text-primary-600-400 flex h-full place-content-center place-items-center"
					class:text-primary-600-400={"Home" === currentPage}
					aria-label="Navigate to home page"
				>
					<Logo selected={false} />
				</a>
			</li>
			{#each routes as route, idx (route)}
				{#if idx > 0}
					<li class="h-12">
						<a
							href={getLink(route)}
							class="hover:text-primary-600-400 flex h-full place-content-center place-items-center"
							class:text-primary-600-400={route === currentPage}
							aria-label="Navigate to {route.toLowerCase()} page"
						>
							{#if idx === 0}
								{route}
							{:else if route === "Dashboard"}
								{#if roles?.scripter}
									{route}
								{/if}
							{:else}
								{route}
							{/if}
						</a>
					</li>
				{/if}
			{/each}
		</ul>

		<div class="mx-1 flex">
			<button
				name="User panel"
				aria-label="Open user panel"
				class="group flex items-center justify-around p-2"
				onclick={() => {
					showProfile = !showProfile
					if (showProfile) showMenu = false
				}}
			>
				{#if profile}
					<span class="group-hover:text-primary-500 mx-2 my-auto hidden md:block">
						{profile.username}
					</span>
				{/if}

				<Avatar
					{src}
					name={avatarName}
					classes="xl:mx-1 mx-2 w-11 md:w-12 h-11 md:h-11"
					border="border-2 group-hover:preset-tonal {showProfile
						? 'border-primary-500'
						: 'border-surface-500'}"
				/>
			</button>

			<div class="hidden gap-1 lg:flex">
				<Lightswitch />
				<ThemeSwitcher />
				<GitHub />
				<Discord />
			</div>
		</div>
	</div>

	<ul
		class="bg-surface-200/30 dark:bg-surface-800/30 absolute z-50 w-full backdrop-blur-md lg:hidden {showMenu
			? 'flex flex-col'
			: 'hidden'}"
	>
		{#each routes as route, idx (route)}
			<li class="h-12">
				<a
					href={getLink(route)}
					class="hover:text-primary-400 dark:hover:text-primary-100 flex h-full place-content-center place-items-center"
					class:text-primary-500={route === currentPage}
					class:dark:text-primary-400={route === currentPage}
					aria-label="Navigate to {route.toLowerCase()} page"
					onclick={() => (showMenu = !showMenu)}
				>
					{#if idx === 0}
						{route}
					{:else if route === "Dashboard"}
						{#if roles?.scripter}
							{route}
						{/if}
					{:else}
						{route}
					{/if}
				</a>
			</li>
		{/each}

		<li class="my-2 flex h-12 lg:hidden">
			<div class="flex w-full justify-evenly">
				<ThemeSwitcher />
				<div class="flex">
					<Lightswitch />
					<GitHub />
					<Discord />
				</div>
			</div>
		</li>
	</ul>

	<form
		method="POST"
		class="bg-surface-200/30 dark:bg-surface-800/30 absolute z-50 w-full py-14 backdrop-blur-md {showProfile
			? 'flex flex-col'
			: 'hidden'}"
		use:enhance
	>
		{#if profile}
			<header class="card-header flex">
				<div class="mx-auto">
					<h3 class="my-6 text-center md:hidden">{profile.username}</h3>

					<a
						href="/user/{profile.id}"
						class="btn preset-filled-secondary-500 mx-auto flex"
						aria-label="Open profile page"
						onclick={() => (showProfile = false)}
					>
						<UserRound />
						Profile
					</a>
				</div>
			</header>

			<section class="flex flex-col p-4">
				<h3 class="mx-auto my-4 text-center">Roles</h3>
				<div class="flex pt-2 pb-8">
					<RoleBadges />
				</div>
			</section>
			<footer class="card-footer flex flex-col">
				<button
					name="Logout"
					aria-label="Logout"
					class="btn preset-filled-secondary-500 mx-auto"
					formaction="/auth?/logout"
				>
					<LogOut />
					Logout
				</button>
			</footer>
		{:else}
			<header class="card-header my-8">
				<h3 class="text-2x1 md:text-3x1 text-center font-bold">Log In</h3>
			</header>

			<footer class="card-footer my-4 flex justify-evenly">
				<button
					name="Login"
					aria-label="Login to your account mx-auto"
					class="btn preset-filled-primary-500"
					formaction="/auth?/login&provider=discord&path={page.url.pathname.replaceAll('/', '_-_')}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="h-4 w-4">
						<path
							fill="currentColor"
							d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
						/>
					</svg>

					<span class="px-2">Login with Discord</span>
				</button>
			</footer>
		{/if}
	</form>
</nav>

<!-- <a href="https://waspscripts.dev" class="bg-surface-300-700 hover:preset-tonal py-2 text-center">
	This website is for <b>Simba 1400</b>. Click here to visit the <b>Simba 2000</b> version of the website.
</a> -->
