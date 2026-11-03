// AUTO-GENERATED - do not edit.
declare class treant_living_armor extends Ability implements IHealthRestore<Unit> {
	public get RestoresAlly(): boolean
	public get RestoresSelf(): boolean
	public get InstantRestore(): boolean
	public readonly HealthRestoreModifierName = "modifier_treant_living_armor"
	public GetHealthRestore(_target: Unit): number
	protected DurationFrom(values: ISpecialValues, level: number): number
	public IsHealthRestore(): this is IHealthRestore<Unit>
	public GetBaseAOERadiusForLevel(level: number): number
	public get CastRange(): number
}
