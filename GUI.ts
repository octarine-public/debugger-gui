import { Color, EventsSDK, GUIInfo, Input, InputEventSDK, Rectangle, RendererSDK, Vector2 } from "github.com/octarine-public/wrapper/index"
import { RootMenu } from "./menu"

declare global {
	var INTERNAL_DEBUGGER_Step: () => void
	var INTERNAL_DEBUGGER_Restart: () => void
}

const rewind = new Rectangle(),
	play_resume = new Rectangle()
let is_paused = true
function TogglePause(): void {
	is_paused = !is_paused
	latest_data_update = is_paused
		? 0
		: hrtime()
}

const GUINode = RootMenu.AddNode("Internal Debugger")
const draw = GUINode.AddToggle("Draw", true)
GUINode.AddKeybind("Play/Resume").OnPressed(() => TogglePause())
const speed = GUINode.AddSlider("Speed", 1, 0, 80, 1)
const buttons_background = new Color(0x16, 0x20, 0x34)
let latest_data_update = 0
export function DrawGUI(): void {
	if (globalThis.INTERNAL_DEBUGGER_Step === undefined)
		return
	if (latest_data_update !== 0) {
		const tick_time = 1000 / (30 * speed.value),
			time_passed = hrtime() - latest_data_update
		const ticks_passed = Math.floor(time_passed / tick_time)
		if (ticks_passed !== 0) {
			for (let i = 0; i < ticks_passed; i++)
				globalThis.INTERNAL_DEBUGGER_Step()
			latest_data_update = 0
		}
	}
	if (!draw.value)
		return
	const screen_size = RendererSDK.WindowSize
	const button_size = new Vector2(
		GUIInfo.ScaleWidth(32, screen_size),
		GUIInfo.ScaleHeight(32, screen_size),
	)
	rewind.Width = play_resume.Width = button_size.x
	rewind.Height = play_resume.Height = button_size.y

	const buttons_gap = 6
	const buttons_width = button_size.x * 2 + buttons_gap
	let current_x = (
		GUIInfo.TopBar.TimeOfDayTimeUntil.x
		+ (GUIInfo.TopBar.TimeOfDayTimeUntil.Width - buttons_width) / 2
	)
	rewind.x = current_x
	current_x += button_size.x + buttons_gap
	play_resume.x = current_x

	const current_y = GUIInfo.TopBar.TimeOfDayTimeUntil.y - button_size.y
	rewind.y = play_resume.y = current_y

	RendererSDK.FilledRect(rewind.pos1, button_size, buttons_background)
	RendererSDK.Image(
		"panorama/images/hud/reborn/icon_courier_inuse_psd.vtex_c",
		rewind.pos1,
		-1,
		button_size,
	)
	RendererSDK.FilledRect(play_resume.pos1, button_size, buttons_background)
	RendererSDK.Image(
		is_paused
			? "panorama/images/hud/dvr_play_png.vtex_c"
			: "panorama/images/hud/dvr_pause_png.vtex_c",
		play_resume.pos1,
		-1,
		button_size,
	)
}

InputEventSDK.on("MouseKeyDown", () => {
	if (!draw.value || globalThis.INTERNAL_DEBUGGER_Step === undefined)
		return
	const mouse_pos = Input.CursorOnScreen
	if (rewind.Contains(mouse_pos))
		globalThis.INTERNAL_DEBUGGER_Restart()
	else if (play_resume.Contains(mouse_pos))
		TogglePause()
})

EventsSDK.on("PostDataUpdate", () => {
	if (!is_paused)
		latest_data_update = hrtime()
})
