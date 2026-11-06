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
	/** Replays from the recording's start, skipping that many ticks; missing in older debuggers */
	INTERNAL_DEBUGGER_SkipTicks?(ticks: number): void
	/**
	 * The server tick of every tick the replay goes through, [0] being the first's: the game's clock
	 * along the recording. Missing in older debuggers
	 */
	INTERNAL_DEBUGGER_ServerTicks?(): number[]
	/** Seconds from the recording's first TIME record to the replay's position */
	INTERNAL_DEBUGGER_Seconds(): number
	/** Ticks replayed since the recording's start */
	INTERNAL_DEBUGGER_Tick(): number
	/** Ticks in the whole recording */
	INTERNAL_DEBUGGER_TotalTicks(): number
	/**
	 * Replays from the start begun so far: a Restart or Skip has begun once this passes the count
	 * before it. Missing in older debuggers
	 */
	INTERNAL_DEBUGGER_Restarts?(): number
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
	/** Server ticks per second of game time */
	SERVER_TICKS_PER_SECOND = 30,
	/** Ticks a game time seek replays with the scripts before the moment, so it lands on it exactly */
	SEEK_LEAD_TICKS = 30,
	/** Ticks short of the moment past which a game time seek replays from the start again instead of stepping */
	SEEK_MAX_STEP_TICKS = 900,
	/** Replays from the start a game time seek makes at most before it steps the rest of the way */
	SEEK_MAX_SKIPS = 4,
	/** Ticks between the game clock anchors kept, unless the clock's offset moved (a pause) */
	ANCHOR_SPACING_TICKS = 900,
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
	onSpeed: Nullable<(value: number) => void>,
	/** The game time seek under way */
	gameTimeSeek: GameTimeSeek | undefined,
	/**
	 * The replay tick the scripts last had entities for: after a skip the replay is there a frame or more
	 * before the scripts are, and the entities they read are still the old ones
	 */
	scriptsTick = -1

/**
 * Where the replay saw the game clock: the server tick's seconds minus the game clock there are the time
 * before the horn and the pauses so far
 */
interface ClockAnchor {
	tick: number
	offset: number
}

/** A seek to a moment of the game clock, which ticks of the recording do not map to until replayed */
interface GameTimeSeek {
	/** The game clock's seconds to stop at */
	target: number
	/** The tick the last replay from the start skips to */
	skipTo: number
	/** Replays from the start so far */
	skips: number
	/** The tick the steps asked for so far lead to */
	stepTo: number
	/** Whether the replay played before the seek, and goes on playing after it */
	resume: boolean
}

const native = () => natives as ReplayNatives

/** The server tick of every replay tick; empty on a debugger without them */
const serverTicks: number[] = IsReplay
		? (native().INTERNAL_DEBUGGER_ServerTicks?.() ?? [])
		: [],
	/**
	 * The replay ticks a new server session starts at, where the server tick falls back: a recording
	 * can begin in the session before the match's
	 */
	sessionStarts: number[] = [0],
	/** The game clock where the replay saw it, by tick; at most one per {@link ANCHOR_SPACING_TICKS} */
	clockAnchors: ClockAnchor[] = []
/**
 * The replays from the start asked for so far: until the debugger begins the last one, its tick and the
 * scripts' entities are still those from before it
 */
let restartsAsked = IsReplay ? (native().INTERNAL_DEBUGGER_Restarts?.() ?? 0) : 0

/** Whether the debugger has begun the last replay from the start asked for; a debugger that cannot tell says yes */
function RestartBegun(): boolean {
	const restarts = native().INTERNAL_DEBUGGER_Restarts
	return restarts === undefined || restarts() >= restartsAsked
}
for (let i = 1; i < serverTicks.length; i++) {
	if (serverTicks[i] < serverTicks[i - 1]) {
		sessionStarts.push(i)
	}
}

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
	gameTimeSeek = undefined
	scriptsTick = -1
	restartsAsked++
	const whole = Math.max(Math.round(seconds), 0)
	if (whole === 0) {
		native().INTERNAL_DEBUGGER_Restart()
	} else {
		native().INTERNAL_DEBUGGER_Skip(whole)
	}
	requested = whole * TICKS_PER_SECOND
	owed = 0
}

