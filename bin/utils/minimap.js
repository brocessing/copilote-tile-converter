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

function createSVGPath (path) {
  const sequence = path.map((point, i) => {
    return `${i === 0 ? 'M' : 'L'} ${point[0] + 0.5} ${point[1] + 0.5}`
  })
  return `<path d="${sequence.join(' ')}"/>`
}

module.exports = function (tiles_raw, road) {
  const width = tiles_raw[0].length
  const height = tiles_raw.length
  const tiles = Object.values(road).map(tile => {
    return {
      ...tile,
      end: tile.t === 0 || onBound(tile.p, { width, height })
    }
  })

  const ends = tiles.filter(tile => tile.end)

  let paths = []
  ends.forEach(e => paths.push(walk(e)))

  return paths.map(path => createSVGPath(path)).join('')

  function walk (currentTile, dir = null, path = []) {
    // if dir does not exist yet, then it is the first step in the walk
    if (!dir) {
      path.push(currentTile.p)
    }

    // if dir already exists, then it is not the first step in the walk
    // if the current tile is flagged as an end, then stop the walk
    if (dir && currentTile.end) {
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
        .find(d => {
          return (Math.abs(dir.x) && Math.abs(d.y)) || (Math.abs(dir.y) && Math.abs(d.x))
        })
    }

    // the next tile is the current tile + the direction
    const nextTile = tiles.find(t => t.p[0] === currentTile.p[0] + dir.x && t.p[1] === currentTile.p[1] + dir.y)

    // if the next tile exist, walk on it
    if (nextTile) return walk(nextTile, dir, path)

    // if no next tile, then the walk is finished
    path.push(currentTile.p)
    return path
  }

  function onBound ([x, y]) {
    return x === 0 || y === 0 || x === width - 1 || y === height - 1
  }

  function chooseInitialDirection (tile) {
    return tile.n
      .map((n, i) => +n && calcNeighborDirection(i))
      .filter(n => n)
      .find(dir => {
        return tile.p[0] + dir.x >= 0 && tile.p[1] + dir.y >= 0 && tile.p[0] + dir.x < width && tile.p[1] + dir.y < height
      })
  }

}