// AUTO-GENERATED - do not edit.
/**
 * A product a player of this match is known to have, as one bit of a mask.
 * {@link MatchProduct.Ours} means the account is running our product in this match right now.
 * Every other bit means only that our client once found that product installed on the player's
 * machine: a set bit is not proof it is in use, and a clear one is not proof it is absent.
 */
declare enum MatchProduct {
	Ours = 1,
	MrGarabato = 2,
	UmbrellaLoader = 4,
	Divine = 8,
	Minority = 16
}
/** One player of this match the server knows something about. */
interface MatchProductsPlayer {
	/** The 32-bit game account id, the same one the game's own lobby carries. */
	readonly accountID: number
	/** A mask of {@link MatchProduct}. */
	readonly products: number
	/** Running our product in this match right now. */
	readonly ours: boolean
	/** Our client once found some other product installed on that machine. */
	readonly other: boolean
}
/** One look at who else in this match runs what. */
interface MatchProductsSnapshot {
	/**
	 * False when the server would not answer at all — this account is not enabled
	 * for it, or the game is one it cannot group matches for. An empty
	 * {@link players} with `answered` set means "nobody else to report", and the
	 * two must not be shown the same way.
	 */
	readonly answered: boolean
	/**
	 * Our own users in this match, the caller excluded.
	 *
	 * A player who is absent from this list is **unknown, not clean**: someone who
	 * never ran our client has no record anywhere to answer from. Never render an
	 * absence as "legit".
	 */
	readonly players: readonly MatchProductsPlayer[]
}
