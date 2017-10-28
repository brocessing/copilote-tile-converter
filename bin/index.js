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

  let bytes = colors.map(c => +!c.find(h => h !== 0))

  let tiles_raw = []
  while (bytes.length > 0) tiles_raw.push(bytes.splice(0, width))

  fs.outputJson(output, {
    map: tiles_raw,
    data: analyse(tiles_raw)
  }, { spaces: args.pretty ? 2 : 0 })
})
