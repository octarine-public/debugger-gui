// AUTO-GENERATED - do not edit.
declare class doom_bringer_doom extends Ability {
	/** Doom lasts `duration`. */
	protected AppliedFrom(values: ISpecialValues, level: number): number
	/**
	 * Doom deals its damage only as it ticks: `damage` each second, the first as it lands, the last
	 * as it ends. The second between ticks is not in the data, which gives `damage` a second. The
	 * target's status resistance shortens it but keeps every tick, closer together.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
	public get AppliesUnitState(): bigint
	/** Its first tick lands before its Break: measured on Prophet's Pendulum. */
	public get HitBeforeBreak(): boolean
	/** With the Scepter its hit also breaks the unit for as long (`Breaks`, `does_break`). */
	protected FillEffects(out: AbilityEffects): void
	protected FillEffectsOn(out: AbilityEffects, target: Unit): void
}
