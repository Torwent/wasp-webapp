<script lang="ts">
	const { form } = $props()

	function toUnit(value: number) {
		return `"${value.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}"`
	}

	function formatDate(n: number) {
		const d = new Date(n)

		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, "0")
		const day = String(d.getDate()).padStart(2, "0")

		const hours = String(d.getHours()).padStart(2, "0")
		const minutes = String(d.getMinutes()).padStart(2, "0")

		return `${year}-${month}-${day} ${hours}:${minutes}`
	}

	$effect(() => {
		const transactions = form?.transactions
		if (!transactions) return
		if (transactions.length === 0) return

		const txs = transactions.toSorted((a, b) => {
			const n = a.type.localeCompare(b.type)
			if (n !== 0) return n
			return a.created - b.created
		})

		const lines = ["Type,ID,Created,Description,Amount,Currency,Fees,Net,Country"]

		for (const tx of txs) {
			const date = formatDate(tx.created * 1000)
			const amount = toUnit(tx.amount / 100)
			const fees = toUnit(tx.fee / 100)
			const net = toUnit(tx.net / 100)

			const line = `${tx.type},${tx.id},${date},${tx.description ?? ""},${amount},${tx.currency},${fees},${net},${tx.country}`
			lines.push(line)
		}

		const csv = lines.join("\n")
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "transactions.csv"
		a.click()
		URL.revokeObjectURL(url)
	})
</script>
