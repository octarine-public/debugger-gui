import {
	DOTAGameUIState,
	EventsSDK,
	GameState
} from "github.com/octarine-public/wrapper/index"

import { DrawAttachments } from "./Attachments"
import { DrawCursor } from "./Cursor"
import { DrawEntities } from "./Entities"
import { DrawFPS } from "./FPS"
import { DrawGUI } from "./GUI"
import { DrawMinimap } from "./Minimap"
import { DrawTopPanel } from "./TopPanel"

EventsSDK.on("PreDraw", () => {
	if (GameState.UIState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME) {
		return
	}
	DrawAttachments()
	DrawEntities()
	DrawMinimap()
	DrawTopPanel()
	DrawCursor()
	DrawFPS()
	DrawGUI()
})
