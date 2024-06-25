<script lang="ts">
	import { Github, Globe } from "lucide-svelte"
	import Logo from "./Logo.svelte"
	import { page } from "$app/stores"
	import { WaspScripters } from "$lib/client/supabase"
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
						<li>
							<a href="https://torwent.github.io/SRL-T" target="_blank">SRL-T Documentation</a>
						</li>
						<li>
							<a href="https://torwent.github.io/WaspLib" target="_blank">WaspLib Documentation</a>
						</li>
						<li><a href="https://github.com/villavu/Simba" target="_blank">Simba repo</a></li>
						<li>
							<a href="https://github.com/villavu/SRL-Development" target="_blank">SRL repo</a>
						</li>
						<li><a href="https://github.com/Torwent/WaspLib" target="_blank">WaspLib repo</a></li>
					</ul>
				</nav>
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Special thanks:</span>
					<ul>
						{#await WaspScripters.getRandomScripters($page.data.supabaseClient)}
							{#each Array(5) as _}
								<li>Loading...</li>
							{/each}
						{:then scripters}
							{#each scripters as scripter}
								<li><a href="/scripters/{scripter.url}">{scripter.profiles.username}</a></li>
							{/each}
							<li><a href="/scripters">Many more devs...</a></li>
						{/await}
					</ul>
				</nav>
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Legal</span>
					<ul>
						<li><a href="/legal/privacy_policy">Privacy Policy</a></li>
						<li><a href="/legal/user_tos">User Terms &amp; Conditions</a></li>
						<li><a href="/legal/scripter_tos">Scripter Terms &amp; Conditions</a></li>
					</ul>
				</nav>
			</div>
		</header>
		<footer class="sm:flex sm:items-center sm:justify-between p-8 sm:p-12">
			<span class="text-sm sm:text-center">
				This webapp is open source! Checkout
				<a
					class="permalink text-secondary-500"
					href="https://github.com/torwent/wasp-webapp"
					target="_blank"
				>
					WaspScripts source code
				</a>
				!
			</span>
			<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
				<a
					href="https://github.com/torwent"
					target="_blank"
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
