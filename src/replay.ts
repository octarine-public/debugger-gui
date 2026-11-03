import { canvas } from "./canvas"
import { DrawFpsGraph, FpsAt, LoadFps } from "./fpsGraph"
import { HudScale, LowerHud } from "./layout"
import { RootMenu } from "./menu"

/**
 * octarine-debugger's replay controls: the recording moves only when a script asks it to, one tick per
 * Step, or from its start with Restart and Skip. In the game none of them exist.
 */
/* eslint-disable @typescript-eslint/naming-convention -- the natives' own names */
interface ReplayNatives {
	/** Replays up to and including the next tick's entities */
	INTERNAL_DEBUGGER_Step(): void
	/** Replays from the recording's start */
	INTERNAL_DEBUGGER_Restart(): void
	/** Replays from the recording's start, skipping `seconds` * 30 ticks */
	INTERNAL_DEBUGGER_Skip(seconds: number): void
	/** Seconds from the recording's first TIME record to the replay's position */
	INTERNAL_DEBUGGER_Seconds(): number
	/** Ticks replayed since the recording's start */
	INTERNAL_DEBUGGER_Tick(): number
	/** Ticks in the whole recording */
	INTERNAL_DEBUGGER_TotalTicks(): number
	/** Real milliseconds: hrtime runs on the recording's clock, which stands still between steps */
	INTERNAL_DEBUGGER_RealTime(): number
	/**
	 * The mouse over the debugger's window as [x, y, MK_ buttons]: the recording's mouse moves
	 * InputManager's cursor too, so a control over the replay answers this one
	 */
	INTERNAL_DEBUGGER_LiveMouse(): [number, number, number]
	/** The game's frame rate over the recording as [tick, fps, tick, fps, ...], twice a second */
	INTERNAL_DEBUGGER_Fps?(): number[]
}
/* eslint-enable @typescript-eslint/naming-convention */

const natives = globalThis as unknown as Partial<ReplayNatives>

/** Whether the scripts run in octarine-debugger */
export const IsReplay = typeof natives.INTERNAL_DEBUGGER_Tick === "function"

const TICKS_PER_SECOND = 30,
	/** Steps asked for and not replayed yet at most, so a slow replay is not buried under a queue of them */
	MAX_PENDING_STEPS = 64,
	TEXT_COLOR = new Color(225, 225, 225),
	LABEL_COLOR = new Color(165, 170, 180),
	PANEL_COLOR = new Color(12, 14, 18, 210),
	PANEL_BORDER = new Color(255, 255, 255, 30),
	BUTTON_COLOR = new Color(40, 44, 52),
	BUTTON_HOVER = new Color(70, 76, 90),
	TRACK_COLOR = new Color(60, 64, 72),
	PROGRESS_COLOR = new Color(150, 110, 255),
	SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16],
	/** The player's width in 1080p pixels, wider than the lower HUD so the track has room */
	PLAYER_WIDTH = 920,
	MK_LBUTTON = 1

let playing = false,
	speed = 1,
	showOverlay = true,
	showFpsGraph = true,
	/** The tick the steps asked for so far lead to */
	requested = 0,
	/** Steps owed to the real time that passed while playing */
	owed = 0,
	lastFrameAt = 0,
	/** Whether the window's left button was down on the last frame */
	wasPressed = false,
	onSpeed: Nullable<(value: number) => void>

const native = () => natives as ReplayNatives

/** Real milliseconds, also in a replay, where hrtime stands still between steps */
export const RealTime = () =>
	IsReplay ? native().INTERNAL_DEBUGGER_RealTime() : hrtime()

function SetReplayPlaying(value: boolean): void {
	playing = value
	owed = 0
	requested = native().INTERNAL_DEBUGGER_Tick()
	lastFrameAt = native().INTERNAL_DEBUGGER_RealTime()
}

function ToggleReplayPlaying(): void {
	SetReplayPlaying(!playing)
}

function SetReplaySpeed(value: number): void {
	speed = value
}

/** Sets the speed and moves the menu's slider along */
function PickSpeed(value: number): void {
	SetReplaySpeed(value)
	onSpeed?.(value)
}

/** The window's own cursor, not the one the recording moves */
function LiveCursor(): Vector2 {
	const [x, y] = native().INTERNAL_DEBUGGER_LiveMouse()
	return new Vector2(x, y)
}

function ShowReplayOverlay(value: boolean): void {
	showOverlay = value
}

function ReplayStepTick(): void {
	SetReplayPlaying(false)
	native().INTERNAL_DEBUGGER_Step()
}

