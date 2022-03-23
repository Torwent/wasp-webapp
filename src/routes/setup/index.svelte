<script>
	import { onMount } from "svelte"
	import { fade } from "svelte/transition"
	import DownloadButton from "../../components/DownloadButton.svelte"

	let checkedOS = false
	let osNames
	let fileExtensions
	let blogIDs

	onMount(async () => {
		let userAgent = navigator.userAgent
		osNames = ["Unknown OS"]
		if (userAgent.indexOf("Win") != -1) {
			osNames = ["Windows", "Linux", "MacOS"]
			fileExtensions = ["cmd", "sh", "command"]
			blogIDs = ["0", "1", "2"]
		} else if (userAgent.indexOf("Linux") != -1) {
			if (userAgent.indexOf("Debian") != -1) {
				osNames = ["Debian", "Windows", "MacOS"]
				fileExtensions = ["sh", "cmd", "command"]
				blogIDs = ["1", "0", "2"]
			} else if (userAgent.indexOf("Ubuntu") != -1) {
				osNames = ["Ubuntu", "Windows", "MacOS"]
				fileExtensions = ["sh", "cmd", "command"]
				blogIDs = ["1", "0", "2"]
			} else {
				osNames = ["Linux", "Windows", "MacOS"]
				fileExtensions = ["sh", "cmd", "command"]
				blogIDs = ["1", "0", "2"]
			}
		} else if (userAgent.indexOf("Mac") != -1) {
			osNames = ["MacOs", "Windows", "Linux"]
			fileExtensions = ["command", "cmd", "sh"]
			blogIDs = ["2", "0", "1"]
		}
		checkedOS = true
	})
</script>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	{#if checkedOS}
		<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
			<h1 class="text-xl py-16 text-center text-amber-500 dark:text-amber-100 md:text-3xl">
				{osNames[0]} was detected as your operating system.
			</h1>
			<p class="text-lg text-center pt-4">
				For an automated install script download the following file:
				<DownloadButton
					url={`https://github.com/torwent/wasp-setup/releases/latest/download/setup.${fileExtensions[0]}`}
					text={`setup.${fileExtensions[0]}`}
				/>
			</p>
			<p class="text-center pb-24">
				For a manual instalation guide for {osNames[0]} you can go
				<a
					href="/blog/{blogIDs[0]}"
					class="font-semibold text-amber-500 dark:text-amber-200 hover:underline">here</a
				>.
			</p>

			<p class="text-center pt-24">
				For a {osNames[1]} install script you can get it here:
				<a
					href="https://github.com/torwent/wasp-setup/releases/latest/download/setup.{fileExtensions[1]}"
					class="font-semibold hover:underline text-amber-400 dark:text-amber-100"
				>
					setup.{fileExtensions[1]}
				</a>
			</p>
			<p class="text-center">
				For a manual instalation guide for {osNames[1]} you can go
				<a
					href="/blog/{blogIDs[1]}"
					class="font-semibold hover:underline text-amber-400 dark:text-amber-100">here</a
				>.
			</p>

			<p class="text-center pt-8">
				For a {osNames[2]} install script you can get it here:
				<a
					href="https://github.com/torwent/wasp-setup/releases/latest/download/setup.{fileExtensions[2]}"
					class="font-semibold  hover:underline text-amber-400 dark:text-amber-100"
				>
					setup.{fileExtensions[2]}
				</a>
			</p>
			<p class="text-center">
				For a manual instalation guide for {osNames[2]} you can go
				<a
					href="/blog/{blogIDs[2]}"
					class="font-semibold hover:underline text-amber-400 dark:text-amber-100">here</a
				>.
			</p>
		</div>
	{:else}
		<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
			<h1 class="text-xl py-16 text-center text-amber-500 dark:text-amber-100 md:text-3xl">
				Checking your operating system...
			</h1>
		</div>
	{/if}
</div>
