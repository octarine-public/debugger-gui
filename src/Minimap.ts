import { canvas } from "./canvas"
import { HudScale, MinimapBox } from "./layout"
import { RootMenu } from "./menu"

const BORDER_COLOR = new Color(0, 0, 0, 230),
	BACKGROUND_COLOR = new Color(20, 26, 22),
	CAMP_COLOR = new Color(159, 105, 0),
	ALLY_COLOR = new Color(80, 200, 80),
	ENEMY_COLOR = new Color(220, 60, 50),
	NEUTRAL_COLOR = new Color(220, 220, 220)

/** Where `pos` falls on the minimap box, from the overview the map names */
function ToMinimap(box: Rectangle, pos: Vector3): Nullable<Vector2> {
	const overview = MinimapSDK.CurrentMinimapOverview
	if (overview === undefined || overview.size <= 0) {
		return undefined
	}
	const u = (pos.x - overview.pos.x) / overview.size,
		v = (overview.pos.y - pos.y) / overview.size
	if (u < 0 || u > 1 || v < 0 || v > 1) {
		return undefined
	}
	return new Vector2(box.x + u * box.Width, box.y + v * box.Height)
}

function TeamColor(ent: Entity): Color {
	if (ent.IsNeutral) {
		return NEUTRAL_COLOR
	}
	return ent.IsEnemy() ? ENEMY_COLOR : ALLY_COLOR
}

function Dot(
	box: Rectangle,
	ent: Entity,
	size: number,
	color: Color,
	square = false
): void {
	const at = ToMinimap(box, ent.Position)
	if (at === undefined) {
		return
	}
	const half = size / 2,
		pos = new Vector2(at.x - half, at.y - half),
		dimensions = new Vector2(size, size)
	if (square) {
		canvas.Rect(pos, dimensions, { color, borderColor: BORDER_COLOR, borderWidth: 1 })
	} else {
		canvas.Circle(pos, dimensions, {
			color,
			borderColor: BORDER_COLOR,
			borderWidth: 1
		})
	}
}

function DrawBackground(box: Rectangle): void {
	canvas.Rect(box.pos1, box.Size, {
		color: BACKGROUND_COLOR,
		borderColor: BORDER_COLOR,
		borderWidth: 2
	})
	const overview = MinimapSDK.CurrentMinimapOverview,
		material = ConVarsSDK.GetBoolean("dota_minimap_simple_background", true)
			? (overview?.simpleMaterial ?? overview?.material ?? "")
			: (overview?.material ?? overview?.simpleMaterial ?? "")
	if (material !== "") {
		canvas.Image(material, box.pos1, box.Size, { fit: "stretch" })
	}
}

const MinimapNode = RootMenu.AddNode("Minimap")
const State = MinimapNode.AddToggle("State", true),
	CampsState = MinimapNode.AddToggle("Creep Camps", true),
	CreepsState = MinimapNode.AddToggle("Creeps", true),
	RunesState = MinimapNode.AddToggle("Runes", true),
	CouriersState = MinimapNode.AddToggle("Couriers", true),
	HeroesState = MinimapNode.AddToggle("Heroes", true),
	BuildingsState = MinimapNode.AddToggle("Buildings", true)

export function DrawMinimap(): void {
	if (!State.value) {
		return
	}
	const box = MinimapBox(),
		s = HudScale()
	DrawBackground(box)
	if (CampsState.value) {
		for (const spawner of EntityManager.GetEntitiesByClass(NeutralSpawner)) {
			Dot(box, spawner, 6 * s, CAMP_COLOR, true)
		}
	}
	if (BuildingsState.value) {
		for (const building of EntityManager.GetEntitiesByClass(Building)) {
			if (building.IsAlive && !(building instanceof Shop)) {
				Dot(
					box,
					building,
					(building instanceof Fort ? 12 : 8) * s,
					TeamColor(building),
					true
				)
			}
		}
	}
	if (CreepsState.value) {
		for (const creep of EntityManager.GetEntitiesByClass(Creep)) {
			if (creep.IsAlive && creep.IsVisible) {
				Dot(box, creep, 5 * s, TeamColor(creep))
			}
		}
	}
	if (RunesState.value) {
		for (const rune of EntityManager.GetEntitiesByClass(Rune)) {
			if (rune.IsVisible) {
				Dot(box, rune, 7 * s, Color.Aqua)
			}
		}
	}
	if (CouriersState.value) {
		for (const courier of EntityManager.GetEntitiesByClass(Courier)) {
			if (courier.IsAlive && courier.IsVisible) {
				Dot(box, courier, 7 * s, TeamColor(courier), true)
			}
		}
	}
	if (HeroesState.value) {
		const size = 22 * s
		for (const hero of EntityManager.GetEntitiesByClass(Hero)) {
			if (!hero.IsAlive || !hero.IsVisible || hero.IsIllusion) {
				continue
			}
			const at = ToMinimap(box, hero.Position)
			if (at === undefined) {
				continue
			}
			const pos = new Vector2(at.x - size / 2, at.y - size / 2),
				dimensions = new Vector2(size, size)
			canvas.Circle(pos.SubtractScalar(1), dimensions.AddScalar(2), {
				color: TeamColor(hero)
			})
			canvas.Image(
				`panorama/images/heroes/icons/${hero.Name}_png.vtex_c`,
				pos,
				dimensions,
				{
					circle: true
				}
			)
		}
	}
}
