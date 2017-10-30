const placeholderRegx = /^[:{]/;

function isPlaceholderPart (part) {
  return placeholderRegx.test(part);
}

function compareRoutePathPart (p1, p2) {
  if (isPlaceholderPart(p1)) {
    if (isPlaceholderPart(p2)) {
      // we're comparing two placeholder parts
      return p1.localeCompare(p2);
    } else {
      // dynamic placeholders should be after static path part
      return 1;
    }
  } else if (isPlaceholderPart(p2)) {
    // static part should be before dynamic placeholder
    return -1;
  }

  return p1.localeCompare(p2);
}

/**
 * This sort function aims to provide a stable sort for routes.
 * Route paths are split at the "/" character and each part is compared
 * individually starting from the leftmost part. A dynamic placeholder
 * part should appear after static part. When comparing two dynamic
 * placeholder parts or two static parts, we simply do a string comparison.
 *
 * @param  {Object} r1 route from swagger spec
 * @param  {Object} r2 route from swagger spec
 * @return {Number} < 0 if r1 should appear before r2, 0 if they are equivalent, > 1 if r1 should appear after r2
 */
function routeSorter (r1, r2) {
  const r1Parts = r1.path.split('/');
  const r2Parts = r2.path.split('/');

  // let diff = r1Parts.length - r2Parts.length;
  let numParts = Math.min(r1Parts.length, r2Parts.length);

  let i;
  for (i = 0; i < numParts; i++) {
    const diff = compareRoutePathPart(r1Parts[i], r2Parts[i]);
    if (diff !== 0) {
      return diff;
    }
  }

  // Return positive integer if r1 has more parts.
  // Otherwise, return negative integer
  let diff = r1Parts.length - r2Parts.length;
  if (diff) {
    return diff;
  }

  return r1.method.localeCompare(r2.method);
}

module.exports = (routes) => {
  routes.sort(routeSorter);
};