/** Replays from the start, skipping `ticks` ticks; the tick it skips to */
function SkipTicks(ticks: number): number {
	restartsAsked++
	const whole = Math.max(Math.round(ticks), 0)
	if (whole === 0) {
		native().INTERNAL_DEBUGGER_Restart()
		return 0
	}
	const skipTicks = native().INTERNAL_DEBUGGER_SkipTicks
	if (skipTicks !== undefined) {
		skipTicks(whole)
		return whole
	}
	const seconds = Math.max(Math.round(whole / TICKS_PER_SECOND), 1)
	native().INTERNAL_DEBUGGER_Skip(seconds)
	return seconds * TICKS_PER_SECOND
}

/** The server tick's seconds after replay tick `tick` (ticks replayed), undefined where unknown */
function ServerSecondsAt(tick: number): number | undefined {
	const serverTick = serverTicks[Math.min(Math.max(tick, 1), serverTicks.length) - 1]
	return serverTick !== undefined && serverTick !== 0
		? serverTick / SERVER_TICKS_PER_SECOND
		: undefined
}

/**
 * The game clock at the replay's tick, once the game runs (not in the hero pick), from the game rules'
 * fields and the tick's server tick: GameRules.GameTime goes by a raw time the scripts move on between
 * ticks and keep stale after a skip. Undefined while the scripts' entities are not the tick's
 */
function GameClock(): number | undefined {
	const rules = Dota2SDK.GameRules,
		tick = native().INTERNAL_DEBUGGER_Tick(),
		serverTick = serverTicks[tick - 1]
	if (
		rules === undefined ||
		serverTick === undefined ||
		scriptsTick !== tick ||
		!RestartBegun()
	) {
		return undefined
	}
	const pausedTicks =
			typeof rules.TotalPausedTicks === "number" ? rules.TotalPausedTicks : 0,
		now =
			rules.IsPaused && rules.PauseStartTick > 0
				? rules.PauseStartTick
				: serverTick,
		rawTime = (now - pausedTicks) / SERVER_TICKS_PER_SECOND
	switch (rules.GameState) {
		case Dota2SDK.DOTAGameState.DOTA_GAMERULES_STATE_PRE_GAME:
			return rawTime - rules.StateTransitionTime
		case Dota2SDK.DOTAGameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS:
		case Dota2SDK.DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME:
			return rawTime - rules.GameStartTime - rules.GameLoadTime
		default:
			return undefined
	}
}

/** Keeps where the replay is now as a game clock anchor; the game clock */
function LearnClockOffset(): number | undefined {
	const gameTime = GameClock(),
		tick = native().INTERNAL_DEBUGGER_Tick(),
		serverSeconds = ServerSecondsAt(tick)
	if (gameTime === undefined || serverSeconds === undefined) {
		return gameTime
	}
	const offset = serverSeconds - gameTime
	let at = clockAnchors.length
	while (at > 0 && clockAnchors[at - 1].tick > tick) {
		at--
	}
	const before = clockAnchors[at - 1]
	if (
		before === undefined ||
		tick - before.tick >= ANCHOR_SPACING_TICKS ||
		Math.abs(offset - before.offset) > 0.5 ||
		SessionStart(before.tick) !== SessionStart(tick)
	) {
		clockAnchors.splice(at, 0, { tick, offset })
	}
	return gameTime
}

/** The replay tick the server session of replay tick `tick` starts at */
function SessionStart(tick: number): number {
	let start = 0
	for (const sessionStart of sessionStarts) {
		if (sessionStart >= tick) {
			break
		}
		start = sessionStart
	}
	return start
}

/** The anchor nearest `tick` in its session: the last before it, else the first after it */
function AnchorNear(tick: number): ClockAnchor | undefined {
	const session = SessionStart(tick)
	let found: ClockAnchor | undefined
	for (const anchor of clockAnchors) {
		if (SessionStart(anchor.tick) !== session) {
			continue
		}
		if (anchor.tick > tick && found !== undefined) {
			break
		}
		found = anchor
		if (anchor.tick > tick) {
			break
		}
	}
	return found
}

