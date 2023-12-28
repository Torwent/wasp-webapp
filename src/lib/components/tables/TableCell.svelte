<script lang="ts">
	export let alignment: string = "center"
	export let padding: number = 3
</script>

<td>
	<span class="flex justify-{alignment} text-{alignment} py-{padding.toString()}">
		<slot />
	</span>
</td>
