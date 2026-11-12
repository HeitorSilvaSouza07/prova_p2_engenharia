export function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarHora(hora) {
  if (!hora) return '';
  return String(hora).slice(0, 5);
}

export function formatarPeso(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return String(valor ?? '');
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(2).replace('.', ',');
}

export function truncar(texto, limite = 70) {
  const value = String(texto || '');
  return value.length > limite ? `${value.slice(0, limite)}…` : value;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function partesData(data) {
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return { dia, mes: MESES[Number(mes) - 1] || mes, ano };
}

export function diaSemana(data) {
  const [ano, mes, dia] = String(data).slice(0, 10).split('-').map(Number);
  const date = new Date(ano, mes - 1, dia);
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}