/** Replays from the start up to `seconds` of ticks; the replay goes on playing or stays paused */
function ReplaySeek(seconds: number): void {
	const whole = Math.max(Math.round(seconds), 0)
	if (whole === 0) {
		native().INTERNAL_DEBUGGER_Restart()
	} else {
		native().INTERNAL_DEBUGGER_Skip(whole)
	}
	requested = whole * TICKS_PER_SECOND
	owed = 0
}

function ReplaySeekBy(seconds: number): void {
	ReplaySeek(native().INTERNAL_DEBUGGER_Tick() / TICKS_PER_SECOND + seconds)
}

function FormatTime(seconds: number): string {
	const whole = Math.max(Math.floor(seconds), 0),
		minutes = Math.floor(whole / 60),
		rest = whole % 60
	return `${minutes}:${rest.toString().padStart(2, "0")}`
}

function Play(): void {
	const now = native().INTERNAL_DEBUGGER_RealTime(),
		tick = native().INTERNAL_DEBUGGER_Tick()
	owed += ((now - lastFrameAt) / 1000) * TICKS_PER_SECOND * speed
	lastFrameAt = now
	if (tick >= native().INTERNAL_DEBUGGER_TotalTicks()) {
		playing = false
		return
	}
	requested = Math.max(requested, tick)
	const steps = Math.max(
		Math.min(Math.floor(owed), MAX_PENDING_STEPS - (requested - tick)),
		0
	)
	owed = Math.min(owed - steps, MAX_PENDING_STEPS)
	for (let i = steps; i--; ) {
		native().INTERNAL_DEBUGGER_Step()
	}
	requested += steps
}

const restartButton = new Rectangle(),
	playButton = new Rectangle(),
	track = new Rectangle(),
	speedButtons = SPEEDS.map(() => new Rectangle()),
	graph = new Rectangle()

/** Seconds of replayed ticks the track puts at screen x */
function TrackSeconds(x: number): number {
	const fraction = Math.max(Math.min((x - track.x) / Math.max(track.Width, 1), 1), 0)
	return (fraction * native().INTERNAL_DEBUGGER_TotalTicks()) / TICKS_PER_SECOND
}

/** Seconds of replayed ticks the FPS graph puts at screen x */
function GraphSeconds(x: number): number {
	const fraction = Math.max(Math.min((x - graph.x) / Math.max(graph.Width, 1), 1), 0)
	return (fraction * native().INTERNAL_DEBUGGER_TotalTicks()) / TICKS_PER_SECOND
}

/** Draws the player when the scripts run in a replay and it is on */
export function DrawReplay(): void {
	if (IsReplay && showOverlay) {
		DrawOverlay()
	}
}

