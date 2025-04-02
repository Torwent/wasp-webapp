<script lang="ts">
	import { onMount } from "svelte"
	import Head from "$lib/components/Head.svelte"

	let checkedOS: boolean = $state(false)
	let hasMac: boolean = $state(false)

	interface OSInfo {
		OS: string
		Extension: string
		tutorialID: string
	}

	let currentOS: OSInfo = $state({ OS: "Windows", Extension: "exe", tutorialID: "0" })
	let secondaryOS: OSInfo = $state({ OS: "Linux", Extension: "sh", tutorialID: "1" })

	function getOS(userAgent: string) {
		userAgent = userAgent.toLowerCase()
		if (userAgent.includes("win")) {
			currentOS = { OS: "Windows", Extension: "exe", tutorialID: "0" }
			secondaryOS = { OS: "Linux", Extension: "sh", tutorialID: "1" }
			return
		}

		if (userAgent.includes("linux")) {
			if (userAgent.includes("debian")) {
				currentOS = {
					OS: "Debian Linux",
					Extension: "sh",
					tutorialID: "1"
				}
				secondaryOS = { OS: "Windows", Extension: "exe", tutorialID: "0" }
				return
			}

			if (userAgent.includes("ubuntu")) {
				currentOS = { OS: "Ubuntu", Extension: "sh", tutorialID: "1" }
				secondaryOS = { OS: "Windows", Extension: "exe", tutorialID: "0" }
				return
			}

			currentOS = { OS: "Linux", Extension: "sh", tutorialID: "1" }
			secondaryOS = { OS: "Windows", Extension: "exe", tutorialID: "0" }
			return
		}

		if (userAgent.includes("mac")) {
			hasMac = true
			currentOS = { OS: "MacOS", Extension: "exe", tutorialID: "0" }
			secondaryOS = { OS: "Linux", Extension: "sh", tutorialID: "1" }
			return
		}
	}

	onMount(() => {
		getOS(navigator.userAgent)
		checkedOS = true
	})
</script>

<Head
	title="Setup"
	description="Setup Simba and WaspScripts from scratch to bot OldSchool RuneScape. Start your road to max on osrs today!"
/>

<main class="container mx-auto my-6 min-h-screen max-w-2xl flex-grow">
	{#if checkedOS}
		<div class="my-8 h-screen">
			<header>
				<h1 class="text-primary-500 dark:text-primary-100 py-16 text-center text-xl md:text-3xl">
					{currentOS.OS} OS detected!
				</h1>
				{#if !hasMac}
					<p class="pt-4 text-center text-lg">
						For an automated install script download the following file:
					</p>
					<div class="flex justify-center py-8">
						<a
							href="https://github.com/torwent/wasp-setup/releases/latest/download/simba-setup.{currentOS.Extension}"
						>
							<button class="btn preset-filled-secondary-500">
								{`setup.${currentOS.Extension}`}
							</button>
						</a>
					</div>

					<p class="pb-24 text-center text-xs">
						For a manual instalation guide for {currentOS.OS} you can go
						<a
							href="/tutorials/{currentOS.tutorialID}"
							class="text-primary-500 dark:text-primary-200 font-semibold hover:underline"
						>
							here
						</a>
						.
					</p>
				{:else}
					<p class="pt-4 text-center text-lg">Simba doesn't work with M1 Macs.</p>
					<p class="pt-4 text-center text-lg">
						If you have an older Mac, it's possible to set things up you will have to figure things
						on your own and there will be bugs still. The easiest approach would be to run things
						through a VM and follow the setup guide for a different OS.
					</p>
				{/if}
			</header>
			{#if hasMac}
				<p class="pt-40 text-center">
					For a Windows install script you can get it here:
					<a
						href="https://github.com/torwent/wasp-setup/releases/latest/download/simba-setup.{currentOS.Extension}"
						class="text-primary-400 dark:text-primary-100 font-semibold hover:underline"
					>
						setup.{currentOS.Extension}
					</a>
				</p>
				<p class="text-center">
					For a manual instalation guide for {currentOS.OS} you can go
					<a
						href="/tutorials/{currentOS.tutorialID}"
						class="text-primary-400 dark:text-primary-100 font-semibold hover:underline"
					>
						here
					</a>
					.
				</p>
			{/if}
			<p class="pt-24 text-center">
				For a {secondaryOS.OS} install script you can get it here:
				<a
					href="https://github.com/torwent/wasp-setup/releases/latest/download/simba-setup.{secondaryOS.Extension}"
					class="text-primary-400 dark:text-primary-100 font-semibold hover:underline"
				>
					setup.{secondaryOS.Extension}
				</a>
			</p>
			<p class="text-center">
				For a manual instalation guide for {secondaryOS.OS} you can go
				<a
					href="/tutorials/{secondaryOS.tutorialID}"
					class="text-primary-400 dark:text-primary-100 font-semibold hover:underline"
				>
					here
				</a>
				.
			</p>
		</div>
	{:else}
		<header>
			<h1 class="text-primary-500 dark:text-primary-100 py-16 text-center text-xl md:text-3xl">
				Checking your operating system...
			</h1>
		</header>
	{/if}
</main>
