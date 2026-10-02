import { state } from './state.js';
import { randomPick } from '../utils/helpers.js';

function getAvailable() {
  return state.items.filter(item => !state.gameExcluded.has(item.id));
}

function weightedPick(arr) {
  const biasTarget = state.settings.biasEnabled ? state.settings.biasTarget : null;
  if (biasTarget && arr.some(i => i.id === biasTarget)) {
    const target = arr.find(i => i.id === biasTarget);
    const others = arr.filter(i => i.id !== biasTarget);
    if (!others.length) return target;
    return Math.random() < 0.75 ? target : randomPick(others);
  }
  return randomPick(arr);
}

export function pickItem() {
  const available = getAvailable();
  if (!available.length) throw new Error('Нет доступных номеров');
  return weightedPick(available);
}
export function getSelectionProbabilities() {
  const available = getAvailable();
  if (!available.length) return [];
  const target = state.settings.biasEnabled
    ? available.find(item => item.id === state.settings.biasTarget)
    : null;
  return available.map(item => ({
    id: item.id,
    probability: !target || available.length === 1
      ? 1 / available.length
      : item.id === target.id ? 0.75 : 0.25 / (available.length - 1)
  }));
}
