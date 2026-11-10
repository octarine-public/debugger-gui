import { canvas, TextCentered } from "./canvas"
import { GuiIcons, WithIcon } from "./icons"
import { HudScale, LowerHud } from "./layout"
import { RootMenu } from "./menu"

const PANEL_COLOR = new Color(12, 14, 18, 225),
	SLOT_COLOR = new Color(30, 34, 40),
	BORDER_COLOR = new Color(255, 255, 255, 30),
	COOLDOWN_COLOR = new Color(0, 0, 0, 170),
	LOCKED_COLOR = new Color(0, 0, 0, 120),
	HEALTH_COLOR = new Color(60, 170, 50),
	MANA_COLOR = new Color(50, 110, 220),
	BAR_BACK = new Color(25, 25, 25)

/** The abilities the HUD shows: the ones the game puts in the ability row */
function ShownAbilities(hero: Hero): Ability[] {
	const shown: Ability[] = []
	for (const ability of hero.Spells) {
		if (
			ability !== undefined &&
			!ability.IsHidden &&
			!ability.IsInnate &&
			!ability.Name.startsWith("special_bonus") &&
			!ability.Name.startsWith("generic_hidden")
		) {
			shown.push(ability)
		}
	}
	return shown.slice(0, 6)
}

function DrawCooldown(box: Rectangle, ability: Ability, size: number): void {
	const cooldown = ability.Cooldown
	if (cooldown <= 0) {
		return
	}
	canvas.Rect(box.pos1, box.Size, { color: COOLDOWN_COLOR })
	TextCentered(
		cooldown >= 10 ? Math.ceil(cooldown).toString() : cooldown.toFixed(1),
		box,
		{
			color: Color.White,
			size,
			weight: 700,
			outline: true
		}
	)
}

function DrawAbility(box: Rectangle, ability: Ability, s: number): void {
	canvas.Rect(box.pos1, box.Size, {
		color: SLOT_COLOR,
		borderColor: BORDER_COLOR,
		borderWidth: 1
	})
	canvas.Image(ability.TexturePath, box.pos1, box.Size, { fit: "cover" })
	if (ability.Level === 0) {
		canvas.Rect(box.pos1, box.Size, { color: LOCKED_COLOR })
	}
	DrawCooldown(box, ability, Math.round(18 * s))
	if (ability.Level > 0) {
		const pip = 4 * s,
			gap = 2 * s,
			width = ability.Level * (pip + gap) - gap
		for (let i = 0; i < ability.Level; i++) {
			canvas.Rect(
				new Vector2(
					box.x + (box.Width - width) / 2 + i * (pip + gap),
					box.pos2.y + 2 * s
				),
				new Vector2(pip, pip),
				{ color: Color.Yellow }
			)
		}
	}
}

function DrawItem(box: Rectangle, item: Nullable<Item>, s: number): void {
	canvas.Rect(box.pos1, box.Size, {
		color: SLOT_COLOR,
		borderColor: BORDER_COLOR,
		borderWidth: 1
	})
	if (item === undefined) {
		return
	}
	canvas.Image(item.TexturePath, box.pos1, box.Size, { fit: "cover" })
	DrawCooldown(box, item, Math.round(14 * s))
	const charges = item.CurrentCharges
	if (charges > 0) {
		canvas.TextIn(charges.toString(), box, {
			color: Color.White,
			size: Math.round(12 * s),
			weight: 700,
			outline: true,
			flags: TextFlags.Right | TextFlags.Bottom
		})
	}
}

function DrawBar(
	box: Rectangle,
	value: number,
	max: number,
	color: Color,
	s: number
): void {
	canvas.Rect(box.pos1, box.Size, { color: BAR_BACK })
	const filled = (Math.max(Math.min(value / Math.max(max, 1), 1), 0) * box.Width) | 0
	if (filled > 0) {
		canvas.Rect(box.pos1, new Vector2(filled, box.Height), { color })
	}
	TextCentered(`${Math.floor(value)} / ${Math.floor(max)}`, box, {
		color: Color.White,
		size: Math.round(12 * s),
		weight: 600,
		outline: true
	})
}

