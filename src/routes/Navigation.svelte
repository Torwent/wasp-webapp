<script lang="ts">
	import { page } from "$app/stores"
	import { LightSwitch } from "@skeletonlabs/skeleton"
	import Logo from "./Logo.svelte"
	import UserPanel from "./UserPanel.svelte"
	export let large: boolean

	let showMenu = false

	const routeArray = ["Home", "Setup", "Scripts", "Stats", "Premium", "FAQ", "Tutorials"] as const
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
</script>

<nav class="transition-colors duration-500 font-semibold">
	{#if !large}
		<button
			name="Menu"
			aria-label="Open the navigation menu"
			class="flex mx-auto text-primary-500 dark:text-primary-400"
			on:click={() => (showMenu = !showMenu)}
		>
			<Logo selected={true} />
		</button>
	{/if}

	<ul
		class="grid md:flex md:space-x-4 lg:space-x-8 items-center text-center pt-8 md:pt-0 {!showMenu
			? 'hidden md:block'
			: ''}"
	>
		{#each routeArray as route, index}
			<li class="h-12 mx-auto">
				<a
					href={getLink(route)}
					class="dark:hover:text-primary-100 hover:text-primary-400 h-full flex place-items-center"
					class:text-primary-500={route === currentPage}
					class:dark:text-primary-400={route === currentPage}
					aria-label="Navigate to {route.toLowerCase()} page"
					on:click={() => (showMenu = !showMenu)}
				>
					{#if index === 0}
						{#if !large}
							{route}
						{:else}
							<Logo selected={route === currentPage} />
						{/if}
					{:else}
						{route}
					{/if}
				</a>
			</li>
		{/each}

		{#if !large}
			<li class="mt-8 py-2 flex items-center justify-between {!showMenu ? 'hidden md:block' : ''}">
				<div class="flex items-center">
					<UserPanel large={false} />
				</div>
				<LightSwitch />
			</li>
		{/if}
	</ul>
</nav>
