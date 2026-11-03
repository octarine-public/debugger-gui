// AUTO-GENERATED - do not edit.
/**
 * Whose a unit's orders are for the moment, between the scripts: another script's order leaves it
 * to that script for `ScriptYield`. The player's own order holds no script's: a script may take a
 * unit over from the player at once - a dodge, a combo. A script running a combo claims its units
 * (`Claim`): the player's walks, attacks and casts at a unit for them are blocked while
 * `BlockClaimed` is on, and the cursor waits on the combo's target between its orders. A script
 * guarding a unit against what is about to land on it (`Guard`) has the player's orders that would
 * end the guard blocked until it has done its work: a walk out of Phase Shift, a cast out of
 * Mischief's form.
 *
 * A script that names itself (`OrderOwner`) takes part: its orders given to a unit that is
 * another script's for the moment are dropped (`EOrderDrop.Yielded`), unless it is an escape. The
 * orders of a script that names none go as they always did, and still count as another script's
 * for those that do. The settings stand in the main menu, beside the humanizer.
 * @example
 * if (OrderPolicy.YieldOf(hero, owner) === EOrderYield.None) {
 * 	hero.CastPosition(ability, point)
 * }
 */
declare class COrderPolicy {
	/** Seconds a unit is another script's after it ordered the unit. */
	public ScriptYield: number
	/** Whether the player's walks, attacks and casts at a unit are blocked for a unit a script claims. */
	public BlockClaimed: boolean
	/** How many of the player's orders were blocked for units a script claimed. */
	public get BlockedOrders(): number
	/** Whether any script claims units. */
	public get Claiming(): boolean
	/** What the cursor waits on between a claiming script's orders: the first claim's target. */
	public get ClaimTarget(): Nullable<Vector3 | Entity>
	/**
	 * Claims `units` for `owner`'s combo, its cursor waiting on `target` between its orders; called
	 * again, the claim takes the new units and target.
	 * @example
	 * OrderPolicy.Claim(owner, [hero], enemy)
	 */
	public Claim(owner: OrderOwner, units: readonly Unit[], target?: Nullable<Vector3 | Entity>): void
	/** Lets `owner`'s claim go. */
	public Release(owner: OrderOwner): void
	/**
	 * A script guards `unit` with `ability` - a dodge - up at the game time `upAt` and standing till
	 * `until`: till it is up the player's orders to the unit that would cut its cast short
	 * (`BreaksCast`) are blocked, and till `until` those that would end it (`Ability.GuardBrokenBy`);
	 * a later guard on the unit takes the place of an earlier one. A walk out of what is about to
	 * land guards with no ability, up at `until`: a walk, an attack, a stop or a cast of the
	 * player's would turn it.
	 * @example
	 * OrderPolicy.Guard(hero, phaseShift, hero.ResponseTime(phaseShift), threat.LandsUntil(hero, 3))
	 * OrderPolicy.Guard(hero, undefined, passed, passed)
	 */
	public Guard(unit: Unit, ability: Nullable<Ability>, upAt: number, until: number): void
	/**
	 * Whether the player's `order` would end a guard a script put up on one of its units, at the
	 * game time `now` (`Guard`).
	 */
	public BreaksGuard(order: ExecuteOrder, now?: number): boolean
	/** The script whose claim holds `unit`; none. */
	public ClaimOf(unit: Unit): Nullable<OrderOwner>
	/**
	 * Whose `unit`'s orders are for `owner` at the game time `now`: another script's within its
	 * yield, else the owner's own.
	 */
	public YieldOf(unit: Unit, owner: OrderOwner, now?: number): EOrderYield
	/**
	 * Blocks the player's `order` when it would end a script's guard on its units (`BreaksGuard`),
	 * or walks, attacks or casts at a unit for a unit a script claims, while `BlockClaimed` is on;
	 * true when it does, counted in `BlockedOrders`.
	 */
	public Block(order: ExecuteOrder): boolean
	/** Notes a script's `order` given at the game time `now`; the player's own holds no script's. */
	public Note(order: ExecuteOrder, now?: number): void
	/** Forgets every order noted, every claim and every guard: a new connection, the game's end. */
	public Reset(): void
}
declare const OrderPolicy: COrderPolicy
