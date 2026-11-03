import { canvas } from "./canvas"

/**
 * The game's frame rate over the recording, from the PERF_REPORT records it wrote twice a second
 * while its window had focus: one column per few pixels of the track, the average faded and the
 * lowest over it, so a drop stands out and a click on it seeks there.
 */

const COLUMN = 3,
	GOOD_FPS = 120,
	LOW_FPS = 60,
	GOOD_COLOR = new Color(70, 190, 90),
	MID_COLOR = new Color(225, 190, 60),
	LOW_COLOR = new Color(225, 70, 60),
	GRID_COLOR = new Color(255, 255, 255, 25),
	LABEL_COLOR = new Color(165, 170, 180),
	PANEL_COLOR = new Color(12, 14, 18, 210),
	PANEL_BORDER = new Color(255, 255, 255, 30),
	TEXT_COLOR = new Color(225, 225, 225),
	CURSOR_COLOR = new Color(255, 255, 255, 140),
	POSITION_COLOR = new Color(150, 110, 255)

interface Column {
	min: number
	avg: number
}

/** The samples' ticks and frame rates, read once: the recording does not change under the scripts */
let ticks: Uint32Array = new Uint32Array(),
	rates: Uint16Array = new Uint16Array(),
	/** The frame rate the graph tops out at */
	ceiling = 1,
	columns: Nullable<Column>[] = [],
	columnsFor = ""

export function LoadFps(flat: readonly number[]): void {
	const count = flat.length >> 1
	ticks = new Uint32Array(count)
	rates = new Uint16Array(count)
	for (let i = 0; i < count; i++) {
		ticks[i] = flat[i * 2]
		rates[i] = flat[i * 2 + 1]
	}
	const sorted = Array.from(rates).sort((a, b) => a - b)
	ceiling = Math.max(sorted[Math.floor(sorted.length * 0.99)] ?? 1, 1)
	columnsFor = ""
}

export const HasFps = () => rates.length !== 0

/** The index of the first sample at or after `tick` */
function FirstAt(tick: number): number {
	let low = 0,
		high = ticks.length
	while (low < high) {
		const middle = (low + high) >> 1
		if (ticks[middle] < tick) {
			low = middle + 1
		} else {
			high = middle
		}
	}
	return low
}

/** The frame rate the game reported last before `tick`, undefined before the first report */
export function FpsAt(tick: number): Nullable<number> {
	const index = FirstAt(tick + 1) - 1
	return index >= 0 ? rates[index] : undefined
}

function Summarize(fromTick: number, toTick: number): Nullable<Column> {
	let min = Infinity,
		sum = 0,
		count = 0
	for (let i = FirstAt(fromTick); i < ticks.length && ticks[i] < toTick; i++) {
		min = Math.min(min, rates[i])
		sum += rates[i]
		count++
	}
	return count === 0 ? undefined : { min, avg: sum / count }
}

function Rebuild(width: number, totalTicks: number): void {
	const key = `${width}:${totalTicks}`
	if (key === columnsFor) {
		return
	}
	columnsFor = key
	const count = Math.max(Math.floor(width / COLUMN), 1)
	columns = new Array(count)
	for (let i = 0; i < count; i++) {
		columns[i] = Summarize((i * totalTicks) / count, ((i + 1) * totalTicks) / count)
	}
}

const ColorOf = (fps: number) =>
	fps >= GOOD_FPS ? GOOD_COLOR : fps >= LOW_FPS ? MID_COLOR : LOW_COLOR

/** The column under screen x, for the hint */
function ColumnAt(graph: Rectangle, x: number): Nullable<Column> {
	const index = Math.floor(((x - graph.x) / graph.Width) * columns.length)
	return columns[Math.min(Math.max(index, 0), columns.length - 1)]
}

/**
 * Draws the graph in `graph`, whose x runs over the recording as the track's does; `hint` formats
 * the time at screen x for the hover line
 */
export function DrawFpsGraph(
	graph: Rectangle,
	totalTicks: number,
	currentTick: number,
	cursor: Vector2,
	scale: number,
	timeAt: (x: number) => string
): void {
	const pad = 6 * scale,
		frame = new Rectangle(
			new Vector2(graph.x - pad, graph.y - pad),
			new Vector2(graph.pos2.x + pad, graph.pos2.y + pad)
		)
	canvas.Rect(frame.pos1, frame.Size, {
		color: PANEL_COLOR,
		borderColor: PANEL_BORDER,
		borderWidth: 1,
		radius: 6 * scale
	})
	const family = MenuSDK.Theme.FontFamily,
		size = Math.max(Math.round(11 * scale), 8)
	if (!HasFps() || totalTicks <= 0) {
		canvas.TextIn(
			MenuSDK.Localization.Localize("The recording holds no FPS"),
			graph,
			{
				color: LABEL_COLOR,
				family,
				size,
				flags: TextFlags.Center
			}
		)
		return
	}
	Rebuild(Math.round(graph.Width), totalTicks)
	for (const line of [GOOD_FPS, LOW_FPS]) {
		if (line < ceiling) {
			const y = graph.pos2.y - (line / ceiling) * graph.Height
			canvas.Rect(new Vector2(graph.x, y), new Vector2(graph.Width, 1), {
				color: GRID_COLOR
			})
		}
	}
	const step = graph.Width / columns.length,
		barWidth = Math.max(step - 1, 1)
	for (let i = 0; i < columns.length; i++) {
		const column = columns[i]
		if (column === undefined) {
			continue
		}
		const x = graph.x + i * step,
			avgHeight = Math.min(column.avg / ceiling, 1) * graph.Height,
			minHeight = Math.min(column.min / ceiling, 1) * graph.Height,
			color = ColorOf(column.min)
		canvas.Rect(
			new Vector2(x, graph.pos2.y - avgHeight),
			new Vector2(barWidth, avgHeight),
			{
				color: new Color(color.r, color.g, color.b, 70)
			}
		)
		canvas.Rect(
			new Vector2(x, graph.pos2.y - minHeight),
			new Vector2(barWidth, minHeight),
			{
				color
			}
		)
	}
	canvas.Rect(
		new Vector2(
			graph.x + Math.min(currentTick / totalTicks, 1) * graph.Width - 1,
			graph.y
		),
		new Vector2(2, graph.Height),
		{ color: POSITION_COLOR }
	)
	canvas.TextIn(`${ceiling} FPS`, graph, {
		color: LABEL_COLOR,
		family,
		size,
		flags: TextFlags.Left | TextFlags.Top
	})
	if (!frame.Contains(cursor)) {
		return
	}
	const hoverX = Math.min(Math.max(cursor.x, graph.x), graph.pos2.x),
		hovered = ColumnAt(graph, hoverX)
	canvas.Rect(new Vector2(hoverX, graph.y), new Vector2(1, graph.Height), {
		color: CURSOR_COLOR
	})
	const text =
			hovered === undefined
				? `${timeAt(hoverX)}  ·  ${MenuSDK.Localization.Localize("no FPS (window out of focus)")}`
				: `${timeAt(hoverX)}  ·  ${Math.round(hovered.avg)} FPS  ·  min ${hovered.min}`,
		width = 200 * scale,
		hint = new Rectangle(
			new Vector2(hoverX - width / 2, frame.y - 24 * scale),
			new Vector2(hoverX + width / 2, frame.y - 4 * scale)
		)
	canvas.Rect(hint.pos1, hint.Size, { color: PANEL_COLOR, radius: 3 * scale })
	canvas.TextIn(text, hint, {
		color: TEXT_COLOR,
		family,
		size,
		flags: TextFlags.Center
	})
}
