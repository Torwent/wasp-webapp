<script>
	import { onMount } from "svelte"

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

{#if checkedOS}
	<div>
		<h1 class="text-xl py-16 text-center text-gray-300 md:text-3xl">
			{osNames[0]} was detected as your operating system.
		</h1>
		<p class="text-lg text-center pt-4">
			Use
			<a
				href="https://github.com/Torwent/waspbot-setup/releases/download/latest/setup.{fileExtensions[0]}"
				class="hover:underline text-blue-500"
			>
				setup.{fileExtensions[0]}
			</a>
			for an automated install of WaspBot.
		</p>
		<p class="text-center pb-24">
			For a manual instalation guide for {osNames[0]} you can go
			<a href="/blog/{blogIDs[0]}" class="text-blue-500 hover:underline">here</a>.
		</p>

		<p class="text-center pt-24">
			For a {osNames[1]} install script you can get it here:
			<a
				href="https://github.com/Torwent/waspbot-setup/releases/download/latest/setup.{fileExtensions[1]}"
				class="hover:underline text-blue-500"
			>
				setup.{fileExtensions[1]}
			</a>
		</p>
		<p class="text-center">
			For a manual instalation guide for {osNames[1]} you can go
			<a href="/blog/{blogIDs[1]}" class="text-blue-500 hover:underline">here</a>.
		</p>

		<p class="text-center pt-8">
			For a {osNames[2]} install script you can get it here:
			<a
				href="https://github.com/Torwent/waspbot-setup/releases/download/latest/setup.{fileExtensions[2]}"
				class="hover:underline text-blue-500"
			>
				setup.{fileExtensions[2]}
			</a>
		</p>
		<p class="text-center">
			For a manual instalation guide for {osNames[2]} you can go
			<a href="/blog/{blogIDs[2]}" class="text-blue-500 hover:underline">here</a>.
		</p>
	</div>
{:else}Checking your operating system...{/if}
