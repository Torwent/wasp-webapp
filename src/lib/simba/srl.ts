export interface TPoint {
	x: number
	y: number
}

export interface TRectangle {
	readonly Top: TPoint
	readonly Right: TPoint
	readonly Btm: TPoint
	readonly Left: TPoint
}

export interface TBox {
	readonly x1: number
	readonly y1: number
	readonly x2: number
	readonly y2: number
}

function distToLineEx(p: TPoint, sA: TPoint, sB: TPoint) {
	let result = { nearest: { x: sA.x, y: sA.y }, result: 0 }

	const dx = sB.x - sA.x
	const dy = sB.y - sA.y
	const d = dx * dx + dy * dy

	if (d === 0) {
		result.result = Math.hypot(p.x - sA.x, p.y - sA.y)
		return result
	}

	const f = ((p.x - sA.x) * dx + (p.y - sA.y) * dy) / d

	if (f < 0) {
		result.result = Math.hypot(p.x - sA.x, p.y - sA.y)
	} else if (f > 1) {
		result.nearest = sB
		result.result = Math.hypot(p.x - sB.x, p.y - sB.y)
	}

	result.nearest.x = Math.round(sA.x + f * dx)
	result.nearest.y = Math.round(sA.y + f * dy)
	result.result = Math.hypot(p.x - result.nearest.x, p.y - result.nearest.y)
	return result
}

function nearestEdgeTo(p: TPoint, rect: TRectangle) {
	let result = distToLineEx(p, rect.Top, rect.Left)

	let finalResult = result.nearest
	let best = result.result

	let tmpResult = distToLineEx(p, rect.Left, rect.Btm)
	let x = tmpResult.nearest
	let dist = tmpResult.result

	if (dist < best) {
		finalResult = x
		best = dist
	}

	tmpResult = distToLineEx(p, rect.Btm, rect.Right)
	x = tmpResult.nearest
	dist = tmpResult.result

	if (dist < best) {
		finalResult = x
		best = dist
	}

	tmpResult = distToLineEx(p, rect.Right, rect.Top)
	x = tmpResult.nearest
	dist = tmpResult.result

	if (dist < best) {
		finalResult = x
		best = dist
	}

	return finalResult
}

function truncatedGauss(left = 0, right = 1, cutoff = 0) {
	if (cutoff <= 0) cutoff = 4.0

	let result = cutoff + 1
	while (result >= cutoff) {
		//need to implement nzRandom
		result = Math.abs(
			Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
		)
	}

	return (result / cutoff) * (right - left) + left
}

function normalRange(min: number, max: number, cutoff = 0) {
	if (cutoff <= 0) cutoff = 4.0

	if (Math.random() < 0.5) {
		return Math.round((max + min) / 2.0 + truncatedGauss(0, (max - min) / 2, cutoff))
	}
	return Math.round((max + min) / 2.0 - truncatedGauss(0, (max - min) / 2, cutoff))
}

function rotatePoint(p: TPoint, angle: number, center: TPoint) {
	const radians = angle * (Math.PI / 180) // Convert to radians
	const rotatedX = Math.round(
		Math.cos(radians) * (p.x - center.x) - Math.sin(radians) * (p.y - center.y) + center.x
	)
	const rotatedY = Math.round(
		Math.sin(radians) * (p.x - center.x) + Math.cos(radians) * (p.y - center.y) + center.y
	)
	return { x: rotatedX, y: rotatedY }
}

function randomPoint(R: TRectangle, cutoff = 0) {
	const a = Math.atan2(R.Left.y - R.Top.y, R.Left.x - R.Top.y)
	const x = (R.Top.x + R.Right.x + R.Btm.x + R.Left.x) / 4
	const y = (R.Top.y + R.Right.y + R.Btm.y + R.Left.y) / 4
	const x1 = x - Math.hypot(R.Left.y - R.Top.y, R.Left.x - R.Top.x) / 2
	const y1 = y - Math.hypot(R.Left.y - R.Btm.y, R.Left.x - R.Btm.x) / 2
	const x2 = x + Math.hypot(R.Left.y - R.Top.y, R.Left.x - R.Top.x) / 2
	const y2 = y + Math.hypot(R.Left.y - R.Btm.y, R.Left.x - R.Btm.x) / 2

	const result = {
		x: Math.round(normalRange(x1 + 1, x2 - 1, cutoff)),
		y: Math.round(normalRange(y1 + 1, y2 - 1, cutoff))
	}

	const center = { x: (x2 + x1) / 2 + Math.random() - 0.5, y: (y2 + y1) / 2 + Math.random() - 0.5 }

	return rotatePoint(result, a, center)
}

function skewedRand(mode: number, lo: number, hi: number, cutoff = 0) {
	let top = lo

	if (cutoff <= 0) cutoff = 4.0

	if (Math.random() * (hi - lo) > mode - lo) top = hi

	let result = cutoff + 1

	while (result >= cutoff) {
		//todo: implement nzRandom
		result = Math.abs(
			Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
		)
	}

	return (result / cutoff) * (top - mode) + mode
}

export function rowp(from: TPoint, rect: TRectangle, force = -0.9, smoothness = Math.PI / 12) {
	const p = randomPoint(rect, 4.0 / 1.5)
	const e = nearestEdgeTo(p, rect)
	const dist = Math.hypot(p.x - e.x, p.y - e.y)
	const t = Math.atan2(p.y - from.y, p.x - from.x) + (Math.random() - 0.5) * smoothness

	return {
		x: Math.round(p.x + Math.cos(t) * skewedRand(dist * force, 0, dist)),
		y: Math.round(p.y + Math.sin(t) * skewedRand(dist * force, 0, dist))
	}
}
