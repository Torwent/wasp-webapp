<script lang="ts">
	import { onMount } from "svelte"
	import { fade } from "svelte/transition"
	import MetaTags from "$lib/components/MetaTags.svelte"

	let checkedOS: boolean = false
	let hasMac: boolean = false

	interface OSInfo {
		OS: string
		Extension: string
		tutorialID: string
	}

	let currentOS: OSInfo
	let secondaryOS: OSInfo

	function getOS(userAgent: string) {
		userAgent = userAgent.toLowerCase()
		if (userAgent.includes("win")) {
			currentOS = { OS: "Windows", Extension: "exe", tutorialID: "setup-windows-by-torwent" }
			secondaryOS = { OS: "Linux", Extension: "sh", tutorialID: "linux-setup-debian-by-torwent" }
			return
		}

		if (userAgent.includes("linux")) {
			if (userAgent.includes("debian")) {
				currentOS = {
					OS: "Debian Linux",
					Extension: "sh",
					tutorialID: "linux-setup-debian-by-torwent"
				}
				secondaryOS = { OS: "Windows", Extension: "exe", tutorialID: "setup-windows-by-torwent" }
				return
			}

			if (userAgent.includes("ubuntu")) {
				currentOS = { OS: "Ubuntu", Extension: "sh", tutorialID: "linux-setup-debian-by-torwent" }
				secondaryOS = { OS: "Windows", Extension: "exe", tutorialID: "setup-windows-by-torwent" }
				return
			}

			currentOS = { OS: "Linux", Extension: "sh", tutorialID: "linux-setup-debian-by-torwent" }
			secondaryOS = { OS: "Windows", Extension: "exe", tutorialID: "setup-windows-by-torwent" }
			return
		}

		if (userAgent.includes("mac")) {
			hasMac = true
			currentOS = { OS: "MacOS", Extension: "exe", tutorialID: "setup-windows-by-torwent" }
			secondaryOS = { OS: "Linux", Extension: "sh", tutorialID: "linux-setup-debian-by-torwent" }
			return
		}
	}

	onMount(() => {
		getOS(navigator.userAgent)
		checkedOS = true
	})
</script>

<svelte:head>
	<MetaTags
		title="Setup"
		description="Setup Simba and WaspScripts from scratch to bot OldSchool RuneScape. Start your road to max on osrs today!"
	/>
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	{#if checkedOS}
		<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
			<header>
				<h1 class="text-xl py-16 text-center text-primary-500 dark:text-primary-100 md:text-3xl">
					{currentOS.OS} OS detected!
				</h1>
				{#if !hasMac}
					<p class="text-lg text-center pt-4">
						For an automated install script download the following file:
					</p>
					<div class="flex justify-center py-8">
						<a
							href="https://github.com/torwent/wasp-setup/releases/latest/download/simba-setup.{currentOS.Extension}"
						>
							<button class="btn variant-filled-secondary">{`setup.${currentOS.Extension}`}</button>
						</a>
					</div>

					<p class="text-center pb-24">
						For a manual instalation guide for {currentOS.OS} you can go
						<a
							href="/tutorials/{currentOS.tutorialID}"
							class="font-semibold text-primary-500 dark:text-primary-200 hover:underline"
						>
							here
						</a>
						.
					</p>
				{:else}
					<p class="text-lg text-center pt-4">Simba doesn't work with M1 Macs.</p>
					<p class="text-lg text-center pt-4">
						If you have an older Mac, it's possible to set things up you will have to figure things
						on your own and there will be bugs still. The easiest approach would be to run things
						through a VM and follow the setup guide for a different OS.
					</p>
				{/if}
			</header>
			{#if hasMac}
				<p class="text-center pt-40">
					For a Windows install script you can get it here:
					<a
						href="https://github.com/torwent/wasp-setup/releases/latest/download/setup.{currentOS.Extension}"
						class="font-semibold hover:underline text-primary-400 dark:text-primary-100"
					>
						setup.{currentOS.Extension}
					</a>
				</p>
				<p class="text-center">
					For a manual instalation guide for {currentOS.OS} you can go
					<a
						href="/tutorials/{currentOS.tutorialID}"
						class="font-semibold hover:underline text-primary-400 dark:text-primary-100"
					>
						here
					</a>
					.
				</p>
			{/if}
			<p class="text-center pt-24">
				For a {secondaryOS.OS} install script you can get it here:
				<a
					href="https://github.com/torwent/wasp-setup/releases/latest/download/setup.{secondaryOS.Extension}"
					class="font-semibold hover:underline text-primary-400 dark:text-primary-100"
				>
					setup.{secondaryOS.Extension}
				</a>
			</p>
			<p class="text-center">
				For a manual instalation guide for {secondaryOS.OS} you can go
				<a
					href="/tutorials/{secondaryOS.tutorialID}"
					class="font-semibold hover:underline text-primary-400 dark:text-primary-100"
				>
					here
				</a>
				.
			</p>
		</div>
	{:else}
		<header in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
			<h1 class="text-xl py-16 text-center text-primary-500 dark:text-primary-100 md:text-3xl">
				Checking your operating system...
			</h1>
		</header>
	{/if}
</div>
