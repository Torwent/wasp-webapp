<script lang="ts">
	import { page } from "$app/stores"
	import { LightSwitch } from "@skeletonlabs/skeleton"
	import Logo from "./Logo.svelte"
	import UserPanel from "./UserPanel.svelte"
	import { goto } from "$app/navigation"
	import { Menu } from "lucide-svelte"
	export let large: boolean

	let { roles } = $page.data
	$: ({ roles } = $page.data)

	let showMenu = false

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
</script>

<svelte:window on:keydown={onKeyDown} />

<nav class="transition-colors duration-500 font-semibold h-full">
	{#if !large}
		<button
			name="Menu"
			aria-label="Open the navigation menu"
			class="flex mx-auto text-primary-500 dark:text-primary-400 w-full place-content-center h-full justify-between"
			on:click={() => (showMenu = !showMenu)}
		>
			<Menu class="text-white" />
			<Logo selected={true} />
			<div />
		</button>
	{/if}

	<ul
		class="grid md:flex md:space-x-4 lg:space-x-8 items-center text-center pt-8 md:pt-0 {!showMenu
			? 'hidden md:block'
			: ''}"
	>
		{#each routeArray as route, index}
			<li class="h-12 mx-auto w-full">
				<a
					href={getLink(route)}
					class="dark:hover:text-primary-100 hover:text-primary-400 h-full flex place-items-center place-content-center"
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
