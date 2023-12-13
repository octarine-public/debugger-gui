import {
	Color,
	GUIInfo,
	RendererSDK,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

const storedFrameCount = 60
const lastFramesCalls: number[] = []
const State = RootMenu.AddToggle("Show FPS", true)
export function DrawFPS(): void {
	if (!State.value) {
		return
	}
	const screenSize = RendererSDK.WindowSize
	const xOffset = GUIInfo.ScaleWidth(8, screenSize),
		yOffset = GUIInfo.ScaleHeight(8, screenSize),
		size = GUIInfo.ScaleHeight(22, screenSize)
	if (lastFramesCalls.length === storedFrameCount) {
		for (let i = 1; i < storedFrameCount; i++) {
			lastFramesCalls[i - 1] = lastFramesCalls[i]
		}
	} else {
		lastFramesCalls.push(0)
	}

	lastFramesCalls[lastFramesCalls.length - 1] = hrtime()

	let avgRendertimeSum = 0
	for (let i = 1; i < lastFramesCalls.length; i++) {
		avgRendertimeSum += lastFramesCalls[i] - lastFramesCalls[i - 1]
	}

	const text = Math.ceil(1000 / (avgRendertimeSum / lastFramesCalls.length)).toString()
	const textSize = RendererSDK.GetTextSize(text, RendererSDK.DefaultFontName, size)
	RendererSDK.Text(
		text,
		new Vector2(screenSize.x - textSize.x - xOffset, yOffset),
		Color.Yellow,
		RendererSDK.DefaultFontName,
		size
	)
}
