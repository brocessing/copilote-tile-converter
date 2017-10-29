#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs-extra')
const size = require('image-size')
const PNG = require('png-js')
const analyse = require(path.join(__dirname, 'utils', 'analyse-tiles'))

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

  let roads = colors.map(c => +(c[0] === 255))
  let roads_raw = []
  while (roads.length > 0) roads_raw.push(roads.splice(0, width))

  let buildings = colors.map((c, i) => {
    if (c[2] > 0) {
      let x = i % width
      let y = (i - x) / width
      return [x, y, parseFloat((c[2] / 255).toFixed(2))]
    }
  }).filter(c => c)

  let props = colors.map((c, i) => {
    if (c[1] > 0) {
      let x = i % width
      let y = (i - x) / width
      return [x, y, parseFloat((c[1] / 255).toFixed(2))]
    }
  }).filter(c => c)

  fs.outputJson(output, {
    map: roads_raw,
    road: analyse(roads_raw),
    buildings,
    props
  }, { spaces: args.pretty ? 2 : 0 })
})
