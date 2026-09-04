
import { RootMenu } from "./menu"

const TEAM_BG = "panorama/images/hud/reborn/top_bar_team_bg_psd.vtex_c"
const CLOCK_BG = "panorama/images/hud/reborn/bg_timer_psd.vtex_c"
const SLOTS = 5

const State = RootMenu.AddToggle("Top Panel", true)
const Players = EntityManager.GetEntitiesByClass(Player)

let visible = false
let root: Nullable<HTMLElement>
let radiantBackground: Nullable<HTMLElement>
let direBackground: Nullable<HTMLElement>
let radiantScoreBox: Nullable<HTMLElement>
let radiantScoreLabel: Nullable<HTMLElement>
let direScoreBox: Nullable<HTMLElement>
let direScoreLabel: Nullable<HTMLElement>
let clockBackground: Nullable<HTMLElement>
let clockBox: Nullable<HTMLElement>
let clockLabel: Nullable<HTMLElement>
const heroImages = new Array<Nullable<HTMLElement>>(SLOTS * 2)
const heroIDs = new Array<number>(SLOTS * 2).fill(-1)
const heroTextures = new Array<string>(SLOTS * 2).fill("")
const respawnBoxes = new Array<Nullable<HTMLElement>>(SLOTS * 2)
const respawnLabels = new Array<Nullable<HTMLElement>>(SLOTS * 2)
const slotUsed = new Array<boolean>(SLOTS * 2).fill(false)
const timerUsed = new Array<boolean>(SLOTS * 2).fill(false)

const imageStyle = { position: "absolute", display: "none", pointerEvents: "none" }

function Label(
	attachBox: React.RefCallback<HTMLElement>,
	attachLabel: React.RefCallback<HTMLElement>,
	style: Record<string, unknown>
): React.ReactElement {
	return React.createElement(
		"div",
		{
			ref: attachBox,
			style: {
				position: "absolute",
				display: "none",
				pointerEvents: "none",
				justifyContent: "center",
				color: "#ffffff",
				whiteSpace: "nowrap",
				fontEffect: "outline(1px #000000)",
				...style
			}
		},
		React.createElement("div", { ref: attachLabel })
	)
}

function AttachAt(
	store: Nullable<HTMLElement>[],
	index: number
): React.RefCallback<HTMLElement> {
	return element => (store[index] = element ?? undefined)
}

function AttachHeroAt(index: number): React.RefCallback<HTMLElement> {
	return element => {
		heroImages[index] = element ?? undefined
		heroIDs[index] = -1
		heroTextures[index] = ""
	}
}

function Render(): React.ReactNode {
	const children: React.ReactNode[] = [
		React.createElement("img", {
			ref: (element: Nullable<HTMLElement | null>) =>
				(radiantBackground = element ?? undefined),
			src: TEAM_BG,
			style: imageStyle
		}),
		React.createElement("img", {
			ref: (element: Nullable<HTMLElement | null>) =>
				(direBackground = element ?? undefined),
			src: TEAM_BG,
			style: { ...imageStyle, transform: "rotate(180deg)" }
		}),
		React.createElement("img", {
			ref: (element: Nullable<HTMLElement | null>) =>
				(clockBackground = element ?? undefined),
			src: CLOCK_BG,
			style: imageStyle
		}),
		Label(
			element => (radiantScoreBox = element ?? undefined),
			element => (radiantScoreLabel = element ?? undefined),
			{ alignItems: "flex-end" }
		),
		Label(
			element => (direScoreBox = element ?? undefined),
			element => (direScoreLabel = element ?? undefined),
			{ alignItems: "flex-end" }
		),
		Label(
			element => (clockBox = element ?? undefined),
			element => (clockLabel = element ?? undefined),
			{ alignItems: "center", fontSize: 18 }
		)
	]
	for (let i = 0; i < SLOTS * 2; i++) {
		children.push(
			React.createElement("img", { ref: AttachHeroAt(i), style: imageStyle }),
			Label(AttachAt(respawnBoxes, i), AttachAt(respawnLabels, i), {
				alignItems: "center",
				fontSize: 18,
				backgroundColor: "#181b1d"
			})
		)
	}
	return React.createElement(
		"div",
		{
			ref: (element: Nullable<HTMLElement | null>) => (root = element ?? undefined),
			style: { position: "absolute", left: 0, top: 0, display: "none" }
		},
		...children
	)
}
MenuSDK.RegisterPanel("debugger-top-panel", Render, MenuSDK.EPanelLayer.Screen)

function WriteRect(element: HTMLElement, rect: Rectangle): void {
	MenuSDK.WritePx(element, "left", rect.x)
	MenuSDK.WritePx(element, "top", rect.y)
	MenuSDK.WritePx(element, "width", rect.Width)
	MenuSDK.WritePx(element, "height", rect.Height)
}

function WriteBackgrounds(): void {
	if (radiantBackground !== undefined) {
		WriteRect(radiantBackground, GUIInfo.TopBar.RadiantTeamBackground)
		MenuSDK.WriteShown(radiantBackground, true)
	}
	if (direBackground !== undefined) {
		WriteRect(direBackground, GUIInfo.TopBar.DireTeamBackground)
		MenuSDK.WriteShown(direBackground, true)
	}
}

