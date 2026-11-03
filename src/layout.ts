/**
 * Where the game's HUD sits, worked out from the window alone. octarine-debugger has no Panorama, so
 * GUIInfo, which measures the live panels, has nothing to read; these boxes follow the 1080p HUD
 * scaled to the window's height.
 */

const rect = (x: number, y: number, width: number, height: number) =>
	new Rectangle(new Vector2(x, y), new Vector2(x + width, y + height))

export const HudScale = () => RendererSDK.WindowSize.y / 1080

const SLOT_WIDTH = 62,
	SLOT_HEIGHT = 35,
	SLOT_GAP = 3,
	CLOCK_WIDTH = 130,
	CLOCK_HEIGHT = 52,
	SCORE_WIDTH = 56,
	SCORE_HEIGHT = 36,
	BAR_HEIGHT = 4

export const TopBar = {
	Clock(): Rectangle {
		const s = HudScale(),
			width = CLOCK_WIDTH * s
		return rect((RendererSDK.WindowSize.x - width) / 2, 0, width, CLOCK_HEIGHT * s)
	},
	Score(radiant: boolean): Rectangle {
		const s = HudScale(),
			clock = this.Clock(),
			width = SCORE_WIDTH * s
		return rect(radiant ? clock.x - width : clock.pos2.x, 0, width, SCORE_HEIGHT * s)
	},
	/** The portrait of team slot `slot` (0 to 4, from the clock outwards on the dire side) */
	Slot(radiant: boolean, slot: number): Rectangle {
		const s = HudScale(),
			step = (SLOT_WIDTH + SLOT_GAP) * s,
			score = this.Score(radiant),
			x = radiant
				? score.x - (5 - slot) * step
				: score.pos2.x + SLOT_GAP * s + slot * step
		return rect(x, 0, SLOT_WIDTH * s, SLOT_HEIGHT * s)
	},
	/** The health (0) or mana (1) bar under a portrait */
	Bar(portrait: Rectangle, row: number): Rectangle {
		const s = HudScale()
		return rect(
			portrait.x,
			portrait.pos2.y + (1 + row * (BAR_HEIGHT + 1)) * s,
			portrait.Width,
			BAR_HEIGHT * s
		)
	},
	Team(radiant: boolean): Rectangle {
		const first = this.Slot(radiant, 0),
			last = this.Slot(radiant, 4),
			s = HudScale(),
			left = Math.min(first.x, last.x),
			right = Math.max(first.pos2.x, last.pos2.x)
		return rect(
			left - SLOT_GAP * s,
			0,
			right - left + SLOT_GAP * 2 * s,
			(SLOT_HEIGHT + 2 * (BAR_HEIGHT + 1) + 4) * s
		)
	}
}

const MINIMAP_SIZE = 262

export const MinimapBox = (): Rectangle => {
	const size = MINIMAP_SIZE * HudScale()
	return rect(0, RendererSDK.WindowSize.y - size, size, size)
}

const LOWER_WIDTH = 700,
	LOWER_HEIGHT = 150

export const LowerHud = {
	Panel(): Rectangle {
		const s = HudScale(),
			width = LOWER_WIDTH * s,
			height = LOWER_HEIGHT * s
		return rect(
			(RendererSDK.WindowSize.x - width) / 2,
			RendererSDK.WindowSize.y - height,
			width,
			height
		)
	}
}
