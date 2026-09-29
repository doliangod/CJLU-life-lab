import { useEffect } from 'react';
import { Clock3, Pause, Play, X } from 'lucide-react';
import { totalRecommendedDuration } from '../data/course';
import { isCourseBlocked, useCourseStore } from '../store/courseStore';
const format = (seconds:number) => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
export function CourseTimer() {
  const state = useCourseStore();
  useEffect(() => { const id=window.setInterval(()=>useCourseStore.getState().tick(),1000);return ()=>clearInterval(id); },[]);
  if(!state.timerVisible)return state.elapsedSeconds>0||state.timerRunning?<button className="timer-reopen" inert={isCourseBlocked(state)} onClick={state.toggleTimer} aria-label="显示计时器"><Clock3 size={16}/>{state.timerRunning?'计时中':'计时已暂停'} · 显示</button>:null;
  return <div className="floating-timer" inert={isCourseBlocked(state)}><Clock3/><b>{format(state.elapsedSeconds)}</b>
    <span>/ {format(totalRecommendedDuration)} · {state.timerRunning?'计时中':'已暂停'}</span>
    <button onClick={state.toggleTimer} aria-label={state.timerRunning?'暂停计时':'继续计时'}>{state.timerRunning?<Pause/>:<Play/>}</button>
    <button onClick={state.hideTimer} aria-label="隐藏计时器"><X/></button>
  </div>;
}
