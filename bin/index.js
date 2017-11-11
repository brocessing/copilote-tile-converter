#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs-extra')
const size = require('image-size')
const PNG = require('png-js')
const analyse = require(path.join(__dirname, 'utils', 'analyse-tiles'))
const minimap = require(path.join(__dirname, 'utils', 'minimap'))

const args = require(path.join(__dirname, 'utils', 'args'))
const output = args.output || args.input.replace('.png', '.json')

const { width, height } = size(args.input)

PNG.decode(args.input, pixels => {
  /**
   * @NOTE:
   * pixels = [r,g,b,a,r,g,b,a]
   * colors = [[r,g,b], [r,g,b]]
   */
  let colors = []
  pixels = [...pixels]
  while (pixels.length > 0) {
    colors.push(pixels.splice(0, 3))
    pixels.splice(0, 1)
  }

  let roads = colors.map(c => +(c[0] > 0))
  let roads_color = colors.map(c => Math.floor(c[0] / 10))
  let roads_raw = []
  let roads_raw_color = []
  while (roads.length > 0) {
    roads_raw.push(roads.splice(0, width))
    roads_raw_color.push(roads_color.splice(0, width))
  }

  const buildings = colors.map((c, i) => {
    if (c[2] > 0) {
      const x = i % width
      const y = (i - x) / width
      return [x, y, Math.floor(c[2] / 10)]
    }
  }).filter(c => c)

  const props = colors.map((c, i) => {
    if (c[1] > 0) {
      const x = i % width
      const y = (i - x) / width
      return [x, y, Math.floor(c[1] / 10)]
    }
  }).filter(c => c)

  const roads_analysed = analyse(roads_raw, roads_raw_color)
  const minimapPaths = minimap(roads_raw, roads_analysed)

  fs.outputJson(output, {
    svg: minimapPaths,
    map: roads_raw,
    road: roads_analysed,
    buildings,
    props
  }, { spaces: args.pretty ? 2 : 0 })

  if (args.svg) {
    const svg = `<svg viewBox='-0.01 -0.01 ${width + 0.01} ${height + 0.01}'>${minimapPaths}</svg>`
    fs.outputFile(output.replace('.json', '.svg'), svg)
  }
})
