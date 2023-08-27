<script lang="ts">
	export let data
	let { profile, developer, stats } = data
	$: ({ profile, developer, stats } = data)
</script>

<main class="m-4">
	<h3 class="text-center">
		Current user: {profile.username}
		<small>({profile.id})</small>
	</h3>

	<div class="my-8 grid place-items-center">
		<a href="/developers/{developer.url}" class="btn variant-filled-secondary">Developer profile</a>
	</div>

	<div class="grid">
		<div class="card variant-outline-surface m-4 p-4">
			<h4>Total scripts</h4>
			{stats.total_user_scripts} / {stats.total_scripts}
		</div>

		<div class="card variant-outline-surface m-4 p-4">
			<h4>Total premium scripts</h4>
			{stats.total_user_premium_scripts} / {stats.total_premium_scripts}
		</div>

		<div class="card variant-outline-surface m-4 p-4">
			<h4>Monthly downloads</h4>
			{stats.month_user_downloads} / {stats.month_downloads}
		</div>

		<div class="card variant-outline-surface m-4 p-4">
			<h4>Premium monthly downloads</h4>
			{stats.month_premium_user_downloads} / {stats.month_premium_downloads}
		</div>
	</div>
</main>
