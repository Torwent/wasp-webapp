<script lang="ts">
	import { page } from "$app/stores"
	import { LightSwitch } from "@skeletonlabs/skeleton"
	import Logo from "./Logo.svelte"
	import UserPanel from "./UserPanel.svelte"
	export let large: boolean

	const routeArray = ["Home", "Setup", "Scripts", "Stats", "Premium", "FAQ", "Tutorials"]
	let showMenu = false

	function getLink(route: string): string {
		return "/" + route.toLowerCase().replace("home", "")
	}

	function isActive(route: string, currentPath: string) {
		const tmp = getLink(route).replaceAll("/", "")
		return tmp === "" ? currentPath === "/" : currentPath.replaceAll("/", "").includes(tmp)
	}

	$: active = (route: string) => isActive(route, $page.url.pathname)
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
					class="dark:hover:text-primary-100 hover:text-primary-400 h-full flex place-items-center
									{active(route) ? 'text-primary-500 dark:text-primary-400' : ''}"
					aria-label="Navigate to {route.toLowerCase()} page"
					on:click={() => (showMenu = !showMenu)}
				>
					{#if index === 0}
						{#if !large}
							{route}
						{:else}
							<Logo selected={active(route)} />
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
