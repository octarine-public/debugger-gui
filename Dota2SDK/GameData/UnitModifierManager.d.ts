// AUTO-GENERATED - do not edit.
declare class UnitModifierManager {
	public readonly Owner: Unit
	/** @private NOTE: this is internal field use Unit#CanUseItems */
	public CanUseAllItems_: boolean
	/** @private NOTE: this is internal field use Unit#NoIntellect */
	public NoIntellect_: boolean
	/** @private NOTE: this is internal field use Unit#HasAeigs */
	public HasAeigs_: boolean
	/** @private NOTE: this is internal field use Unit#IsTempestDouble */
	public IsTempestDouble_: boolean
	/** @private NOTE: this is internal field use Unit#IsChargeOfDarkness */
	public IsChargeOfDarkness_: boolean
	/** @private NOTE: this is internal field use Unit#IsClone */
	public IsClone_: boolean
	/** @private NOTE: this is internal field use Unit#GetAttackHitDamage */
	public AttackCounter_: Nullable<AttackCountModifier>
	/** @private NOTE: this is internal field use Unit#IsIllusion */
	public IsIllusion_: boolean
	/** @private NOTE: this is internal field use Unit#IsReflection */
	public IsReflection_: boolean
	/** @private NOTE: this is internal field use Unit#IsStrongIllusion */
	public IsStrongIllusion_: boolean
	/** @private NOTE: this is internal field use Unit#IsFountainInvulnerable */
	public IsFountainInvulnerable_: boolean
	/** @private NOTE: this is internal field use Unit#ActsInvulnerable */
	public ActsInvulnerable_: boolean
	/** @private NOTE: this is internal */
	public IsMorphlingReplicateIllusion_: boolean
	/**
	 * The modifiers on the unit that run out - a duration of their own (`Modifier.Duration`), so an
	 * end (`Modifier.DieTime`) - kept as they come, go and are refreshed: what asks when the
	 * unit's state changes next visits these, not every modifier.
	 * @example
	 * let soonest = Infinity
	 * for (const buff of enemy.ModifierManager.Timed) {
	 * 	soonest = Math.min(soonest, buff.DieTime)
	 * }
	 */
	public get Timed(): readonly Modifier[]
	public get AttacksPerSecond(): number
	public get ArmorPerAgility(): number
	public get MagicResistPerIntellect(): number
	public get SlowResistance(): number
	public get StatusResistance(): number
	/**
	 * The share of attacks on the unit it evades: each evasion (`EVASION_CONSTANT`) leaves its share
	 * of the rest, one after another.
	 */
	public get Evasion(): number
	/**
	 * The unit's status resistance, a share, against a debuff of `caster`: the highest
	 * (`STATUS_RESISTANCE`) and each that stacks (`STATUS_RESISTANCE_STACKING`) leave their share
	 * one after another. Some count only against some casters (Ichor of Nyctasha: Bane's).
	 */
	public GetStatusResistance(caster?: Unit): number
	/**
	 * How much longer the unit's debuffs hold `target`, a factor: one minus each of its status
	 * resistance as a caster (`STATUS_RESISTANCE_CASTER`, the debuff amplification negated).
	 */
	public GetDebuffAmplification(target?: Unit): number
	public get SpellAmplification(): number
	/**
	 * The unit's spell amplification on `target`, percent: what adds up, the highest unique one
	 * (Kaya and its kin) and the highest of the second unique kind (Divine Rapier). Some count
	 * only against some targets (Partisan's Brand: units a player controls); without `target`,
	 * none of those.
	 */
	public GetSpellAmplification(target?: Unit): number
	public get SpellAmplificationTarget(): number
	public get IsSuppressCrit(): boolean
	public get IsAvoidTotalDamage(): boolean
	public get IsLinkensProtected(): boolean
	public get IsConvertManaCostToHPCost(): boolean
	public GetAttackDamageConvertPhysicalToMagical(target: Unit): boolean
	public GetBaseBonusPhysicalArmor(baseArmor: number): number
	public GetBaseTurnRate(baseTurnRate: number): number
	public GetBaseAttackTime(baseAttackTime: number): number
	public GetBaseAttackSpeed(baseAttackSpeed: number): number
	public GetBaseAttackRange(baseAttackRange: number): number
	public GetBaseMoveSpeed(baseMoveSpeed: number): number
	public GetBaseAttributePrimary(basePrimary: Attributes): Attributes
	public GetBaseMagicResistance(baseResist: number): number
	public GetAttackAnimationPoint(baseAnimationPoint: number): number
	public GetAttackSpeed(baseAttackSpeed: number): number
	public GetAttackRange(baseRange: number): number
	public GetTurnRate(baseTurnRate: number): number
	public GetCastRangeBonus(baseCastRange: number): number
	/**
	 * The unit's move speed from `baseSpeed` with its modifiers - `extraPercentage` percent more of
	 * it besides, a buff not yet on it (`Unit.MoveSpeedWith`).
	 */
	public GetMoveSpeed(baseSpeed: number, isUnslowable?: boolean, extraPercentage?: number): number
	public GetPhysicalArmor(baseArmor: number): number
	public GetMagicResistance(baseResist: number, ignoreMagicResist?: boolean): number
	public GetPredictiveArmor(target: Unit): number
	public GetPiercingArmor(target: Unit): number
	public GetTimeVisionRange(baseVision: number, isNight: boolean, ignoreFixedVision?: boolean): number
	public GetNightTimeVisionRange(baseVision: number, ignoreFixedVision?: boolean): number
	public GetDayTimeVisionRange(baseVision: number, ignoreFixedVision?: boolean): number
	public GetDamageBlock(damage: number, damageType: DAMAGE_TYPES, isRaw: boolean, source?: Unit): number
	/**
	 * What the unit's barriers of `damageType` can still take of a blow as large as any, as they
	 * stand: a magical one's (Pipe), a physical one's (Crystal Nova), for `NONE` one's taking every
	 * kind (Aphotic Shield) - the highest, with those that stack.
	 */
	public GetBarrier(damageType: DAMAGE_TYPES): number
	public GetRawDamageBlock(rawDamage: number, damageType: DAMAGE_TYPES): number
	public GetAttackProjectileSpeed(baseSpeed: number): number
	public GetPassiveDamageBlock(damageType: DAMAGE_TYPES, damageValue?: ATTACK_DAMAGE_STRENGTH, breaks?: boolean): number
	public GetCritDamageBonus(target: Unit): number
	public GetCritDamageBonusTarget(target: Unit): number
	public GetIncomingRawAttackDamage(target: Unit): number
	public GetIncomingAttackDamage(target: Unit, isRaw: boolean): number
	public GetIncomingDamage(target: Unit, damageType: DAMAGE_TYPES, rawDamage?: number, breaks?: boolean, isAttack?: boolean): number
	/**
	 * The share of its damage on `target` the unit deals, spells and attacks alike: the total
	 * outgoing damage (`TOTALDAMAGEOUTGOING_PERCENTAGE`) and an illusion's. What only its attacks
	 * deal more or less (`DAMAGEOUTGOING_PERCENTAGE`) is in `GetPreAttackDamageBonus`. `isAttack`
	 * for an attack's damage (`IModifierParams.IsAttack`).
	 */
	public GetOutgoingDamage(target: Unit, _damageType: DAMAGE_TYPES, isAttack?: boolean): number
	/**
	 * The bonus damage the unit's attack on `target` gets after its crit and its outgoing damage
	 * (`PREATTACK_BONUS_DAMAGE_POST_CRIT`): Shadow Blade's and Silver Edge's break, Wind Walk's.
	 */
	public GetPostCritAttackDamageBonus(target: Unit): number
	public GetProcAttackDamageBonus(target: Unit, damageType: DAMAGE_TYPES, rawDamageBase: number): number
	/**
	 * What the unit's modifiers add to an attack of `baseDamage` on `target`: the bonus damage and
	 * the base damage percent of `baseDamage` (`BASEDAMAGEOUTGOING_PERCENTAGE`; the bonus base damage,
	 * `BASEATTACK_BONUSDAMAGE`, is in the white damage the game sends), then the share of the attack it deals - the outgoing damage of attacks
	 * (`DAMAGEOUTGOING_PERCENTAGE`, added up with the SDK's own `PREATTACK_BONUS_DAMAGE_PERCENTAGE`)
	 * times each multiplier (`DAMAGEOUTGOING_PERCENTAGE_MULTIPLICATIVE`). Without `baseDamage`, the
	 * bonus over the minimum roll.
	 */
	public GetPreAttackDamageBonus(baseDamage?: number, target?: Unit): number
	public GetAbsoluteNoDamage(damageType: DAMAGE_TYPES, target: Unit): boolean
	public GetHealthRegen(baseRegen: number): number
	public GetConstantFirstInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean, params?: IModifierParams): number
	public GetConstantLowestInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean): number
	public GetConstantHighestInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean, params?: IModifierParams): number
	public GetConditionalAdditiveInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean, multiplier?: number, incoming?: number, params?: IModifierParams): number
	public GetConditionalPercentageInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean, multiplier?: number, reduction?: number, params?: IModifierParams): number
	public GetPercentageLowestInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean): number
	public GetPercentageHighestInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean): number
	/**
	 * The product of one plus `sign` times each handler's percent of `eModifierfunction` - one
	 * minus each for a `sign` of -1 -; 1 without any.
	 */
	public GetPercentageProductInternal(eModifierfunction: EModifierfunction, params?: IModifierParams, sign?: number): number
	public GetPercentageMultiplicativeInternal(eModifierfunction: EModifierfunction, ignoreFlags?: boolean, isNegative?: boolean, applyOnlyPositive?: boolean, params?: IModifierParams): number
	/**
	 * The modifiers on the unit that declare `key`, as the game's own declare it: a property they
	 * give a value of (`Modifier.DeclaredFunction`) or an event they act on
	 * (`Modifier.DeclaredEvents`) - what asks after one effect visits these, not every modifier.
	 * @example
	 * const shells = enemy.ModifierManager.Declaring(
	 * 	EModifierfunction.MODIFIER_PROPERTY_REFLECT_SPELL
	 * )
	 */
	public Declaring(key: EModifierfunction): readonly Modifier[]
	/**
	 * Has every unit's values read for game time `time` - a blow landing then, a tick due then:
	 * the modifiers gone by then pass over (`Modifier.RemainingAt`), but an aura's, which the
	 * game keeps on while the unit stands in it; -Infinity reads them as they stand. Returns the
	 * time read for before, to set back once read.
	 * @example
	 * const was = UnitModifierManager.ReadAt(landsAt)
	 * const resist = enemy.GetMagicalDamageResist()
	 * UnitModifierManager.ReadAt(was)
	 */
	public static ReadAt(time: number): number
	/** @private NOTE: this is internal method */
	public DeclareInternal(modifier: Modifier, functions: Nullable<ModifierMapFieldHandler>, events: Nullable<readonly EModifierfunction[]>, isCreate: boolean): void
	/**
	 * @private NOTE: this is internal method - `modifier` came on the unit or changed while on it
	 * (`on`), or left it: it stands among `Timed` while it is on and runs out.
	 */
	public TimeInternal(modifier: Modifier, on: boolean): void
	/** @private NOTE: this is internal method */
	public AddOrRemoveInternal(eModifierfunctions: Nullable<ModifierMapFieldHandler>, isCreate: boolean, modifier: Modifier): void
}
