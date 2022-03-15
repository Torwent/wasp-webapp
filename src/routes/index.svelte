<script>
	import Discord from "../components/Discord.svelte"
	import TodoForm from "../components/TodoForm.svelte"
	import TodoList from "../components/TodoList.svelte"
	import { todos } from "../stores/todoStore.js"

	import { fade } from "svelte/transition"
</script>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
		<h1 class="text-2xl font-bold text-center md:text-3xl py-16">
			<div class="py-4">WaspBot</div>
			<div>
				100%
				<span class="bg-clip-border animate-character pl-1"> color </span>
				, 100% open source.
			</div>
		</h1>

		<h2 class="text-center py-6">For help or questions join the discord community!</h2>
		<Discord />
		<TodoForm />
		{#each $todos as todo}
			<TodoList {todo} index={todo.id} />
		{/each}
	</div>
</div>

<style>
	.animate-character {
		background-image: linear-gradient(
			90deg,
			rgba(255, 0, 0, 1) 0%,
			rgba(255, 136, 0, 1) 10%,
			rgba(255, 248, 0, 1) 20%,
			rgba(56, 255, 0, 1) 30%,
			rgba(0, 255, 149, 1) 40%,
			rgba(0, 255, 255, 1) 50%,
			rgba(0, 138, 255, 1) 60%,
			rgba(34, 0, 255, 1) 70%,
			rgba(188, 0, 255, 1) 80%,
			rgba(255, 0, 189, 1) 90%,
			rgba(255, 0, 0, 1) 100%
		);
		background-size: 200% auto;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: textclip 10s linear infinite;
		display: inline-block;
	}

	@keyframes textclip {
		to {
			background-position: 200% center;
		}
	}
</style>
