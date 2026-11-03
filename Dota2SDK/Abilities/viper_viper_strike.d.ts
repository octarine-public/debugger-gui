// AUTO-GENERATED - do not edit.
declare class viper_viper_strike extends Ability {
	public get ProjectileAttachment(): string
	/**
	 * Viper Strike deals its damage only as it ticks: `damage` each second, the first as it lands,
	 * the last a second before it ends. The second between ticks is not in the data, which gives
	 * `damage` a second. The target's status resistance shortens it.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
	public GetBaseSpeedForLevel(level: number): number
	/** Its first tick lands before its Break (`does_break`): measured on Prophet's Pendulum. */
	public get HitBeforeBreak(): boolean
	/** Its hit breaks the unit while the poison lasts (`Breaks`). */
	protected FillEffects(out: AbilityEffects): void
	protected FillEffectsOn(out: AbilityEffects, target: Unit): void
}
