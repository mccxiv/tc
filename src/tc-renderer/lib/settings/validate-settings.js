import * as R from 'ramda'
import defaults from './default-settings'

/**
 * Returns a clone of `blueprint` but with values from `untrustedObj` where
 * the keys match. The value from `untrustedObj` is only used if the type
 * matches when compared to the same key in the blueprint, otherwise the
 * blueprint value is used
 * @param {Object} blueprint
 * @param {Object} untrustedObj
 * @returns {Object} Clone of `blueprint` but with values from `untrustedObj`
 */
const fromBlueprint = (blueprint, untrustedObj) => {
  return R.pipe(
    cloneObjectSimple,
    flattenObjToDotPath,
    R.mapObjIndexed((value, _dotPath) => {
      const untrustedValue = valueAtdotPath(_dotPath)(untrustedObj)
      const untrustedType = R.type(untrustedValue)
      const blueprintType = R.type(value)
      return R.equals(untrustedType, blueprintType) ? untrustedValue : value
    }),
    unflattenObj
  )(blueprint)
}

const mergeDeepAll = R.reduce(R.mergeDeepRight, {})

const pathPairToObj = (key, val) => R.assocPath(R.split('.', key), val, {})

const unflattenObj = R.pipe(
  R.toPairs,
  R.map(R.apply(pathPairToObj)),
  mergeDeepAll
)

const cloneObjectSimple = obj => JSON.parse(JSON.stringify(obj))

const valueAtdotPath = R.useWith(R.path, [R.split('.')])

const flattenObjToDotPath = obj => {
  const go = obj_ => R.chain(([k, v]) => {
    if (R.type(v) === 'Object') {
      return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
    } else {
      return [[k, v]]
    }
  }, R.toPairs(obj_))

  return R.fromPairs(go(obj))
}

export const getValidatedSettings = (settings) => {
  return fromBlueprint(defaults, settings)
}
