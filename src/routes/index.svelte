<script>
	import TodoForm from "../components/TodoForm.svelte"
	import TodoList from "../components/TodoList.svelte"
	import { todos } from "../stores/todoStore.js"
</script>

<main>
	<h1 class="text-2xl font-bold text-center text-gray-600 md:text-3xl">My Todos</h1>
	<TodoForm />
	{#each $todos as todo}
		<TodoList {todo} index={todo.id} />
	{/each}
</main>
