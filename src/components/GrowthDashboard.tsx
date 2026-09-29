import { course } from '../data/course';
import { buildGrowth } from '../utils/growth';
import { useCourseStore } from '../store/courseStore';

export function GrowthDashboard() {
  const state = useCourseStore();
  const growth = state.growth;
  const projectPhase = state.unitIndex >= course.findIndex(unit => unit.id === 'chapter-04');
  const history = state.choiceHistory.filter(entry => projectPhase ? ['interest','initial-tasks','problem-solving'].includes(entry.interactionId) : ['participation','campus-role','priorities','crisis'].includes(entry.interactionId));
  const keywords = buildGrowth(history,state.campusExperience,state.projectExperience).keywords;
  const visibleKeywords = keywords.slice(-6);
  return <aside className="growth-monitor" aria-label="课堂体验进度">
    <span className="growth-title">课堂体验</span>
    <div className="experience-count"><strong>{growth.completedExperiences}<small> / 2</small></strong><span>已完成的体验</span></div>
    <div className="experience-status"><span>校园活动</span><b>{growth.campusCompleted ? '已体验' : '待体验'}</b></div>
    <div className="experience-status"><span>专业项目</span><b>{growth.projectCompleted ? '已体验' : '待体验'}</b></div>
    <p className="interaction-progress">互动完成 {growth.completedInteractions} / {growth.totalInteractions}</p>
    <h3>{projectPhase?'专业体验关键词':'校园体验关键词'}</h3>
    <div className="growth-keywords">{visibleKeywords.length ? visibleKeywords.map(keyword => <span key={keyword}>{keyword}</span>) : <p>完成本阶段选择后呈现</p>}</div>
    <p className="growth-note">{keywords.length>6&&<>另涉及 {keywords.length-6} 项关键词<br/></>}记录课堂体验<br/>不作能力评分</p>
  </aside>;
}
