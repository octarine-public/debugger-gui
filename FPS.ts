import { RootMenu } from "./menu"
import { Color, GUIInfo, RendererSDK, Vector2 } from "./wrapper/Imports"

const stored_frame_count = 60
const last_frames_calls: number[] = []
const State = RootMenu.AddToggle("Show FPS", true)
export function DrawFPS(): void {
	if (!State.value)
		return
	const screen_size = RendererSDK.WindowSize
	const x_offset = GUIInfo.ScaleWidth(8, screen_size),
		y_offset = GUIInfo.ScaleHeight(8, screen_size),
		size = GUIInfo.ScaleHeight(22, screen_size)
	if (last_frames_calls.length === stored_frame_count) {
		for (let i = 1; i < stored_frame_count; i++)
			last_frames_calls[i - 1] = last_frames_calls[i]
	} else
		last_frames_calls.push(0)
	last_frames_calls[last_frames_calls.length - 1] = hrtime()
	let avg_rendertime_sum = 0
	for (let i = 1; i < last_frames_calls.length; i++)
		avg_rendertime_sum += last_frames_calls[i] - last_frames_calls[i - 1]
	const text = Math.ceil(1000 / (avg_rendertime_sum / last_frames_calls.length)).toString()
	const text_size = RendererSDK.GetTextSize(text, RendererSDK.DefaultFontName, size)
	RendererSDK.Text(
		text,
		new Vector2(
			screen_size.x - text_size.x - x_offset,
			y_offset,
		),
		Color.Yellow,
		RendererSDK.DefaultFontName,
		size,
	)
}
