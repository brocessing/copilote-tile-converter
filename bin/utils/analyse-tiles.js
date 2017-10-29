'use strict'

const isRoad = raw_tile => raw_tile !== 0

module.exports = function (tiles_raw, colors_raw) {
  const width = tiles_raw[0].length
  const height = tiles_raw.length

  let tiles = {}

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let tile = getRawTile(x, y)
      if (isRoad(tile)) {

        let neighbors = getDirectNeighbors(x, y)
        let type = findType(neighbors)

        tiles[x + '.' + y] = {
          c: colors_raw[y][x],
          p: [x, y],
          n: neighbors,
          t: type,
          r: calcRotation(type, neighbors)
        }
      }
    }
  }

  return tiles

  function getRawTile (x, y) {
    // @NOTE: undefined means that the tile is on boundary.
    // There will always be another tile after the boundary so undefined === 1
    return tiles_raw[y] !== undefined
      ? (tiles_raw[y][x] !== undefined
         ? tiles_raw[y][x]
         : 1)
      : 1
  }

  function getDirectNeighbors (x, y) {
    return [
      [0, -1],
      [+1, 0],
      [0, +1],
      [-1, 0]].map(npos => getRawTile(x + npos[0], y + npos[1]))
  }

  function findType (neighbors) {
    // @NOTE:
    // 0: dead-end
    // 1: straight
    // 2: turn
    // 3: tee
    // 4: cross
    const len = neighbors.filter(n => n).length
    switch (len) {
      case 1 : return 0
      case 3 : return 3
      case 4 : return 4

      case 2 : {
        for (let i = 0; i < neighbors.length ; i++) {
          if (neighbors[i] && neighbors[((i + 1) % (neighbors.length))]) return 2
        }
        return 1
      }
    }
  }

  function calcRotation (type, neighbors) {
    if (type === 0 || type === 1) {
      // 0: from bottom to top
      if (neighbors[2]) return 0
      if (neighbors[1]) return 1
      if (neighbors[0]) return 2
      if (neighbors[3]) return 3
    }

    if (type === 2) {
      // 0: from bottom to right
      if (neighbors[2] && neighbors[1]) return 0
      if (neighbors[1] && neighbors[0]) return 1
      if (neighbors[0] && neighbors[3]) return 2
      if (neighbors[3] && neighbors[2]) return 3
    }

    if (type === 3) {
      // 0: |-
      if (neighbors[0] && neighbors[2]) {
        if (neighbors[1]) return 0
        if (neighbors[3]) return 2
      }

      if (neighbors[1] && neighbors[3]) {
        if (neighbors[0]) return 1
        if (neighbors[2]) return 3
      }
    }

    if (type === 4) return 0
  }
}
