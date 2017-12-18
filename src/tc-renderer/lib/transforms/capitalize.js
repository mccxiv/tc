export default function capitalize (input) {
  input = input || ''
  return input.charAt(0).toUpperCase() + input.slice(1)
}
