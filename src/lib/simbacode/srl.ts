export interface TPoint {
	x: number
	y: number
}

export interface TRectangle {
	Top: TPoint
	Right: TPoint
	Btm: TPoint
	Left: TPoint
}

export interface TBox {
	x1: number
	y1: number
	x2: number
	y2: number
}

const DistToLineEx = (p: TPoint, sA: TPoint, sB: TPoint) => {
	let dx, dy, d
	let f
	let result: { nearest: TPoint; result: number } = { nearest: { x: 0, y: 0 }, result: 0 }

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

const NearestEdgeTo = (p: TPoint, Rect: TRectangle) => {
	let best, dist
	let x
	let result = DistToLineEx(p, Rect.Top, Rect.Left)
	let tempResult = { nearest: { x: 0, y: 0 }, result: 0 }
	let fResult: TPoint

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

const NormalRange = (Min: number, Max: number, CUTOFF = 0) => {
	if (CUTOFF <= 0) CUTOFF = 4.0

	let Result

	if (Math.random() < 0.5) {
		Result = Math.round((Max + Min) / 2.0 + TruncatedGauss(0, (Max - Min) / 2, CUTOFF))
	} else {
		Result = Math.round((Max + Min) / 2.0 - TruncatedGauss(0, (Max - Min) / 2, CUTOFF))
	}

	return Result
}

const rotatePoint = (p: TPoint, angle: number, center: TPoint) => {
	angle = angle * (Math.PI / 180) // Convert to radians
	let rotatedX = Math.round(
		Math.cos(angle) * (p.x - center.x) - Math.sin(angle) * (p.y - center.y) + center.x
	)
	let rotatedY = Math.round(
		Math.sin(angle) * (p.x - center.x) + Math.cos(angle) * (p.y - center.y) + center.y
	)
	return { x: rotatedX, y: rotatedY }
}

const RandomPoint = (R: TRectangle, CUTOFF = 0) => {
	let Result: TPoint = { x: 0, y: 0 }
	let a = Math.atan2(R.Left.y - R.Top.y, R.Left.x - R.Top.y)
	let x = (R.Top.x + R.Right.x + R.Btm.x + R.Left.x) / 4
	let y = (R.Top.y + R.Right.y + R.Btm.y + R.Left.y) / 4
	let x1 = x - Math.hypot(R.Left.y - R.Top.y, R.Left.x - R.Top.x) / 2
	let y1 = y - Math.hypot(R.Left.y - R.Btm.y, R.Left.x - R.Btm.x) / 2
	let x2 = x + Math.hypot(R.Left.y - R.Top.y, R.Left.x - R.Top.x) / 2
	let y2 = y + Math.hypot(R.Left.y - R.Btm.y, R.Left.x - R.Btm.x) / 2

	Result.x = Math.round(NormalRange(x1 + 1, x2 - 1, CUTOFF))
	Result.y = Math.round(NormalRange(y1 + 1, y2 - 1, CUTOFF))

	let center: TPoint = { x: 0, y: 0 }
	center.x = (x2 + x1) / 2 + Math.random() - 0.5
	center.y = (y2 + y1) / 2 + Math.random() - 0.5
	return rotatePoint(Result, a, center)
}

const SkewedRand = (Mode: number, Lo: number, Hi: number, CUTOFF = 0) => {
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

export const Rowp = (from: TPoint, rect: TRectangle, force = -0.9, Smoothness = Math.PI / 12) => {
	let p,
		e,
		Result: TPoint = { x: 0, y: 0 }
	let t, dist: number

	p = RandomPoint(rect, 4.0 / 1.5)
	e = NearestEdgeTo(p, rect)
	dist = Math.hypot(p.x - e.x, p.y - e.y)

	t = Math.atan2(p.y - from.y, p.x - from.x) + (Math.random() - 0.5) * Smoothness
	Result.x = Math.round(p.x + Math.cos(t) * SkewedRand(dist * force, 0, dist))
	Result.y = Math.round(p.y + Math.sin(t) * SkewedRand(dist * force, 0, dist))

	return Result
}
