// AUTO-GENERATED - do not edit.
declare class doom_bringer_infernal_blade extends Ability implements INuke {
	protected AppliedFrom(values: ISpecialValues, level: number): number
	public IsNuke(): this is INuke
	public GetRawDamage(target: Unit): number
	public GetDamage(target: Unit): number
	public get AppliesUnitState(): bigint
	/**
	 * The burn the strike lays: `burn_damage` and `burn_damage_pct` percent of the unit's maximum
	 * health each second of `burn_duration`, the first a second after it lands, the last as it
	 * ends; the second is not in the data, which gives the damage a second.
	 */
	public DamageOverTime(out: DamageTicks, level: number): boolean
}
