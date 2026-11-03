// AUTO-GENERATED - do not edit.
declare class modifier_faceless_void_time_dilation_slow extends Modifier implements IDebuff {
	public readonly IsHidden = false
	public readonly DebuffModifierName: string
	protected readonly DeclaredFunction: Map<EModifierfunction, () => [number, boolean]>
	public IsDebuff(): this is IDebuff
	protected GetMoveSpeedBonusPercentage(): [number, boolean]
	protected GetAttackSpeedBonusConstant(): [number, boolean]
	/** The fields tick on the unit by themselves, a share for each of its stacks (`DamageOverTime`). */
	protected readonly DeclaredEvents: EModifierfunction[]
	/** Its ability's ticks for each of its stacks (`DamageTicks.PerStack`). */
	public DamageOverTime(out: DamageTicks, level: number): boolean
	protected UpdateSpecialValues(): void
}
