<script lang="ts">
	import { page } from "$app/stores"
	import { Avatar, LightSwitch } from "@skeletonlabs/skeleton"
	import Logo from "./Logo.svelte"
	import { goto } from "$app/navigation"
	import { Menu, X, LogOut, UserRound } from "lucide-svelte"
	import { browser } from "$app/environment"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { enhance } from "$app/forms"

	let { profile, roles } = $page.data
	$: ({ profile, roles } = $page.data)

	let showMenu = false
	let showProfile = false

	const routeArray = [
		"Home",
		"Setup",
		"Scripts",
		"Stats",
		"Subscriptions",
		"FAQ",
		"Tutorials",
		"Dashboard"
	] as const
	let currentPage: (typeof routeArray)[number] = "Home"

	function getLink(route: string): string {
		return "/" + route.toLowerCase().replace("home", "")
	}

	function setCurrentPage(currentPath: string) {
		const path = currentPath.split("/")[1]

		if (path.length === 0) {
			currentPage = routeArray[0]
			return
		}

		for (let i = 1; i < routeArray.length; i++) {
			let route = routeArray[i]

			if (route.toLowerCase().replace("home", "") === path) {
				currentPage = route
				return
			}
		}
	}

	$: setCurrentPage($page.url.pathname)

	function onKeyDown(e: KeyboardEvent) {
		const inputFields = ["input", "textarea"]
		if (inputFields.includes(window.document.activeElement?.localName ?? "")) return
		switch (e.key) {
			case "ArrowLeft":
				for (let i = 0; i < routeArray.length; i++) {
					if (currentPage === routeArray[i]) {
						if (i <= 0) goto(getLink(routeArray[routeArray.length - 1]))
						else goto(getLink(routeArray[i - 1]))
					}
				}
				break
			case "ArrowRight":
				for (let i = 0; i < routeArray.length; i++) {
					if (currentPage === routeArray[i]) {
						if (i >= routeArray.length - 1) goto(getLink(routeArray[0]))
						else goto(getLink(routeArray[i + 1]))
					}
				}
				break
		}
	}

	function randomString() {
		return (Math.random() + 1).toString(36).substring(7)
	}

	const rnd = "https://api.dicebear.com/6.x/bottts/svg?seed=" + randomString()
	let src = rnd
	$: src = profile ? profile.avatar : rnd
</script>

<svelte:window on:keydown={onKeyDown} />

<nav class="flex-col w-full row-span-1 col-span-12">
	<div class="flex justify-between bg-surface-100-800-token font-semibold h-full">
		<button
			name="Menu"
			aria-label="Open the navigation menu"
			class="flex my-auto text-primary-500-400-token h-full justify-left align-middle p-2 lg:hidden"
			on:click={() => {
				showMenu = !showMenu
				if (showMenu) showProfile = false
			}}
		>
			{#if showMenu}
				<X class="text-surface-900-50-token my-auto mx-2" />
			{:else}
				<Menu class="text-surface-900-50-token my-auto mx-2" />
			{/if}
			<Logo selected={true} />
		</button>

		<ul class="hidden lg:flex w-9/12 xl:w-7/12 my-auto justify-evenly">
			<li class="h-12">
				<a
					href="/"
					class="dark:hover:text-primary-100 hover:text-primary-400 h-full flex place-items-center place-content-center"
					class:text-primary-500={"Home" === currentPage}
					class:dark:text-primary-400={"Home" === currentPage}
					aria-label="Navigate to home page"
				>
					<Logo selected={false} />
				</a>
			</li>
			{#each routeArray as route, index}
				{#if index > 0}
					<li class="h-12">
						<a
							href={getLink(route)}
							class="dark:hover:text-primary-100 hover:text-primary-400 h-full flex place-items-center place-content-center"
							class:text-primary-500={route === currentPage}
							class:dark:text-primary-400={route === currentPage}
							aria-label="Navigate to {route.toLowerCase()} page"
						>
							{#if index === 0}
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

		<div class="flex">
			<button
				name="User panel"
				aria-label="Open user panel"
				class="p-2 flex items-center justify-around group"
				on:click={() => {
					showProfile = !showProfile
					if (showProfile) showMenu = false
				}}
			>
				{#if profile}
					<span class="hidden md:block mx-2 my-auto group-hover:text-primary-500"
						>{profile.username}</span
					>
				{/if}
				{#if browser || profile}
					<Avatar
						{src}
						width="w-11 md:w-12"
						border="border-4 border-surface-300-600-token group-hover:border-primary-500"
						cursor="cursor-pointer"
						class="block mx-2"
						initials="WS"
						loading="lazy"
					/>
				{:else}
					<div class="placeholder-circle w-11 md:w-12 animate-pulse" />
				{/if}
			</button>

			<LightSwitch class="hidden lg:block my-auto mx-4" />
		</div>
	</div>

	<ul class="absolute z-50 variant-glass-surface w-full {showMenu ? 'flex flex-col' : 'hidden'}">
		{#each routeArray as route, index}
			<li class="h-12">
				<a
					href={getLink(route)}
					class="dark:hover:text-primary-100 hover:text-primary-400 h-full flex place-items-center place-content-center"
					class:text-primary-500={route === currentPage}
					class:dark:text-primary-400={route === currentPage}
					aria-label="Navigate to {route.toLowerCase()} page"
					on:click={() => (showMenu = !showMenu)}
				>
					{#if index === 0}
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

		<li class="flex h-12">
			<div class="mx-auto my-auto">
				<LightSwitch />
			</div>
		</li>
	</ul>

	<form
		method="POST"
		class="absolute z-50 variant-glass-surface w-full {showProfile ? 'flex flex-col' : 'hidden'}"
		use:enhance
	>
		{#if profile}
			<header class="card-header flex">
				<div class="mx-auto">
					<h3 class="my-6 text-center md:hidden">{profile.username}</h3>

					<a href="/user/{profile.id}" aria-label="Open profile page">
						<button
							name="Profile"
							aria-label="Open profile page"
							class="btn variant-filled-secondary flex mx-auto"
						>
							<UserRound />
							Profile
						</button>
					</a>
				</div>
			</header>

			<section class="flex flex-col p-4">
				<h3 class="text-center my-4 mx-auto">Roles</h3>
				<div class="flex pt-2 pb-8">
					<RoleBadges />
				</div>
			</section>
			<footer class="flex flex-col card-footer">
				<button
					name="Logout"
					aria-label="Logout"
					class="btn variant-filled-secondary mx-auto"
					formaction="/auth?/logout"
				>
					<LogOut />
					Logout
				</button>
			</footer>
		{:else}
			<header class="card-header my-8">
				<h3 class="text-2x1 font-bold text-center md:text-3x1">Log In</h3>
			</header>

			<footer class="card-footer flex justify-evenly my-4">
				<button
					name="Login"
					aria-label="Login to your account mx-auto"
					class="btn variant-filled-secondary"
					formaction="/auth?/login&provider=discord"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="w-4 h-4">
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