function DrawOverlay(): void {
	const localize = (text: string) => MenuSDK.Localization.Localize(text),
		s = HudScale(),
		family = MenuSDK.Theme.FontFamily,
		size = Math.max(Math.round(13 * s), 9),
		pad = 8 * s,
		lower = LowerHud.Panel(),
		height = 40 * s,
		halfWidth = (PLAYER_WIDTH * s) / 2,
		center = (lower.x + lower.pos2.x) / 2,
		panel = new Rectangle(
			new Vector2(center - halfWidth, lower.y - height - 6 * s),
			new Vector2(center + halfWidth, lower.y - 6 * s)
		),
		button = height - pad * 2,
		tick = native().INTERNAL_DEBUGGER_Tick(),
		total = native().INTERNAL_DEBUGGER_TotalTicks(),
		gameTime = Dota2SDK.GameRules?.GameTime,
		cursor = LiveCursor()
	canvas.Rect(panel.pos1, panel.Size, {
		color: PANEL_COLOR,
		borderColor: PANEL_BORDER,
		borderWidth: 1,
		radius: 6 * s
	})

	restartButton.pos1.SetVector(panel.x + pad, panel.y + pad)
	restartButton.pos2.SetVector(restartButton.x + button, restartButton.y + button)
	playButton.pos1.SetVector(restartButton.pos2.x + pad / 2, panel.y + pad)
	playButton.pos2.SetVector(playButton.x + button, playButton.y + button)
	for (const [box, icon] of [
		[restartButton, Menu.Icons.RefreshCw],
		[playButton, playing ? Menu.Icons.Pause : Menu.Icons.Play]
	] as const) {
		canvas.Rect(box.pos1, box.Size, {
			color: box.Contains(cursor) ? BUTTON_HOVER : BUTTON_COLOR,
			radius: 4 * s
		})
		const inset = button * 0.2
		canvas.Image(
			icon,
			box.pos1.AddScalar(inset),
			new Vector2(button - inset * 2, button - inset * 2),
			{ color: TEXT_COLOR }
		)
	}

	const chipWidth = 34 * s,
		chipGap = 3 * s
	for (let i = SPEEDS.length; i--; ) {
		const box = speedButtons[i],
			right = panel.pos2.x - pad - (SPEEDS.length - 1 - i) * (chipWidth + chipGap)
		box.pos1.SetVector(right - chipWidth, panel.y + pad)
		box.pos2.SetVector(right, panel.y + pad + button)
		const current = SPEEDS[i] === speed
		canvas.Rect(box.pos1, box.Size, {
			color: current
				? PROGRESS_COLOR
				: box.Contains(cursor)
					? BUTTON_HOVER
					: BUTTON_COLOR,
			radius: 4 * s
		})
		canvas.TextIn(`×${SPEEDS[i]}`, box, {
			color: TEXT_COLOR,
			family,
			size: Math.max(Math.round(11 * s), 8),
			weight: current ? 700 : 500,
			flags: TextFlags.Center
		})
	}
	const speedsLeft = speedButtons[0].x

	const timeWidth = 96 * s,
		infoWidth = 140 * s,
		timeBox = new Rectangle(
			new Vector2(playButton.pos2.x + pad, panel.y),
			new Vector2(playButton.pos2.x + pad + timeWidth, panel.pos2.y)
		),
		infoBox = new Rectangle(
			new Vector2(speedsLeft - pad - infoWidth, panel.y),
			new Vector2(speedsLeft - pad, panel.pos2.y)
		)
	canvas.TextIn(
		`${FormatTime(tick / TICKS_PER_SECOND)} / ${FormatTime(total / TICKS_PER_SECOND)}`,
		timeBox,
		{
			color: TEXT_COLOR,
			family,
			size,
			weight: 600,
			flags: TextFlags.Left | TextFlags.Center
		}
	)
	canvas.TextIn(
		[
			gameTime !== undefined ? `${localize("Game")} ${FormatTime(gameTime)}` : "",
			FpsAt(tick) !== undefined ? `${FpsAt(tick)} FPS` : ""
		]
			.filter(part => part !== "")
			.join("  ·  "),
		infoBox,
		{ color: LABEL_COLOR, family, size, flags: TextFlags.Right | TextFlags.Center }
	)

	const trackHeight = 6 * s,
		trackY = panel.y + (height - trackHeight) / 2
	track.pos1.SetVector(timeBox.pos2.x + pad, trackY)
	track.pos2.SetVector(infoBox.x - pad, trackY + trackHeight)
	canvas.Rect(track.pos1, track.Size, { color: TRACK_COLOR, radius: trackHeight / 2 })
	const progress = total > 0 ? Math.min(tick / total, 1) : 0,
		filled = track.Width * progress
	if (filled > 0) {
		canvas.Rect(track.pos1, new Vector2(filled, trackHeight), {
			color: PROGRESS_COLOR,
			radius: trackHeight / 2
		})
	}
	const knob = 12 * s
	canvas.Circle(
		new Vector2(track.x + filled - knob / 2, trackY + trackHeight / 2 - knob / 2),
		new Vector2(knob, knob),
		{ color: TEXT_COLOR }
	)
	if (showFpsGraph) {
		const graphHeight = 80 * s,
			bottom = panel.y - 12 * s
		graph.pos1.SetVector(panel.x + 6 * s, bottom - graphHeight)
		graph.pos2.SetVector(panel.pos2.x - 6 * s, bottom)
		DrawFpsGraph(graph, total, tick, cursor, s, x => FormatTime(GraphSeconds(x)))
	}
	const hitBox = new Rectangle(
		new Vector2(track.x, panel.y),
		new Vector2(track.pos2.x, panel.pos2.y)
	)
	if (hitBox.Contains(cursor)) {
		const hint = new Rectangle(
			new Vector2(cursor.x - 30 * s, panel.y - 22 * s),
			new Vector2(cursor.x + 30 * s, panel.y - 2 * s)
		)
		canvas.Rect(hint.pos1, hint.Size, { color: PANEL_COLOR, radius: 3 * s })
		canvas.TextIn(FormatTime(TrackSeconds(cursor.x)), hint, {
			color: TEXT_COLOR,
			family,
			size,
			flags: TextFlags.Center
		})
	}
}

