// AUTO-GENERATED - do not edit.
declare class item_cloak_of_flames extends Item {
	public GetBaseAOERadiusForLevel(level: number): number
	/** The cloak lands nothing at once: its burn ticks (`DamageOverTime`). */
	public GetBaseDamageForLevel(_level: number): number
	/**
	 * The burn of its aura: `damage` a second, magical - an illusion's `damage_illusions` - over
	 * each half second the unit stays within `radius`, the first half a second after it comes in,
	 * and half a second after it walks out, as the debuff lingers. The half seconds are not in the
	 * data.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
}
