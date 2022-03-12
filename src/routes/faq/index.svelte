<script>
	import { questions, commonErrors } from "../../stores/questionStore"
	import Card from "../../components/Card.svelte"
</script>

<div class="pb-16">
	<Card title="FAQ" entries={questions} />
	<Card title="Common Errors" entries={commonErrors} />
</div>
