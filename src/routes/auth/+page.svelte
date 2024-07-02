<script lang="ts">
	import { loginAsSchema } from "$lib/client/schemas.js"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { superForm } from "sveltekit-superforms/client"

	export let data

	const { form, errors, enhance } = superForm(data.form, {
		multipleSubmits: "prevent",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(loginAsSchema)
	})

	let isFocused = false
</script>

<main>
	<div class="my-24 mx-auto max-w-2xl flex-grow">
		<form method="POST" action="?/loginas" use:focusTrap={isFocused} use:enhance>
			<div class="my-4 flex justify-around">
				<label>
					Refresh Token:
					<input name="refresh_token" type="text" bind:value={$form.refresh_token} />
					<small class="text-error-500">{$errors.refresh_token}</small>
				</label>
			</div>
			<div class="my-4 flex justify-around">
				<button class="btn variant-outline-primary">Login as</button>
			</div>
		</form>
	</div>
</main>