/** The game clock at replay tick `tick` as the anchors give it; undefined until the replay saw the game */
function GameTimeAt(tick: number): number | undefined {
	const serverSeconds = ServerSecondsAt(tick),
		anchor = AnchorNear(tick)
	return serverSeconds !== undefined && anchor !== undefined
		? serverSeconds - anchor.offset
		: undefined
}

/**
 * The first replay tick the game clock reaches `gameTime` at, as the anchors give it: the anchor seen
 * last before that moment, else the first after it (pauses between them move it on). Without anchors it
 * takes the last session and no time before the horn, so it lands early
 */
function TickAtGameTime(gameTime: number): number {
	let anchor: ClockAnchor | undefined
	for (const candidate of clockAnchors) {
		const at = ServerSecondsAt(candidate.tick)! - candidate.offset
		if (at > gameTime && anchor !== undefined) {
			break
		}
		anchor = candidate
		if (at > gameTime) {
			break
		}
	}
	const start =
			anchor !== undefined
				? SessionStart(anchor.tick)
				: sessionStarts[sessionStarts.length - 1],
		serverTick = (gameTime + (anchor?.offset ?? 0)) * SERVER_TICKS_PER_SECOND
	for (let i = start; i < serverTicks.length; i++) {
		if (
			serverTicks[i] >= serverTick ||
			(i > start && serverTicks[i] < serverTicks[i - 1])
		) {
			return i + 1
		}
	}
	return serverTicks.length
}

/**
 * Puts the replay at `gameTime` seconds of the game clock (52:26 is 3146; before the horn negative):
 * replays from the start to a little before where the server ticks put it, then steps to it with the
 * scripts. Where the game clock is not known yet it lands early and replays from the start once more
 */
function ReplaySeekGameTime(gameTime: number): void {
	if (!Number.isFinite(gameTime)) {
		return
	}
	if (serverTicks.length === 0) {
		console.log(
			"debugger-gui: this octarine-debugger has no server ticks, seeking to the game clock needs a newer one"
		)
		return
	}
	LearnClockOffset()
	const resume = playing || (gameTimeSeek?.resume ?? false)
	SetReplayPlaying(false)
	scriptsTick = -1
	const skipTo = SkipTicks(TickAtGameTime(gameTime) - SEEK_LEAD_TICKS)
	requested = skipTo
	owed = 0
	gameTimeSeek = { target: gameTime, skipTo, skips: 1, stepTo: skipTo, resume }
}

/** Moves a game time seek on by a frame: waits out its skip, then skips again or steps */
function SeekGameTimeFrame(seek: GameTimeSeek): void {
	const tick = native().INTERNAL_DEBUGGER_Tick(),
		total = native().INTERNAL_DEBUGGER_TotalTicks()
	if (
		!RestartBegun() ||
		tick < seek.skipTo ||
		tick < seek.stepTo ||
		scriptsTick !== tick
	) {
		return
	}
	const gameTime = LearnClockOffset()
	if (gameTime !== undefined && gameTime >= seek.target) {
		// landed past it: the offset was seen later than the moment, with pauses before it
		if (
			gameTime - seek.target > 1 &&
			seek.skips < SEEK_MAX_SKIPS &&
			seek.skipTo > 0
		) {
			Reskip(seek, TickAtGameTime(seek.target) - SEEK_LEAD_TICKS * 2)
			return
		}
		FinishGameTimeSeek(seek)
		return
	}
	if (tick >= total) {
		FinishGameTimeSeek(seek)
		return
	}
	const left =
		gameTime !== undefined
			? TickAtGameTime(seek.target) - tick
			: tick === seek.skipTo
				? 1
				: MAX_PENDING_STEPS
	if (left > SEEK_MAX_STEP_TICKS && seek.skips < SEEK_MAX_SKIPS) {
		Reskip(seek, tick + left - SEEK_LEAD_TICKS)
		return
	}
	const steps = Math.min(Math.max(left, 1), MAX_PENDING_STEPS, total - tick)
	for (let i = steps; i--; ) {
		native().INTERNAL_DEBUGGER_Step()
	}
	seek.stepTo = tick + steps
	requested = seek.stepTo
}

