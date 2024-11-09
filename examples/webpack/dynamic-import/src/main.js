function main() {
  console.log('main')
}

main()
import('./foo').then(({ default: foo }) => foo())
