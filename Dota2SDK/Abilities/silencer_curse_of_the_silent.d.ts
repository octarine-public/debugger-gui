// AUTO-GENERATED - do not edit.
declare class silencer_curse_of_the_silent extends Ability {
	public GetBaseAOERadiusForLevel(level: number): number
	/** The curse's blow as it lands: `application_damage`. */
	public GetBaseDamageForLevel(level: number): number
	/**
	 * The curse after its blow: `damage` each second, the first a second after it lands, the last
	 * as it ends. The second between ticks is not in the data, which gives `damage` a second. The
	 * target's status resistance shortens it.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
}