function WriteScore(
	scoreBox: Nullable<HTMLElement>,
	scoreLabel: Nullable<HTMLElement>,
	rect: Rectangle,
	score: number
): void {
	if (scoreBox === undefined || scoreLabel === undefined) {
		return
	}
	MenuSDK.WritePx(scoreBox, "left", rect.x)
	MenuSDK.WritePx(scoreBox, "top", rect.y)
	MenuSDK.WritePx(scoreBox, "width", rect.Width)
	MenuSDK.WritePx(scoreBox, "height", rect.Height / 2)
	MenuSDK.WritePx(scoreBox, "font-size", GUIInfo.ScaleHeight(22))
	MenuSDK.WriteText(scoreLabel, score.toString())
	MenuSDK.WriteShown(scoreBox, true, "flex")
}

function WriteScores(): void {
	let radiantScore = 0,
		direScore = 0
	for (const player of Players) {
		const data = Dota2SDK.PlayerResource?.PlayerTeamData[player.PlayerID]
		if (data === undefined) {
			continue
		}
		if (player.Team === Team.Radiant) {
			radiantScore += data.Kills
		} else if (player.Team === Team.Dire) {
			direScore += data.Kills
		}
	}
	WriteScore(
		radiantScoreBox,
		radiantScoreLabel,
		GUIInfo.TopBar.RadiantTeamScore,
		radiantScore
	)
	WriteScore(direScoreBox, direScoreLabel, GUIInfo.TopBar.DireTeamScore, direScore)
}

function WriteClock(): void {
	if (
		clockBackground === undefined ||
		clockBox === undefined ||
		clockLabel === undefined
	) {
		return
	}
	const clock = GUIInfo.TopBar.TimeOfDay
	WriteRect(clockBackground, clock)
	MenuSDK.WriteShown(clockBackground, true)
	let time = Dota2SDK.GameRules?.GameTime ?? 0
	if (time < 0) {
		time = Math.abs(time + 1)
	}
	let secondsText = Math.floor(time % 60).toString()
	if (secondsText.length === 1) {
		secondsText = `0${secondsText}`
	}
	WriteRect(clockBox, clock)
	MenuSDK.WriteText(clockLabel, `${Math.floor(time / 60)}:${secondsText}`)
	MenuSDK.WriteShown(clockBox, true, "flex")
}

function WritePlayers(): void {
	for (let i = 0; i < SLOTS * 2; i++) {
		slotUsed[i] = false
		timerUsed[i] = false
	}
	for (const player of Players) {
		if (player.Team !== Team.Radiant && player.Team !== Team.Dire) {
			continue
		}
		const data = Dota2SDK.PlayerResource?.PlayerTeamData[player.PlayerID]
		if (data === undefined) {
			continue
		}
		const slot = data.TeamSlot
		if (slot >= SLOTS) {
			continue
		}
		const isRadiant = player.Team === Team.Radiant,
			index = isRadiant ? slot : SLOTS + slot,
			isDead = data.RespawnSeconds > 0
		const heroName = UnitData.GetHeroNameByID(data.SelectedHeroID)
		const icon = heroImages[index]
		if (heroName !== "" && icon !== undefined) {
			slotUsed[index] = true
			const box = isRadiant
				? GUIInfo.TopBar.RadiantPlayersHeroImages[slot]
				: GUIInfo.TopBar.DirePlayersHeroImages[slot]
			WriteRect(icon, box)
			if (heroIDs[index] !== data.SelectedHeroID) {
				heroIDs[index] = data.SelectedHeroID
				heroTextures[index] = ImageData.GetHeroTexture(heroName)
			}
			MenuSDK.WriteSizedArt(
				icon,
				heroTextures[index],
				Math.round(box.Width),
				Math.round(box.Height)
			)
			MenuSDK.WriteStyle(icon, "filter", isDead ? "grayscale(1)" : "none")
		}
		const timerBox = respawnBoxes[index],
			timerLabel = respawnLabels[index]
		if (isDead && timerBox !== undefined && timerLabel !== undefined) {
			timerUsed[index] = true
			WriteRect(
				timerBox,
				isRadiant
					? GUIInfo.TopBar.RadiantPlayersRespawnTimers[slot]
					: GUIInfo.TopBar.DirePlayersRespawnTimers[slot]
			)
			MenuSDK.WriteText(timerLabel, (data.RespawnSeconds + 1).toString())
		}
	}
	for (let i = 0; i < SLOTS * 2; i++) {
		const icon = heroImages[i]
		if (icon !== undefined) {
			MenuSDK.WriteShown(icon, slotUsed[i])
		}
		const timerBox = respawnBoxes[i]
		if (timerBox !== undefined) {
			MenuSDK.WriteShown(timerBox, timerUsed[i], "flex")
		}
	}
}

export function DrawTopPanel(): void {
	const rootElement = root
	if (rootElement === undefined) {
		return
	}
	const show =
		State.value && GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	if (!show) {
		if (visible) {
			MenuSDK.WriteShown(rootElement, false)
			visible = false
		}
		return
	}
	if (!visible) {
		MenuSDK.WriteShown(rootElement, true)
		visible = true
	}
	WriteBackgrounds()
	WriteScores()
	WriteClock()
	WritePlayers()
}
