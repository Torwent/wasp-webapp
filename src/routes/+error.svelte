<script>
	import { page } from "$app/stores"
	console.log($page.error)
</script>

<h1>{$page.status}: {$page.error.message}</h1>
