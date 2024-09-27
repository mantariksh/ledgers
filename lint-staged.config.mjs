export default {
  '**/*.(js|jsx|ts|tsx)': ['eslint --cache --fix', 'prettier --write'],
  '**/*.json': ['prettier --write'],
  '**/*.yaml': ['prettier --write'],
}
