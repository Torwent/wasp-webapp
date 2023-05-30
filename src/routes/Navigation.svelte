<script lang="ts">
	import { page } from "$app/stores"
	import { LightSwitch } from "@skeletonlabs/skeleton"
	import Logo from "./Logo.svelte"
	import UserPanel from "./UserPanel.svelte"
	import type { Profile } from "$lib/backend/types"

	export let profile: Profile | false
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
			<a
				href={getLink(route)}
				class="dark:hover:text-primary-100 hover:text-primary-400
                            {active(route) ? 'text-primary-500 dark:text-primary-400' : ''}"
				on:click={() => (showMenu = !showMenu)}
			>
				<li class="py-2 md:py-0">
					{#if index === 0}
						{#if !large}
							{route}
						{:else}
							<Logo selected={active(route)} />
						{/if}
					{:else}
						{route}
					{/if}
				</li>
			</a>
		{/each}

		{#if !large}
			<li class="mt-8 py-2 flex items-center justify-between">
				<div class="flex items-center">
					<UserPanel bind:profile large={false} />
				</div>
				<LightSwitch />
			</li>
		{/if}
	</ul>
</nav>
