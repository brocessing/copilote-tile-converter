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
    return {
      ...tile,
      t: (onBound(tile.p, { width, height }) && tile.t === 1) ? 0 : tile.t,
      steps: 0
    }
  })

  let paths = []
  let ends = tiles.filter(tile => tile.t === 0)
  while (ends.length) {
    ends.forEach(e => paths.push(walk(e)))
    ends = tiles.filter(t => t.t > 2 && t.steps < t.t)
  }

  return paths.map(path => createSVGPath(path)).join('')

  function walk (currentTile, dir = null, path = []) {
    // if dir does not exist yet, then it is the first step in the walk
    if (!dir) {
      // the first step of the walk cannot be on a tile already stepped on
      if (currentTile.steps++ > currentTile.t) return path
      path.push(currentTile.p)
    }

    // if dir already exists, then it is not the first step in the walk
    // if the current tile is flagged as an end, then stop the walk
    if (dir && currentTile.t === 0) {
      path.push(currentTile.p)
      return path
    }

    // if dir does not exist yet, choose a direction
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
    if (nextTile && nextTile.steps < nextTile.t) {
      nextTile.steps++
      return walk(nextTile, dir, path)
    }

    // if no next tile, then the walk is finished
    path.push(currentTile.p)
    return path
  }

  function inBound ([x, y]) { return x >= 0 && y >= 0 && x < width && y < height }
  function onBound ([x, y]) { return x === 0 || y === 0 || x === width - 1 || y === height - 1 }

  function chooseInitialDirection (tile) {
    return tile.n
      .map((n, i) => +n && calcNeighborDirection(i))
      .filter(n => n)
      .find(dir => inBound([tile.p[0] + dir.x, tile.p[1] + dir.y]))
  }

  function createSVGPath (path) {
    const sequence = path.map(([x, y], i) => {
      let xoff = x === 0 ? 0 : (x === width - 1 ? 1 : 0.5)
      let yoff = y === 0 ? 0 : (y === height - 1 ? 1 : 0.5)
      return `${i === 0 ? 'M' : 'L'} ${x + xoff} ${y + yoff}`
    })
    return `<path d="${sequence.join(' ')}"/>`
  }
}
