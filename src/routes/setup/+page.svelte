<script lang="ts">
	import { onMount } from "svelte"
	import { fade } from "svelte/transition"
	import DownloadButton from "$lib/components/LinkButton.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"

	let checkedOS: boolean = false
	let hasMac: boolean = false

	interface OSInfo {
		OS: string
		Extension: string
		BlogID: string
	}

	let currentOS: OSInfo
	let secondaryOS: OSInfo

	onMount(async () => {
		let userAgent = navigator.userAgent
		if (userAgent.indexOf("Win") != -1) {
			currentOS = { OS: "Windows", Extension: "cmd", BlogID: "Setup%20(Windows)" }
			secondaryOS = { OS: "Linux", Extension: "sh", BlogID: "OSRS%20Setup%20(Debian)" }
		} else if (userAgent.indexOf("Linux") != -1) {
			if (userAgent.indexOf("Debian") != -1) {
				currentOS = { OS: "Debian Linux", Extension: "sh", BlogID: "OSRS%20Setup%20(Debian)" }
				secondaryOS = { OS: "Windows", Extension: "cmd", BlogID: "Setup%20(Windows)" }
			} else if (userAgent.indexOf("Ubuntu Linux") != -1) {
				currentOS = { OS: "Ubuntu", Extension: "sh", BlogID: "OSRS%20Setup%20(Debian)" }
				secondaryOS = { OS: "Windows", Extension: "cmd", BlogID: "Setup%20(Windows)" }
			} else {
				currentOS = { OS: "Linux", Extension: "sh", BlogID: "OSRS%20Setup%20(Debian)" }
				secondaryOS = { OS: "Windows", Extension: "cmd", BlogID: "Setup%20(Windows)" }
			}
		} else if (userAgent.indexOf("Mac") != -1) {
			hasMac = true
			currentOS = { OS: "MacOS", Extension: "cmd", BlogID: "Setup%20(Windows)" }
			secondaryOS = { OS: "Linux", Extension: "sh", BlogID: "OSRS%20Setup%20(Debian)" }
		}
		checkedOS = true
	})
</script>

<svelte:head>
	<MetaTags
		title="Setup"
		description="Fully setup Simba and WaspScripts from scratch to bot OldSchool RuneScape. Start your road to max on osrs today!"
		url="/setup"
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
				<h1 class="text-xl py-16 text-center text-amber-500 dark:text-amber-100 md:text-3xl">
					{currentOS.OS} was detected as your operating system.
				</h1>
				{#if !hasMac}
					<p class="text-lg text-center pt-4">
						For an automated install script download the following file:
						<DownloadButton
							url={`https://github.com/torwent/wasp-setup/releases/latest/download/setup.${currentOS.Extension}`}
							text={`setup.${currentOS.Extension}`}
						/>
					</p>
					<p class="text-center pb-24">
						For a manual instalation guide for {currentOS.OS} you can go
						<a
							href="/blog/{currentOS.BlogID}"
							class="font-semibold text-amber-500 dark:text-amber-200 hover:underline">here</a
						>.
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
						class="font-semibold hover:underline text-amber-400 dark:text-amber-100"
					>
						setup.{currentOS.Extension}
					</a>
				</p>
				<p class="text-center">
					For a manual instalation guide for {currentOS.OS} you can go
					<a
						href="/blog/{currentOS.BlogID}"
						class="font-semibold hover:underline text-amber-400 dark:text-amber-100">here</a
					>.
				</p>
			{/if}
			<p class="text-center pt-24">
				For a {secondaryOS.OS} install script you can get it here:
				<a
					href="https://github.com/torwent/wasp-setup/releases/latest/download/setup.{secondaryOS.Extension}"
					class="font-semibold hover:underline text-amber-400 dark:text-amber-100"
				>
					setup.{secondaryOS.Extension}
				</a>
			</p>
			<p class="text-center">
				For a manual instalation guide for {secondaryOS.OS} you can go
				<a
					href="/blog/{secondaryOS.BlogID}"
					class="font-semibold hover:underline text-amber-400 dark:text-amber-100">here</a
				>.
			</p>
		</div>
	{:else}
		<header in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
			<h1 class="text-xl py-16 text-center text-amber-500 dark:text-amber-100 md:text-3xl">
				Checking your operating system...
			</h1>
		</header>
	{/if}
</div>
