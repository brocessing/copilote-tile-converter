'use strict'

function calcNeighborDirection (index) {
  switch (index) {
    case 0: return { x: 0, y: -1 }
    case 1: return { x: 1, y: 0 }
    case 2: return { x: 0, y: 1 }
    case 3: return { x: -1, y: 0 }
  }
}

function getNeighbor (tile, dir) {
  return tile.n.find(n => {
    const ndir = calcNeighborDirection(n)
    return ndir.x === dir.x && ndir.y === dir.y
  })
}

function directionsAreOnSameAxes (a, b) {
  return (Math.abs(a.x) && Math.abs(b.y)) || (Math.abs(a.y) && Math.abs(b.x))
}

module.exports = function (tiles_raw, road) {
  const width = tiles_raw[0].length
  const height = tiles_raw.length
  const tiles = Object.values(road).map(tile => {
    // in a single chunk context, onBound straight lines are deadends
    const t = (tile.t === 1 && onBound(tile.p, { width, height })) ? 0 : tile.t
    return {
      ...tile,
      // paths ends are either deadends (t0) or T (t3)
      end: t === 0 || t === 3,
      t
    }
  })

  let paths = []
  tiles.filter(tile => tile.end).forEach(e => paths.push(walk(e)))

  return paths.map(path => createSVGPath(path)).join('')

  function walk (currentTile, dir = null, path = []) {
    // immediately stop the walk if the first tile has already been done
    if (!dir && currentTile.end && currentTile.done) return []

    path.push(currentTile.p)

    // stop the walk if the tile is a deadend, only if it is not the first step
    if (dir && currentTile.end && currentTile.t === 0) {
      currentTile.done = true
      return path
    }

    dir = dir || chooseInitialDirection(currentTile)

    // if the current tile is a turn, then change the direction to point
    // to the next available neighbor
    if (currentTile.t === 2) {
      path.push(currentTile.p)
      dir = currentTile.n
        .map((n, i) => +n && calcNeighborDirection(i))
        .find(d => directionsAreOnSameAxes(dir, d))
    }

    // the next tile is the current tile + the direction
    const nextTile = tiles.find(t => t.p[0] === currentTile.p[0] + dir.x && t.p[1] === currentTile.p[1] + dir.y)

    // if the next tile exist, walk on it
    if (nextTile) return walk(nextTile, dir, path)

    // if no next tile, then the walk is finished
    currentTile.done = true
    return path
  }

  function inBound ([x, y]) { return x >= 0 && y >= 0 && x < width && y < height }
  function onBound ([x, y]) { return x === 0 || y === 0 || x === width - 1 || y === height - 1 }

  function chooseInitialDirection (tile) {
    // for a T, the initial direction is the "trunk" of the T
    if (tile.t == 3) {
      switch (tile.r) {
        case 0: return { x: 1, y: 0 }
        case 1: return { x: 0, y: -1 }
        case 2: return { x: -1, y: 0 }
        case 3: return { x: 0, y: 1 }
      }
    }

    if (tile.t === 0 || tile.t === 1) {
      return tile.n
        .map((n, i) => +n && calcNeighborDirection(i))
        .filter(n => n)
        .find(dir => inBound([tile.p[0] + dir.x, tile.p[1] + dir.y]))
    }
  }

  function createSVGPath (path) {
    const sequence = path.map(([x, y], i) => {
      let xoff = x === 0 ? -0.01 : (x === width - 1 ? 1.01 : 0.5)
      let yoff = y === 0 ? -0.01 : (y === height - 1 ? 1.01 : 0.5)
      return `${i === 0 ? 'M' : 'L'} ${x + xoff} ${y + yoff}`
    })
    return `<path d="${sequence.join(' ')}"/>`
  }
}
