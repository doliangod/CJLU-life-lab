import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';

const keys = [
  ['Space / →', '下一页'], ['←', '上一页'], ['1—6', '选择互动选项'],
  ['Enter', '确认多选 / 操作焦点按钮'], ['P', '讲师提示'], ['T', '显示计时器 / 开始暂停'],
  ['R', '重新开始（需确认）'], ['F', '全屏'], ['H / Esc', '关闭帮助'],
];

export function HelpOverlay() {
  const { helpVisible, toggleHelp } = useCourseStore();
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!helpVisible) return;
    const previousFocus = document.activeElement;
    closeButton.current?.focus();
    return () => { if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); };
  }, [helpVisible]);
  if (!helpVisible) return null;
  return <div className="modal-backdrop" onClick={toggleHelp}>
    <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"
      onClick={event => event.stopPropagation()}
      onKeyDown={event => {
        // The close button is the only interactive control in this dialog.
        if (event.key === 'Tab') { event.preventDefault(); closeButton.current?.focus(); }
      }}>
      <button ref={closeButton} onClick={toggleHelp} aria-label="关闭帮助"><X /></button>
      <span>PRESENTER CONTROL</span><h2 id="help-title">讲师控制</h2>
      {keys.map(([key, description]) => <p key={key}><kbd>{key}</kbd><b>{description}</b></p>)}
      <small>选错后点击“重新选择”，其他题的答案会保留。</small>
    </section>
  </div>;
}
