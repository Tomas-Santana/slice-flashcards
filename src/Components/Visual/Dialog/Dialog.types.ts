export interface DialogProps {
  content: Node | Node[]
  onClose: () => void
  startingState?: 'open' | 'closed'

}