const rect = (x: number, y: number, width: number, height: number) =>
	new Rectangle(new Vector2(x, y), new Vector2(x + width, y + height))

const State = WithIcon(RootMenu.AddToggle("Lower HUD", true), GuiIcons.LowerHud)
export function DrawLowerHud(): void {
	const hero = Dota2SDK.LocalPlayer?.Hero
	if (!State.value || hero === undefined) {
		return
	}
	const s = HudScale(),
		panel = LowerHud.Panel(),
		pad = 8 * s
	canvas.Rect(panel.pos1, panel.Size, {
		color: PANEL_COLOR,
		borderColor: BORDER_COLOR,
		borderWidth: 1,
		radius: 6 * s
	})

	const portrait = rect(panel.x + pad, panel.y + pad, 150 * s, 96 * s)
	canvas.Image(
		`panorama/images/heroes/${hero.Name}_png.vtex_c`,
		portrait.pos1,
		portrait.Size,
		{
			fit: "cover",
			grayscale: !hero.IsAlive
		}
	)
	const level = rect(portrait.x, portrait.pos2.y - 20 * s, 26 * s, 20 * s)
	canvas.Rect(level.pos1, level.Size, { color: PANEL_COLOR })
	TextCentered(hero.Level.toString(), level, {
		color: Color.Yellow,
		size: Math.round(14 * s),
		weight: 700
	})

	const itemSize = new Vector2(52 * s, 38 * s),
		itemGap = 3 * s,
		itemsWidth = itemSize.x * 3 + itemGap * 2,
		itemsX = panel.pos2.x - pad - itemsWidth,
		abilitiesX = portrait.pos2.x + pad,
		abilitiesWidth = itemsX - pad - abilitiesX,
		abilities = ShownAbilities(hero),
		abilitySize = Math.min(
			58 * s,
			(abilitiesWidth - (abilities.length - 1) * 4 * s) /
				Math.max(abilities.length, 1)
		),
		rowWidth = abilities.length * abilitySize + (abilities.length - 1) * 4 * s,
		abilitiesLeft = abilitiesX + (abilitiesWidth - rowWidth) / 2
	for (let i = 0; i < abilities.length; i++) {
		DrawAbility(
			rect(
				abilitiesLeft + i * (abilitySize + 4 * s),
				panel.y + pad,
				abilitySize,
				abilitySize
			),
			abilities[i],
			s
		)
	}

	const barHeight = 16 * s,
		barsTop = panel.pos2.y - pad - barHeight * 2 - 3 * s
	DrawBar(
		rect(abilitiesX, barsTop, abilitiesWidth, barHeight),
		hero.HP,
		hero.MaxHP,
		HEALTH_COLOR,
		s
	)
	DrawBar(
		rect(abilitiesX, barsTop + barHeight + 3 * s, abilitiesWidth, barHeight),
		hero.Mana,
		hero.MaxMana,
		MANA_COLOR,
		s
	)

	const inventory = hero.Inventory
	for (let slot = 0; slot < 6; slot++) {
		const column = slot % 3,
			row = Math.floor(slot / 3)
		DrawItem(
			rect(
				itemsX + column * (itemSize.x + itemGap),
				panel.y + pad + row * (itemSize.y + itemGap),
				itemSize.x,
				itemSize.y
			),
			inventory.GetItem(slot as DOTAScriptInventorySlot),
			s
		)
	}
	const extrasTop = panel.y + pad + 2 * (itemSize.y + itemGap) + 4 * s,
		small = new Vector2(itemSize.y, itemSize.y)
	DrawItem(rect(itemsX, extrasTop, small.x, small.y), inventory.TPScroll, s)
	DrawItem(
		rect(itemsX + itemsWidth - small.x, extrasTop, small.x, small.y),
		inventory.NeutralItem,
		s
	)
}
