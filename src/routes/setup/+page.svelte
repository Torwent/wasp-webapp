<script lang="ts">
	import { onMount } from "svelte"
	import { page } from "$app/state"

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
	const headTitle = "Setup - WaspScripts"
	const headDescription =
		"Setup Simba and WaspScripts from scratch to bot OldSchool RuneScape. Start your road to max on osrs today!"
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if checkedOS}
		<div class="my-8 h-screen">
			<header>
				<h1 class="py-16 text-center text-xl text-primary-500 md:text-3xl dark:text-primary-100">
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
							class="font-semibold text-primary-500 hover:underline dark:text-primary-200"
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
						class="font-semibold text-primary-400 hover:underline dark:text-primary-100"
					>
						setup.{currentOS.Extension}
					</a>
				</p>
				<p class="text-center">
					For a manual instalation guide for {currentOS.OS} you can go
					<a
						href="/tutorials/{currentOS.tutorialID}"
						class="font-semibold text-primary-400 hover:underline dark:text-primary-100"
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
					class="font-semibold text-primary-400 hover:underline dark:text-primary-100"
				>
					setup.{secondaryOS.Extension}
				</a>
			</p>
			<p class="text-center">
				For a manual instalation guide for {secondaryOS.OS} you can go
				<a
					href="/tutorials/{secondaryOS.tutorialID}"
					class="font-semibold text-primary-400 hover:underline dark:text-primary-100"
				>
					here
				</a>
				.
			</p>
		</div>
	{:else}
		<header>
			<h1 class="py-16 text-center text-xl text-primary-500 md:text-3xl dark:text-primary-100">
				Checking your operating system...
			</h1>
		</header>
	{/if}
</div>
