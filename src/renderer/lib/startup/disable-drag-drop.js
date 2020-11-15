
export default function () {
  document.addEventListener('dragover', event => event.preventDefault())
  document.addEventListener('drop', event => event.preventDefault())
}