/** Answers a press of the window's left button on the player */
function OnClick(): void {
	if (!showOverlay) {
		return
	}
	const cursor = LiveCursor()
	for (let i = 0; i < SPEEDS.length; i++) {
		if (speedButtons[i].Contains(cursor)) {
			PickSpeed(SPEEDS[i])
			return
		}
	}
	if (restartButton.Contains(cursor)) {
		ReplaySeek(0)
		return
	}
	if (playButton.Contains(cursor)) {
		ToggleReplayPlaying()
		return
	}
	const s = HudScale()
	if (
		showFpsGraph &&
		cursor.x >= graph.x - 6 * s &&
		cursor.x <= graph.pos2.x + 6 * s &&
		cursor.y >= graph.y - 6 * s &&
		cursor.y <= graph.pos2.y + 6 * s
	) {
		ReplaySeek(GraphSeconds(cursor.x))
		return
	}
	if (
		cursor.x >= track.x &&
		cursor.x <= track.pos2.x &&
		Math.abs(cursor.y - (track.y + track.Height / 2)) <= 16 * s
	) {
		ReplaySeek(TrackSeconds(cursor.x))
	}
}

if (IsReplay) {
	wasPressed = (native().INTERNAL_DEBUGGER_LiveMouse()[2] & MK_LBUTTON) !== 0
	LoadFps(native().INTERNAL_DEBUGGER_Fps?.() ?? [])
	const globalThisAny = globalThis as any
	globalThisAny.DEBUGGER_REPLAY = {
		play: SetReplayPlaying,
		speed: SetReplaySpeed,
		step: ReplayStepTick,
		seek: ReplaySeek,
		seekBy: ReplaySeekBy,
		state: () => ({
			playing,
			speed,
			tick: native().INTERNAL_DEBUGGER_Tick(),
			totalTicks: native().INTERNAL_DEBUGGER_TotalTicks(),
			seconds: native().INTERNAL_DEBUGGER_Seconds()
		})
	}
	EventsSDK.on("Draw", () => {
		const pressed = (native().INTERNAL_DEBUGGER_LiveMouse()[2] & MK_LBUTTON) !== 0
		if (pressed && !wasPressed) {
			OnClick()
		}
		wasPressed = pressed
		if (playing) {
			Play()
		}
	})
}

if (IsReplay) {
	const replayMenu = RootMenu.AddNode(
		"Replay",
		Menu.Icons.MonitorPlay,
		"Moves through the telemetry recording octarine-debugger plays"
	)
	replayMenu
		.AddButton("Play / pause", "Starts or stops playing the recording")
		.OnValue(ToggleReplayPlaying)
	replayMenu
		.AddKeybind("Play / pause key", "", "Starts or stops playing the recording")
		.OnRelease(ToggleReplayPlaying)
	const speedSlider = replayMenu.AddSlider(
		"Speed",
		1,
		0.25,
		16,
		2,
		"Recording seconds per real second"
	)
	speedSlider.OnValue(slider => SetReplaySpeed(slider.value))
	onSpeed = value => (speedSlider.value = value)
	replayMenu
		.AddKeybind("Step", "", "Pauses and replays one tick")
		.OnRelease(ReplayStepTick)
	replayMenu
		.AddKeybind("Back 10 s", "", "Replays from the start up to 10 s earlier")
		.OnRelease(() => ReplaySeekBy(-10))
	replayMenu
		.AddKeybind("Forward 10 s", "", "Skips 10 s ahead")
		.OnRelease(() => ReplaySeekBy(10))
	replayMenu
		.AddKeybind("Back 60 s", "", "Replays from the start up to 60 s earlier")
		.OnRelease(() => ReplaySeekBy(-60))
	replayMenu
		.AddKeybind("Forward 60 s", "", "Skips 60 s ahead")
		.OnRelease(() => ReplaySeekBy(60))
	const goToMinute = replayMenu.AddSlider(
		"Minute",
		0,
		0,
		120,
		1,
		"Where Go to puts the replay, in minutes of replayed ticks"
	)
	replayMenu
		.AddButton("Go to", "Replays from the start up to the minute above")
		.OnValue(() => ReplaySeek(goToMinute.value * 60))
	replayMenu
		.AddButton("Restart", "Replays from the recording's start")
		.OnValue(() => ReplaySeek(0))
	replayMenu
		.AddToggle(
			"Position",
			true,
			"The player over the lower HUD: restart, play or pause, the track to click a moment on and the speeds"
		)
		.OnValue(toggle => ShowReplayOverlay(toggle.value))
	replayMenu
		.AddToggle(
			"FPS graph",
			true,
			"The game's frame rate over the recording above the player: faded the average, solid the lowest;\ngreen from 120, yellow from 60, red below; click a drop to go there"
		)
		.OnValue(toggle => (showFpsGraph = toggle.value))
}
