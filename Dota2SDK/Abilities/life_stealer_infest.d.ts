// AUTO-GENERATED - do not edit.
/**
 * Infest: Lifestealer goes into another unit and bursts out of it - at Consume, or as an enemy hero's
 * `infest_duration_enemy` runs out - dealing `damage` within `radius`. Its reach is its values'
 * `AbilityCastRange`, as any ability's, with nothing on top: 100 more sent the order from 540 off
 * the target with the Scepter's 400 - lost, the cast began 420 off (20 October 2026, demo).
 */
declare class life_stealer_infest extends Ability {
	public GetBaseAOERadiusForLevel(level: number): number
	public GetBaseDamageForLevel(level: number): number
	/**
	 * An enemy hero only while it may be infested a while (`infest_duration_enemy`, the Scepter's):
	 * without it the game turns the order down - three orders lost, then refused, at Juggernaut
	 * (20 October 2026, demo). Any other unit as the game's own filter has it.
	 */
	public CanTarget(unit: Unit): boolean
}
