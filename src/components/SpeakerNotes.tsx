import { Mic2, X } from 'lucide-react';
import { course } from '../data/course';
import { isCourseBlocked, useCourseStore } from '../store/courseStore';
const format = (seconds: number) => `${Math.floor(seconds / 60)}分${seconds % 60 ? `${seconds % 60}秒` : ''}`;
export function SpeakerNotes() {
  const state = useCourseStore();
  if (!state.speakerVisible || isCourseBlocked(state)) return null;
  const unit = course[state.unitIndex], step = unit.subSteps[state.stepIndex];
  return <aside className="speaker-notes" aria-label="讲师提示">
    <div><Mic2 /><b>讲师提示</b><span>{unit.title} · 建议{format(unit.recommendedDuration)}</span>
      <button className="close-notes" onClick={state.toggleSpeaker} aria-label="关闭讲师提示"><X /></button>
    </div>
    <p>{step.speakerNotes}</p>
    <small>本次授课已计时 {Math.floor(state.elapsedSeconds / 60)}:{String(state.elapsedSeconds % 60).padStart(2, '0')}</small>
  </aside>;
}
