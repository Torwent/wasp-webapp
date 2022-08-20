<script lang="ts">
	import MediaQuery from "svelte-media-query"
	import { user } from "$lib/stores/authStore"
	import { scale } from "svelte/transition"
	import Logo from "$lib/components/Logo.svelte"
	import UserPanel from "$lib/components/UserPanel.svelte"
	import Auth from "$lib/components/Auth.svelte"
	import Avatar from "$lib/components/Avatar.svelte"
	import DarkModeSwitch from "$lib/components/DarkModeSwitch.svelte"
	import { page } from "$app/stores"

	let tabs = [0, 1, 2, 3, 4, 5]
	let selectedTab: number

	switch ($page.url.pathname) {
		case "/":
			selectedTab = tabs[0]
			break

		case "/setup":
			selectedTab = tabs[1]
			break

		case "/scripts":
			selectedTab = tabs[2]
			break

		case "/premium":
			selectedTab = tabs[3]
			break

		case "/faq":
			selectedTab = tabs[4]
			break

		case "/blog":
			selectedTab = tabs[5]
			break
	}

	let showUserPanel = false // menu state
	let showMenu = false // menu state
</script>

<nav
	class="sticky top-0 z-50 w-full backdrop-blur flex-none transition-colors duration-500 border-b 
	bg-white/60 supports-backdrop-blur:bg-white/95 dark:border-stone-50/[0.06] dark:bg-stone-900/60"
>
	<div class="max-w-7xl mx-auto px-4">
		<div class="grid md:flex justify-center md:justify-between">
			<div class="grid md:flex space-x-7">
				<MediaQuery query="(min-width: 768px)" let:matches>
					{#if matches}
						<a
							href="/"
							class="flex items-center py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
							on:click={() => (selectedTab = tabs[0])}
							class:text-orange-500={selectedTab === 0}
							class:dark:text-orange-400={selectedTab === 0}
						>
							<Logo />
						</a>
					{:else}
						<span
							class="flex items-center py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
							on:click={() => (showMenu = !showMenu)}
							class:text-orange-500={selectedTab === 0}
							class:dark:text-orange-400={selectedTab === 0}
						>
							<Logo />
						</span>
					{/if}
				</MediaQuery>

				<div />
				<!-- Menu -->
				<MediaQuery query="(min-width: 768px)" let:matches>
					{#if matches || showMenu}
						<div class="grid md:flex items-center space-x-1">
							{#if !matches}
								<a
									href="/"
									class="font-semibold py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
									on:click={() => (selectedTab = tabs[0])}
									on:click={() => (showMenu = false)}
									class:text-orange-500={selectedTab === 0}
									class:dark:text-orange-400={selectedTab === 0}
								>
									Home
								</a>
							{/if}
							<a
								href="/setup"
								class="font-semibold py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
								on:click={() => (selectedTab = tabs[1])}
								on:click={() => (showMenu = false)}
								class:text-orange-500={selectedTab === 1}
								class:dark:text-orange-400={selectedTab === 1}
							>
								Setup
							</a>
							<a
								href="/scripts"
								class="font-semibold py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
								on:click={() => (selectedTab = tabs[2])}
								on:click={() => (showMenu = false)}
								class:text-orange-500={selectedTab === 2}
								class:dark:text-orange-400={selectedTab === 2}
							>
								Scripts
							</a>
							<a
								href="/premium"
								class="font-semibold py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
								on:click={() => (selectedTab = tabs[3])}
								on:click={() => (showMenu = false)}
								class:text-orange-500={selectedTab === 3}
								class:dark:text-orange-400={selectedTab === 3}
							>
								Premium
							</a>
							<a
								href="/faq"
								class="font-semibold py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
								on:click={() => (selectedTab = tabs[4])}
								on:click={() => (showMenu = false)}
								class:text-orange-500={selectedTab === 4}
								class:dark:text-orange-400={selectedTab === 4}
							>
								FAQ
							</a>

							<a
								href="/blog"
								class="font-semibold py-4 px-2 transition duration-300 dark:hover:text-amber-100 hover:text-orange-400"
								on:click={() => (selectedTab = tabs[5])}
								on:click={() => (showMenu = false)}
								class:text-orange-500={selectedTab === 5}
								class:dark:text-orange-400={selectedTab === 5}
							>
								Blog
							</a>
						</div>
					{/if}
				</MediaQuery>
			</div>
			<!-- Account -->
			<MediaQuery query="(min-width: 768px)" let:matches>
				{#if matches}
					<div class="flex">
						<div
							on:mouseover={() => (showUserPanel = true)}
							on:focus={() => (showUserPanel = true)}
							on:mouseleave={() => (showUserPanel = false)}
							class="grid place-items-center h-full"
						>
							<button class="menu focus:outline-none focus:shadow-solid">
								<!-- Maybe this is silly but it's the only way I found to refresh the avatar on user login/logout lol-->
								{#if $user}
									<Avatar />
								{:else}
									<Avatar />
								{/if}
							</button>

							{#if showUserPanel}
								<div
									in:scale={{ duration: 100, start: 0.95 }}
									out:scale={{ duration: 75, start: 0.95 }}
									class="bg-stone-100 dark:bg-stone-800 top-14 lg:right-auto md:right-12 sm:right-16 absolute w-80 pt-4 mt-1 rounded-md shadow-lg container group max-w-sm items-center mx-auto content-div"
								>
									{#if $user}
										<UserPanel />
									{:else}
										<Auth />
									{/if}
								</div>
							{/if}
						</div>
						<div class="grid place-items-center h-full px-8">
							<DarkModeSwitch />
						</div>
					</div>
				{:else if showMenu}
					<div class="flex">
						<div
							on:click={() => (showUserPanel = !showUserPanel)}
							class="grid place-items-center h-full"
						>
							<button class="menu focus:outline-none focus:shadow-solid">
								<!-- Maybe this is silly but it's the only way I found to refresh the avatar on user login/logout lol-->
								{#if $user}
									<Avatar />
								{:else}
									<Avatar />
								{/if}
							</button>

							{#if showUserPanel}
								<div
									in:scale={{ duration: 100, start: 0.95 }}
									out:scale={{ duration: 75, start: 0.95 }}
									class="bg-stone-100 dark:bg-stone-800 top-14 lg:right-auto md:right-12 sm:right-16 absolute w-80 pt-4 mt-1 rounded-md shadow-lg container group max-w-sm items-center mx-auto content-div"
								>
									{#if $user}
										<UserPanel />
									{:else}
										<Auth />
									{/if}
								</div>
							{/if}
						</div>
						<div class="grid place-items-center h-full px-8">
							<DarkModeSwitch />
						</div>
					</div>
				{/if}
			</MediaQuery>
		</div>
	</div>
</nav>
