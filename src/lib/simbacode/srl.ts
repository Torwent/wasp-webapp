const DistToLineEx = (p, sA, sB) => {
	let dx, dy, d
	let f
	let result = { nearest: {}, result: 0 }

	result.nearest.x = sA.x
	result.nearest.y = sA.y
	dx = sB.x - sA.x
	dy = sB.y - sA.y
	d = dx * dx + dy * dy

	if (d === 0) {
		result.result = Math.hypot(p.x - sA.x, p.y - sA.y)
		return result
	}

	f = ((p.x - sA.x) * dx + (p.y - sA.y) * dy) / d

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

const NearestEdgeTo = (p, Rect) => {
	let best, dist
	let x
	let result = DistToLineEx(p, Rect.Top, Rect.Left)
	let tempResult = { nearest: {}, result: 0 }
	let fResult = { nearest: {}, result: 0 }

	fResult = result.nearest
	best = result.result

	tempResult = DistToLineEx(p, Rect.Left, Rect.Btm)
	x = tempResult.nearest
	dist = tempResult.result

	if (dist < best) {
		fResult = x
		best = dist
	}

	tempResult = DistToLineEx(p, Rect.Btm, Rect.Right)
	x = tempResult.nearest
	dist = tempResult.result

	if (dist < best) {
		fResult = x
		best = dist
	}

	tempResult = DistToLineEx(p, Rect.Right, Rect.Top)
	x = tempResult.nearest
	dist = tempResult.result

	if (dist < best) {
		fResult = x
		best = dist
	}

	return fResult
}

const TruncatedGauss = (Left = 0, Right = 1, CUTOFF = 0) => {
	if (CUTOFF <= 0) CUTOFF = 4.0

	let Result = CUTOFF + 1
	while (Result >= CUTOFF) {
		//need to implement nzRandom
		Result = Math.abs(
			Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
		)
	}

	return (Result / CUTOFF) * (Right - Left) + Left
}

const NormalRange = (Min, Max, CUTOFF = 0) => {
	if (CUTOFF <= 0) CUTOFF = 4.0

	let Result

	if (Math.random() < 0.5) {
		Result = Math.round((Max + Min) / 2.0 + TruncatedGauss(0, (Max - Min) / 2, CUTOFF))
	} else {
		Result = Math.round((Max + Min) / 2.0 - TruncatedGauss(0, (Max - Min) / 2, CUTOFF))
	}

	return Result
}

const rotatePoint = (point, angle, center) => {
	angle = angle * (Math.PI / 180) // Convert to radians
	let rotatedX = Math.round(
		Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y - center.y) + center.x
	)
	let rotatedY = Math.round(
		Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y
	)
	return { x: rotatedX, y: rotatedY }
}

const RandomPoint = (Rect, CUTOFF = 0) => {
	let Result = {}
	let a = Math.atan2(Rect.Left.y - Rect.Top.y, Rect.Left.x - Rect.Top.y)
	let x = (Rect.Top.x + Rect.Right.x + Rect.Btm.x + Rect.Left.x) / 4
	let y = (Rect.Top.y + Rect.Right.y + Rect.Btm.y + Rect.Left.y) / 4
	let x1 = x - Math.hypot(Rect.Left.y - Rect.Top.y, Rect.Left.x - Rect.Top.x) / 2
	let y1 = y - Math.hypot(Rect.Left.y - Rect.Btm.y, Rect.Left.x - Rect.Btm.x) / 2
	let x2 = x + Math.hypot(Rect.Left.y - Rect.Top.y, Rect.Left.x - Rect.Top.x) / 2
	let y2 = y + Math.hypot(Rect.Left.y - Rect.Btm.y, Rect.Left.x - Rect.Btm.x) / 2

	Result.x = Math.round(NormalRange(x1 + 1, x2 - 1, CUTOFF))
	Result.y = Math.round(NormalRange(y1 + 1, y2 - 1, CUTOFF))

	let center = {}
	center.x = (x2 + x1) / 2 + Math.random() - 0.5
	center.y = (y2 + y1) / 2 + Math.random() - 0.5
	return rotatePoint(Result, a, center)
}

const SkewedRand = (Mode, Lo, Hi, CUTOFF = 0) => {
	let top = Lo

	if (CUTOFF <= 0) CUTOFF = 4.0

	if (Math.random() * (Hi - Lo) > Mode - Lo) top = Hi

	let Result = CUTOFF + 1

	while (Result >= CUTOFF) {
		//todo: implement nzRandom
		Result = Math.abs(
			Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
		)
	}

	return (Result / CUTOFF) * (top - Mode) + Mode
}

export const Rowp = (from, rect, force = -0.9, Smoothness = Math.PI / 12) => {
	let p = {}
	let e = {}
	let t, dist
	let Result = {}

	p = RandomPoint(rect, 4.0 / 1.5)

	e = NearestEdgeTo(p, rect)

	dist = Math.hypot(p.x - e.x, p.y - e.y)

	t = Math.atan2(p.y - from.y, p.x - from.x) + (Math.random() - 0.5) * Smoothness
	Result.x = Math.round(p.x + Math.cos(t) * SkewedRand(dist * force, 0, dist))
	Result.y = Math.round(p.y + Math.sin(t) * SkewedRand(dist * force, 0, dist))

	return Result
}
