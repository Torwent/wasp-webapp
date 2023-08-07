<script lang="ts">
	import { page } from "$app/stores"
	import { Github, Globe } from "lucide-svelte"
	import Logo from "./Logo.svelte"
</script>

<footer class="variant-soft" style="text-decoration: none !important;">
	<header class="md:flex md:justify-between md:m-8 md:pt-8">
		<div class="mb-6 md:mb-0">
			<a href="/" aria-label="Navigate to home page">
				<Logo selected={true} />
			</a>
		</div>
		<div class="grid grid-cols-2 gap-8 sm:gap-4 sm:grid-cols-3">
			<nav>
				<span class="mb-6 text-sm font-semibold uppercase">Resources</span>
				<ul>
					<li><a href="/setup" target="_blank">Setup</a></li>
					<li><a href="https://torwent.github.io/SRL-T target="_blank"" >SRL-T Documentation</a></li>
					<li><a href="https://torwent.github.io/WaspLib" target="_blank">WaspLib Documentation</a></li>
					<li><a href="https://github.com/villavu/Simba" target="_blank">Simba repo</a></li>
					<li><a href="https://github.com/villavu/SRL-Development" target="_blank">SRL repo</a></li>
					<li><a href="https://github.com/Torwent/WaspLib" target="_blank">WaspLib repo</a></li>
				</ul>
			</nav>
			<nav>
				<span class="mb-6 text-sm font-semibold uppercase">Special thanks:</span>
				<ul>
					<li><a href="/developers/Slacky" target="_blank">Jarl Holta</a></li>
					<li><a href="/developers/Olly" target="_blank">Olly</a></li>
					<li><a href="/developers" target="_blank">Many more devs...</a></li>
				</ul>
			</nav>
			<nav>
				<span class="mb-6 text-sm font-semibold uppercase">Legal</span>
				<ul>
					<li><a href="/" target="_blank">Privacy Policy</a></li>
					<li><a href="/" target="_blank">Terms &amp; Conditions</a></li>
				</ul>
			</nav>
		</div>
	</header>
	<footer class="sm:flex sm:items-center sm:justify-between p-8 sm:p-12">
		<span class="text-sm sm:text-center">
			This webapp is open source! Checkout <a
				class="permalink text-secondary-500"
				href="https://github.com/torwent/web-app"
				target="_blank"
			>
				WaspScripts source code
			</a>
			!
		</span>
		<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
			<a
				href="https://github.com/torwent"
				aria-label="Navigate to GitHub"
				target="_blank"
				class="permalink text-secondary-500"
			>
				<Github />
			</a>
			<a
				href="https://waspscripts.com"
				aria-label="Navigate to main site"
				class="permalink text-secondary-500"
				target="_blank"
			>
				<Globe />
			</a>
		</div>
	</footer>
</footer>
