// AUTO-GENERATED - do not edit.
declare class Projectile {
	public readonly ID: number
	public ParticlePath: string
	public ParticleSystemHandle: bigint
	public Source: Nullable<Unit | FakeUnit>
	public readonly ColorGemColor: Color
	public Speed: number
	public IsValid: boolean
	public ParticlePathNoEcon: string
	public AbilityIndex: Nullable<number>
	public readonly OriginalSpeed: number
	public readonly CreateTime: number
	public readonly VisualPosition: Vector3
	/**
	 * The ability classes whose projectile flies as the particle at `path`, as their
	 * `@ProjectileParticle` declares; none when no class does.
	 *
	 * @example
	 * TrackingProjectile.AbilitiesFlyingAs(projectile.ParticlePathNoEcon)
	 */
	public static AbilitiesFlyingAs(path: string): Nullable<readonly Constructor<IThreatAbility>[]>
	public UpdateParticlePathNoEcon(): void
	protected UpdateData(): void
}
declare class LinearProjectile extends Projectile {
	public readonly MaxSpeed: number
	public readonly FowRadius: number
	public readonly StickyFowReveal: boolean
	public readonly Distance: number
	public readonly Origin: Vector3
	public readonly Velocity: Vector2
	public readonly Acceleration: Vector2
	public readonly Position: Vector3
	public readonly Forward: Vector3
	public readonly TargetLoc: Vector3
	public get Ability(): Nullable<Ability>
	public GetRemainingTime(start?: Vector3, end?: Vector3): number
	protected UpdateData(): void
}
declare class TrackingProjectile extends Projectile {
	public Target: Nullable<Unit | FakeUnit>
	public readonly SourceAttachment: string
	public readonly MaxImpactTime: Nullable<number>
	public LaunchTick: number
	public readonly TargetLoc: Vector3
	public readonly OriginalMoveSpeed: number
	public readonly TargetProjectileHandle?: number | undefined
	public readonly Position: Vector3
	public IsDodged: boolean
	/**
	 * The ability that threw it: the one the game names; for one thrown out of sight - the game
	 * naming neither its source nor its ability, only where it set off - the one flying as its
	 * particle (`AbilityFlyingAs`), looked for once its spot is known.
	 */
	public get Ability(): Nullable<Ability>
	public get IsDodgeable(): boolean
	public get IsAttack(): boolean
	public get ExpireTime(): number
	/** @internal */
	public Update(targetEntity: Nullable<Unit | FakeUnit>, speed: number, path: string, particleSystemHandle: bigint, dodgeable: boolean, isAttack: boolean, expireTime: number, launchTick: number, targetLoc: Vector3): void
	/** @internal */
	public UpdateProjectileSpeed(): void
}
