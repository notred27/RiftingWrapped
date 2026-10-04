/**
 * A player's Wrapped is viewable once processing has finished, even if a few
 * matches failed along the way. match_consumer.py marks that case
 * "done_with_errors"; treating only "done" as ready left those players on the
 * waiting page forever.
 */
const READY_STATUSES = new Set(["done", "done_with_errors"]);

export function isWrapReady(status) {
    return READY_STATUSES.has(status);
}
