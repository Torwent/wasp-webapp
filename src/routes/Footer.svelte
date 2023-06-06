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
				<h4 class="mb-6 text-sm font-semibold uppercase">Resources</h4>
				<ul>
					<li><a href="/setup">Setup</a></li>
					<li><a href="https://torwent.github.io/SRL-T">SRL-T Documentation</a></li>
					<li><a href="https://torwent.github.io/WaspLib">WaspLib Documentation</a></li>
					<li><a href="https://github.com/villavu/Simba">Simba repo</a></li>
					<li><a href="https://github.com/villavu/SRL-Development">SRL repo</a></li>
					<li><a href="https://github.com/Torwent/WaspLib">WaspLib repo</a></li>
				</ul>
			</nav>
			<nav>
				<h4 class="mb-6 text-sm font-semibold uppercase">Special thanks:</h4>
				<ul>
					<li><a href="/devs/Slacky">Jarl Holta</a></li>
					<li><a href="/devs/Olly">Olly</a></li>
					<li><a href="/devs">Many more devs...</a></li>
				</ul>
			</nav>
			<nav>
				<h4 class="mb-6 text-sm font-semibold uppercase">Legal</h4>
				<ul>
					<li><a href="/">Privacy Policy</a></li>
					<li><a href="/">Terms &amp; Conditions</a></li>
				</ul>
			</nav>
		</div>
	</header>
	<footer class="sm:flex sm:items-center sm:justify-between p-8 sm:p-12">
		<span class="text-sm sm:text-center">
			© 2022 <a href={$page.url.origin}>WaspScripts™</a>
			. All Rights Reserved.
		</span>
		<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
			<a href="https://github.com/torwent">
				<Github />
			</a>
			<a href="/">
				<Globe />
			</a>
		</div>
	</footer>
</footer>
