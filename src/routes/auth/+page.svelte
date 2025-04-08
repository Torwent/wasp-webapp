<script lang="ts">
	import { loginAsSchema } from "$lib/client/schemas"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { superForm } from "sveltekit-superforms/client"

	let { data } = $props()

	const { form, errors, enhance } = superForm(data.form, {
		multipleSubmits: "prevent",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(loginAsSchema)
	})
</script>

<main class="min-h-screen">
	<div class="mx-auto my-24 max-w-2xl flex-grow">
		<form method="POST" action="?/loginas" use:enhance>
			<div class="my-4 flex justify-around">
				<label class="label">
					<span class="label-text"> Refresh Token: </span>
					<input name="refresh_token" type="text" class="input" bind:value={$form.refresh_token} />
					<small class="text-error-500">{$errors.refresh_token}</small>
				</label>
			</div>
			<div class="my-4 flex justify-around">
				<button class="btn preset-outlined-primary-500">Login as</button>
			</div>
		</form>
	</div>
</main>
