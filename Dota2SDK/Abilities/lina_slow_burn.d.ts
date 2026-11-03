// AUTO-GENERATED - do not edit.
declare class lina_slow_burn extends Ability {
	/**
	 * Fills `out` with the time of the burn a hit of an ability of `owner` lays: a tick each second
	 * of `burn_duration`, the first a second after the hit, the last as it ends - each `Share` of
	 * the hit's damage. The second is not in the data.
	 */
	public static BurnOf(owner: Nullable<Unit>, out: DamageTicks): boolean
	/** The share of a hit's damage each tick of its burn deals: `burn_damage_pct` over the ticks. */
	public static Share(owner: Nullable<Unit>): number
}
