const equalValue = (prev, next) => {
  const status = !deepEqual(prev.value, next.value)
  console.log(status)
  return status
}

const equalKey = (prev, next) => {
  const status = !deepEqual(prev.key, next.key)
  console.log(status)
  return status
}

function deepEqual (obj1, obj2) {
  // Check for strict equality or non-object types
  if (obj1 === obj2) return true
  if (
    obj1 == null ||
    typeof obj1 !== 'object' ||
    obj2 == null ||
    typeof obj2 !== 'object'
  ) { return false }

  // Handle Date objects
  if (obj1 instanceof Date && obj2 instanceof Date) { return obj1.getTime() === obj2.getTime() }

  // Handle RegExp objects
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) { return obj1.toString() === obj2.toString() }

  // Handle Array objects
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false
    }
    return true
  }

  // Handle Map objects
  if (obj1 instanceof Map && obj2 instanceof Map) {
    if (obj1.size !== obj2.size) return false
    for (const [key, value] of obj1) {
      if (!obj2.has(key) || !deepEqual(value, obj2.get(key))) return false
    }
    return true
  }

  // Handle Set objects
  if (obj1 instanceof Set && obj2 instanceof Set) {
    if (obj1.size !== obj2.size) return false
    for (const value of obj1) {
      if (!obj2.has(value)) return false
    }
    return true
  }

  // Handle general objects
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

module.exports = {
  equalValue,
  equalKey
}
