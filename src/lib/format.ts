export function formatCedi(amount: number) {
  const rounded = Math.round(amount);
  return `GH₵${String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
