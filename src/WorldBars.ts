import { canvas } from "./canvas"
import { RootMenu } from "./menu"

const FRAME_COLOR = new Color(0, 0, 0, 230),
	EMPTY_COLOR = new Color(40, 16, 14),
	ALLY_HEALTH = new Color(58, 176, 42),
	ENEMY_HEALTH = new Color(222, 56, 28),
	NEUTRAL_HEALTH = new Color(200, 170, 60),
	MANA_COLOR = new Color(70, 115, 240),
	DIVIDER_COLOR = new Color(0, 0, 0, 120),
	LEVEL_BACK = new Color(20, 20, 24, 235),
	LEVEL_COLOR = new Color(206, 206, 206),
	/** A divider every this many hit points, as the game cuts a hero's row */
	DIVIDER_HP = 250

const BarsNode = RootMenu.AddNode("World bars")
const State = BarsNode.AddToggle("State", true),
	Allies = BarsNode.AddToggle("Allies", true),
	Enemies = BarsNode.AddToggle("Enemies", true),
	Heroes = BarsNode.AddToggle("Heroes", true),
	Others = BarsNode.AddToggle("Creeps and buildings", true),
	Mana = BarsNode.AddToggle("Mana", true),
	Level = BarsNode.AddToggle("Level", true),
	Numbers = BarsNode.AddToggle("Hero health numbers", false)

const anchor = new Vector2()

function HealthColor(unit: Unit): Color {
	if (unit.IsNeutral) {
		return NEUTRAL_HEALTH
	}
	return unit.IsEnemy() ? ENEMY_HEALTH : ALLY_HEALTH
}

function Fill(row: Rectangle, fraction: number, color: Color): void {
	const width = Math.round(Math.max(Math.min(fraction, 1), 0) * row.Width)
	if (width > 0) {
		canvas.Rect(row.pos1, new Vector2(width, row.Height), { color })
	}
}

/** The bar the game draws over a hero or a unit a player controls, laid out by the SDK */
function DrawHeroBar(unit: Unit): void {
	if (unit.HealthBarAnchor(unit.Position, anchor) === undefined) {
		return
	}
	const bar = unit.GetHeroHealthBar(anchor),
		hasMana = Mana.value && unit.MaxMana > 0 && bar.Mana.Width > 0
	canvas.Rect(bar.Frame.pos1, bar.Frame.Size, { color: FRAME_COLOR })
	canvas.Rect(bar.Health.pos1, bar.Health.Size, { color: EMPTY_COLOR })
	Fill(bar.Health, unit.HP / Math.max(unit.MaxHP, 1), HealthColor(unit))
	if (unit.MaxHP > DIVIDER_HP) {
		const step = (bar.Health.Width * DIVIDER_HP) / unit.MaxHP,
			pixel = Math.max(bar.Scale, 1)
		if (step >= 3 * pixel) {
			for (let x = bar.Health.x + step; x < bar.Health.pos2.x - 1; x += step) {
				canvas.Rect(
					new Vector2(Math.round(x), bar.Health.y),
					new Vector2(pixel, bar.Health.Height),
					{
						color: DIVIDER_COLOR
					}
				)
			}
		}
	}
	if (hasMana) {
		Fill(bar.Mana, unit.Mana / Math.max(unit.MaxMana, 1), MANA_COLOR)
	}
	if (Numbers.value && unit.IsHero) {
		canvas.TextIn(`${Math.floor(unit.HP)}`, bar.Health, {
			color: Color.White,
			size: Math.max(Math.round(bar.Health.Height + 3), 9),
			weight: 700,
			outline: true,
			flags: TextFlags.Center
		})
	}
	if (Level.value && unit.IsHero && bar.Level.Width > 0) {
		canvas.Rect(bar.Level.pos1, bar.Level.Size, {
			color: LEVEL_BACK,
			borderColor: HealthColor(unit),
			borderWidth: 1
		})
		canvas.TextIn(unit.Level.toString(), bar.Level, {
			color: LEVEL_COLOR,
			size: Math.max(Math.round(bar.LevelFontTall), 9),
			weight: 800,
			outline: true,
			flags: TextFlags.Center
		})
	}
	if (unit.IsHero && bar.Icon.Width > 0) {
		const icon = unit.TexturePath(true)
		if (icon !== undefined) {
			canvas.Image(icon, bar.Icon.pos1, bar.Icon.Size, { fit: "cover" })
		}
	}
}

/** The plain bar the game draws over a creep or a building */
function DrawPlainBar(unit: Unit): void {
	if (unit.HealthBarAnchor(unit.Position, anchor) === undefined) {
		return
	}
	const size = unit.HealthBarSize
	if (size.x <= 0 || size.y <= 0) {
		return
	}
	const corner = anchor.Subtract(unit.HealthBarPositionCorrection),
		row = new Rectangle(corner, corner.Add(size))
	canvas.Rect(corner.SubtractScalar(1), size.AddScalar(2), { color: FRAME_COLOR })
	canvas.Rect(row.pos1, row.Size, { color: EMPTY_COLOR })
	Fill(row, unit.HP / Math.max(unit.MaxHP, 1), HealthColor(unit))
}

function Wanted(unit: Unit): boolean {
	if (!unit.IsValid || !unit.IsAlive || !unit.IsVisible || unit.MaxHP <= 0) {
		return false
	}
	if (unit.IsNeutral) {
		return Enemies.value
	}
	return unit.IsEnemy() ? Enemies.value : Allies.value
}

/** Whether the game gives this unit a hero's bar rather than a plain one */
function HasHeroBar(unit: Unit): boolean {
	return (
		unit.IsHero ||
		unit.IsSpiritBear ||
		unit instanceof npc_dota_visage_familiar ||
		unit instanceof npc_dota_brewmaster_void ||
		unit instanceof npc_dota_brewmaster_storm ||
		unit instanceof npc_dota_brewmaster_earth
	)
}

export function DrawWorldBars(): void {
	if (!State.value) {
		return
	}
	for (const unit of EntityManager.GetEntitiesByClass(Unit)) {
		if (!Wanted(unit)) {
			continue
		}
		if (HasHeroBar(unit)) {
			if (Heroes.value) {
				DrawHeroBar(unit)
			}
		} else if (Others.value && (unit.IsCreep || unit.IsBuilding)) {
			DrawPlainBar(unit)
		}
	}
}
