<script lang="ts">
	import { Github, Globe } from "lucide-svelte"
	import Logo from "./Logo.svelte"
</script>

<footer class="variant-soft-surface">
	<div class="mx-8 md:mx-0">
		<header class="grid md:flex md:justify-between md:m-8 md:pt-8">
			<div class="mx-auto lg:mx-0 my-6">
				<a href="/" aria-label="Navigate to home page">
					<Logo selected={true} />
				</a>
			</div>
			<div class="grid grid-cols-2 gap-8 sm:gap-4 sm:grid-cols-3">
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Resources</span>
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
					<span class="mb-6 text-sm font-semibold uppercase">Special thanks:</span>
					<ul>
						<li><a href="/developers/Slacky">Jarl Holta</a></li>
						<li><a href="/developers/Olly">Olly</a></li>
						<li><a href="/developers">Many more devs...</a></li>
					</ul>
				</nav>
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Legal</span>
					<ul>
						<li><a href="/">Privacy Policy</a></li>
						<li><a href="/">Terms &amp; Conditions</a></li>
					</ul>
				</nav>
			</div>
		</header>
		<footer class="sm:flex sm:items-center sm:justify-between p-8 sm:p-12">
			<span class="text-sm sm:text-center">
				This webapp is open source! Checkout
				<a class="permalink text-secondary-500" href="https://github.com/torwent/wasp-webapp">
					WaspScripts source code
				</a>
				!
			</span>
			<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
				<a
					href="https://github.com/torwent"
					aria-label="Navigate to GitHub"
					class="permalink text-secondary-500"
				>
					<Github />
				</a>
				<a
					href="https://waspscripts.com"
					aria-label="Navigate to main site"
					class="permalink text-secondary-500"
				>
					<Globe />
				</a>
			</div>
		</footer>
	</div>
</footer>
