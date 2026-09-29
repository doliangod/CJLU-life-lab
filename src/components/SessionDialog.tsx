import { useEffect, useRef } from 'react';
import { course } from '../data/course';
import { useCourseStore } from '../store/courseStore';

export function SessionDialog() {
  const state = useCourseStore();
  const dialog = useRef<HTMLElement>(null);
  const safeButton = useRef<HTMLButtonElement>(null);
  const mode = state.resetVisible?'reset':state.pendingRestore?'restore':null;
  useEffect(() => {
    if(!mode)return;
    const previousFocus=document.activeElement;
    safeButton.current?.focus();
    return ()=>{if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus();};
  },[mode]);
  if(!mode)return null;
  const saved=state.pendingRestore;
  const pages=course.flatMap(unit=>unit.subSteps);
  const savedPage=saved?pages.findIndex(step=>step.id===saved.stepId):-1;
  return <div className="modal-backdrop session-backdrop" onClick={()=>{if(mode==='reset')state.cancelReset();}}>
    <section className="session-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="session-title" onClick={event=>event.stopPropagation()}
      onKeyDown={event=>{
        if(event.key!=='Tab')return;
        const buttons=dialog.current?.querySelectorAll('button');if(!buttons?.length)return;
        const first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }}>
      <span className="session-eyebrow">大学四年人生实验室</span>
      <h2 id="session-title">{mode==='reset'?'重新开始这堂课？':'继续上次的课程？'}</h2>
      {mode==='reset'?<p>将清空本机保存的选择、模拟简历与计时。确认后无法撤销。</p>:<>
        <p>上次停在第 {savedPage+1} / {pages.length} 页</p><strong>{pages[savedPage]?.title}</strong>
        <p className="session-detail">保留已确认的答案和未完成的选择；计时器恢复后先暂停。</p>
      </>}
      <div className="session-actions">{mode==='reset'?<>
        <button ref={safeButton} onClick={state.cancelReset}>取消</button>
        <button className="destructive" onClick={state.confirmReset}>确认重新开始</button>
      </>:<>
        <button ref={safeButton} className="primary" onClick={state.restoreProgress}>继续上次课程</button>
        <button onClick={state.requestReset}>从头开始</button>
      </>}</div>
    </section>
  </div>;
}
