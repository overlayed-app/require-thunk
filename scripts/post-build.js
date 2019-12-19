const fs = require('fs')
const prettier = require('prettier')

const src = `${__dirname}/../dist/index.d.ts`
const dst = `${__dirname}/../index.d.ts`

const input = fs.readFileSync(src, 'utf-8')
const outputRaw = `declare module "require-thunk" {
  ${input.replace(/declare/g, '')}
}
`

prettier.resolveConfig(dst).then(options => {
  const formatted = prettier.format(outputRaw, { ...options, filepath: src })
  fs.writeFileSync(dst, formatted, { encoding: 'utf-8' })
  console.log('placed index.d.ts')
})