function Reskip(seek: GameTimeSeek, tick: number): void {
	scriptsTick = -1
	seek.skipTo = SkipTicks(tick)
	seek.stepTo = seek.skipTo
	seek.skips++
	requested = seek.skipTo
}

function FinishGameTimeSeek(seek: GameTimeSeek): void {
	gameTimeSeek = undefined
	if (seek.resume) {
		SetReplayPlaying(true)
	}
}

/** Seconds of the game clock written as 52:26, -1:30, 3146 or 52:26.5 */
function ParseGameTime(text: string): number | undefined {
	const match = /^\s*(-)?\s*(?:(\d+):)?(\d+(?:\.\d+)?)\s*$/.exec(text)
	if (match === null) {
		return undefined
	}
	const seconds =
		(match[2] !== undefined ? Number(match[2]) * 60 : 0) + Number(match[3])
	return match[1] !== undefined ? -seconds : seconds
}

/** The game clock as Dota shows it, with a minus before the horn */
function FormatGameTime(seconds: number): string {
	return seconds < 0 ? `-${FormatTime(-seconds)}` : FormatTime(seconds)
}

/** A track position's replay time, and the game clock there once known */
function TrackLabel(seconds: number): string {
	const gameTime = GameTimeAt(Math.round(seconds * TICKS_PER_SECOND))
	return gameTime !== undefined
		? `${FormatTime(seconds)} · ${FormatGameTime(gameTime)}`
		: FormatTime(seconds)
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
		gameTime = GameClock() ?? Dota2SDK.GameRules?.GameTime,
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
			gameTimeSeek !== undefined
				? `${localize("Going to")} ${FormatGameTime(gameTimeSeek.target)}`
				: gameTime !== undefined
					? `${localize("Game")} ${FormatGameTime(gameTime)}`
					: "",
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
		DrawFpsGraph(graph, total, tick, cursor, s, x => TrackLabel(GraphSeconds(x)))
	}
	const hitBox = new Rectangle(
		new Vector2(track.x, panel.y),
		new Vector2(track.pos2.x, panel.pos2.y)
	)
	if (hitBox.Contains(cursor)) {
		const label = TrackLabel(TrackSeconds(cursor.x)),
			halfHint = (label.length > 6 ? 56 : 30) * s,
			hint = new Rectangle(
				new Vector2(cursor.x - halfHint, panel.y - 22 * s),
				new Vector2(cursor.x + halfHint, panel.y - 2 * s)
			)
		canvas.Rect(hint.pos1, hint.Size, { color: PANEL_COLOR, radius: 3 * s })
		canvas.TextIn(label, hint, {
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
		/** To a moment of the game clock: seekGameTime("52:26") or seekGameTime(3146) */
		seekGameTime: (time: number | string) =>
			ReplaySeekGameTime(
				typeof time === "string" ? (ParseGameTime(time) ?? NaN) : time
			),
		state: () => ({
			playing,
			speed,
			tick: native().INTERNAL_DEBUGGER_Tick(),
			totalTicks: native().INTERNAL_DEBUGGER_TotalTicks(),
			seconds: native().INTERNAL_DEBUGGER_Seconds(),
			gameTime: GameClock(),
			seekingTo: gameTimeSeek?.target
		})
	}
	EventsSDK.on(
		"PostDataUpdate",
		() => (scriptsTick = native().INTERNAL_DEBUGGER_Tick())
	)
	EventsSDK.on("Draw", () => {
		const pressed = (native().INTERNAL_DEBUGGER_LiveMouse()[2] & MK_LBUTTON) !== 0
		if (pressed && !wasPressed) {
			OnClick()
		}
		wasPressed = pressed
		if (gameTimeSeek !== undefined) {
			SeekGameTimeFrame(gameTimeSeek)
		} else {
			if (playing) {
				Play()
			}
			LearnClockOffset()
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
	const goToTime = replayMenu.AddTextInput("Game time", "52:26")
	replayMenu
		.AddButton(
			"Go to",
			"Puts the replay at the game clock above (52:26, -1:30 before the horn)"
		)
		.OnValue(() => ReplaySeekGameTime(ParseGameTime(goToTime.text) ?? NaN))
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
