const TreeModel = require("tree-model")
const Debug = require("debug")
const Tree = new TreeModel()

const debug = Debug("beam-search")

// const debug = console.log

const addOne = (x) => x + 1
const notEmpty = (arr) => arr.length > 0

export class BeamSearch {
  options: any
  constructor(options) {
    this.options = {
      width: Object.assign(
        {
          initial: 1,
          next: addOne,
        },
        options.width || {}
      ),
      generateChildren: options.childrenGenerator,
      compareNodes: options.childrenComparator,
      isSolution: options.solutionValidator,
      enoughSolutions: options.enoughSolutions || notEmpty,
    }
    this.options.width.max =
      this.options.width.max || this.options.width.initial
  }

  searchFrom(seed) {
    const root = seed

    const {
      generateChildren,
      compareNodes,
      isSolution,
      enoughSolutions,
    } = this.options

    const solutions = []

    const width = this.options.width.initial
    const max = this.options.width.max > 0 ? this.options.width.max : width

    // while (width <= max) {
    let open = [root]
    let nodeCount = 1
    let openCount = 1

    debug(`Using beam width: ${width}`)
    while (open.length > 0) {
      const nietos = []
      open.forEach((thisNode) => {
        debug(`Opening node: ${JSON.stringify(thisNode)}`)

        const opciones = generateChildren(thisNode)
        debug(`Generated ${opciones.length} children`)

        opciones.forEach((c) => {
          const childNode = c

          if (isSolution(childNode)) {
            solutions.push(childNode)
          } else {
            nietos.push(childNode)
          }
        })
      })
      nodeCount += nietos.length

      open = nietos
        .sort((a, b) => compareNodes(a, b))
        .slice(0, width === -1 ? undefined : width)

      openCount += open.length
    }

    debug(`${nodeCount} nodes created, ${openCount} nodes explored`)

    // if (this.options.enoughSolutions && enoughSolutions(solutions)) {
    //   break
    // }

    // width = this.options.width.next(width)
    // }

    return solutions
  }
}
