<script lang="ts">
	let props = $props()
	let { children } = $derived(props)
	let alignment: string = props.alignment ?? "center"
	let padding: number = props.padding ?? 3
</script>

<td>
	<span class="flex justify-{alignment} text-{alignment} py-{padding.toString()}">
		{@render children()}
	</span>
</td>
