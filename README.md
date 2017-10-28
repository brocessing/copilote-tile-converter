# copilote-tile-converter
> generate [copilote](https://github.com/brocessing/copilote) road tiles from a `png`.

<br>
<br>
<br>

## Installation
```sh
$ npm i -g brocessing/copilote-tile-converter
```

<br>

## Table of correspondance

| hex | type |
| :--- | :--- |
| `#000000` | road |
| `#FF0000` | props |

<br>

## Usage
```
copit

Usage:
  copit -i tile.png
  copit -i tile.png -o tile.json
  copit --help
  copit --version

Options:
  -h, --help              Show this screen.
  -i, --input <path>      Specify the png file to convert from.
  -o, --output <path>     Specify the json file to output to.
  -p, --pretty            Add spaces and line breaks to the json.
  -v, --version           Print the current version.
```

<br>

## License
[MIT](https://tldrlegal.com/license/mit-license).
