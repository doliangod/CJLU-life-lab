import { useEffect } from 'react';
import { course } from '../data/course';
import { selectionKey, useCourseStore } from '../store/courseStore';

export function KeyboardController() {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const state = useCourseStore.getState();
      const key = event.key.toLowerCase();
      if (state.resetVisible || state.pendingRestore) {
        if (state.resetVisible && key === 'escape') { event.preventDefault(); state.cancelReset(); }
        return;
      }
      // A modal owns the keyboard even when its close button has focus.
      if (state.helpVisible) {
        if (key === 'escape' || key === 'h') {
          event.preventDefault();
          state.toggleHelp();
        }
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement &&
          (target.matches('input, textarea, select') || target.isContentEditable)) return;
      const interaction = course[state.unitIndex].subSteps[state.stepIndex].interaction;
      if (/^[1-6]$/.test(key) && interaction) {
        event.preventDefault();
        const option = interaction.options[Number(key) - 1];
        if (option) state.selectOption(option.id);
        return;
      }
      if (key === 'enter') {
        if (interaction?.type === 'multiple' && !state.confirmed[selectionKey(state.unitIndex, state.stepIndex)]) {
          event.preventDefault();
          state.confirmInteraction();
          return;
        }
        // Preserve native Enter activation for focused buttons, without also
        // submitting an interaction or activating the same control twice.
        if (target instanceof HTMLElement && target.closest('button')) return;
        event.preventDefault();
        state.confirmInteraction();
        return;
      }
      if (event.code === 'Space' || key === ' ' || key === 'arrowright') {
        event.preventDefault();
        state.nextStep();
        return;
      }
      if (key === 'arrowleft') { event.preventDefault(); state.previousStep(); }
      if (key === 'p') { event.preventDefault(); state.toggleSpeaker(); }
      if (key === 't') { event.preventDefault(); state.toggleTimer(); }
      if (key === 'h') { event.preventDefault(); state.toggleHelp(); }
      if (key === 'r') { event.preventDefault(); state.requestReset(); }
      if (key === 'f') {
        event.preventDefault();
        const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        void request.catch(() => { /* Browser may decline fullscreen. */ });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return null;
}
