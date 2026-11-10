import { canvas, TextCentered } from "./canvas"
import { GuiIcons, WithIcon } from "./icons"
import { HudScale, TopBar } from "./layout"
import { RootMenu } from "./menu"

const PANEL_COLOR = new Color(12, 14, 18, 220),
	RADIANT_COLOR = new Color(70, 160, 70),
	DIRE_COLOR = new Color(190, 60, 50),
	DEAD_COLOR = new Color(0, 0, 0, 170),
	HEALTH_COLOR = new Color(70, 190, 60),
	MANA_COLOR = new Color(60, 120, 230),
	BAR_BACK = new Color(30, 30, 30, 220)

function DrawBar(box: Rectangle, fraction: number, color: Color): void {
	canvas.Rect(box.pos1, box.Size, { color: BAR_BACK })
	const filled = Math.max(Math.min(fraction, 1), 0) * box.Width
	if (filled > 0) {
		canvas.Rect(box.pos1, new Vector2(filled, box.Height), { color })
	}
}

function DrawPlayer(player: PlayerCustomData, radiant: boolean): void {
	const slot = player.TeamSlot
	if (slot < 0 || slot >= 5) {
		return
	}
	const portrait = TopBar.Slot(radiant, slot),
		hero = player.Hero,
		name = hero?.Name ?? player.HeroName
	if (name !== undefined && name !== "") {
		canvas.Image(
			`panorama/images/heroes/${name}_png.vtex_c`,
			portrait.pos1,
			portrait.Size,
			{
				fit: "cover",
				grayscale: hero !== undefined && !hero.IsAlive
			}
		)
	} else {
		canvas.Rect(portrait.pos1, portrait.Size, { color: PANEL_COLOR })
	}
	const respawn = player.RespawnSeconds
	if (hero !== undefined && !hero.IsAlive && respawn > 0) {
		canvas.Rect(portrait.pos1, portrait.Size, { color: DEAD_COLOR })
		TextCentered(Math.ceil(respawn).toString(), portrait, {
			color: Color.White,
			size: Math.round(16 * HudScale()),
			weight: 700,
			outline: true
		})
	}
	if (hero !== undefined) {
		DrawBar(TopBar.Bar(portrait, 0), hero.HP / Math.max(hero.MaxHP, 1), HEALTH_COLOR)
		DrawBar(
			TopBar.Bar(portrait, 1),
			hero.Mana / Math.max(hero.MaxMana, 1),
			MANA_COLOR
		)
	}
}

function TeamKills(team: Team): number {
	let kills = 0
	for (const player of PlayerCustomData.Array) {
		if (player.Team === team) {
			kills += Dota2SDK.PlayerResource?.PlayerTeamData[player.PlayerID]?.Kills ?? 0
		}
	}
	return kills
}

function DrawClock(): void {
	const clock = TopBar.Clock(),
		s = HudScale()
	canvas.Rect(clock.pos1, clock.Size, { color: PANEL_COLOR, radius: 4 * s })
	let time = Dota2SDK.GameRules?.GameTime ?? 0
	const negative = time < 0
	time = Math.abs(time)
	const seconds = Math.floor(time % 60)
		.toString()
		.padStart(2, "0")
	TextCentered(`${negative ? "-" : ""}${Math.floor(time / 60)}:${seconds}`, clock, {
		color: Color.White,
		size: Math.round(20 * s),
		weight: 600
	})
}

function DrawScore(radiant: boolean): void {
	const box = TopBar.Score(radiant),
		s = HudScale()
	canvas.Rect(box.pos1, box.Size, { color: PANEL_COLOR })
	TextCentered(TeamKills(radiant ? Team.Radiant : Team.Dire).toString(), box, {
		color: radiant ? RADIANT_COLOR : DIRE_COLOR,
		size: Math.round(22 * s),
		weight: 700
	})
}

const State = WithIcon(RootMenu.AddToggle("Top Panel", true), GuiIcons.TopPanel)
export function DrawTopPanel(): void {
	if (!State.value) {
		return
	}
	for (const radiant of [true, false]) {
		const team = TopBar.Team(radiant)
		canvas.Rect(team.pos1, team.Size, { color: PANEL_COLOR })
		DrawScore(radiant)
	}
	DrawClock()
	for (const player of PlayerCustomData.Array) {
		if (player.Team === Team.Radiant) {
			DrawPlayer(player, true)
		} else if (player.Team === Team.Dire) {
			DrawPlayer(player, false)
		}
	}
}
