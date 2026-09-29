import { create } from 'zustand';
import { course } from '../data/course';
import { buildResume } from '../utils/resume';
import { buildGrowth } from '../utils/growth';
import { COURSE_VERSION, readProgress, writeProgress, type SavedProgress } from './progressStorage';
import type { CampusExperience, ChoiceHistoryEntry, GrowthProgress, ProjectExperience, ResumeProfile, StudentProfile } from '../types/course';
type Selections = Record<string,string[]>;
const keyAt = (unitIndex:number,stepIndex:number) => `${course[unitIndex].id}/${course[unitIndex].subSteps[stepIndex].id}`;
const find = (history:ChoiceHistoryEntry[],id:string) => history.find(item=>item.interactionId===id)?.selectedOption??[];
function derive(history: ChoiceHistoryEntry[]) {
 const participation = find(history, 'participation')[0] ?? null;
 const role = find(history, 'campus-role')[0] ?? null;
 const priorities = find(history, 'priorities');
 const crisis = find(history, 'crisis')[0] ?? null;
 const interest = find(history, 'interest')[0] ?? null;
 const initialTasks = find(history, 'initial-tasks');
 const problemSolvingChoices = find(history, 'problem-solving');
 const activityStyle = priorities.includes('safety') && priorities.includes('schedule') ? '稳健执行型'
  : priorities.includes('publicity') && priorities.includes('interaction') ? '创意传播型'
  : priorities.includes('content') && priorities.includes('interaction') ? '体验设计型'
  : priorities.length ? '协同平衡型' : null;
 const studentProfile: StudentProfile = {
  name: '本次课堂体验样本', major: '测控技术与仪器',
  campusParticipation: participation, campusRole: role, activityStyle, radarInterestLevel: interest,
 };
 // All four entry paths share the classroom activity. Organization membership
 // describes the chosen path; it is never a prerequisite for an experience.
 const campusExperience: CampusExperience = {
  joinedOrganization: participation === 'B', role, priorities, crisisChoice: crisis,
  completed: Boolean(participation && role && priorities.length === 3 && crisis),
 };
 const projectExperience: ProjectExperience = {
  projectName: '复杂停车场景下毫米波雷达目标感知与安全预警研究', initialTasks,
  challenge: problemSolvingChoices.length ? '低矮障碍物等场景中感知结果不稳定' : null,
  problemSolvingChoices, usedAI: problemSolvingChoices.includes('ai'),
  completed: Boolean(interest && initialTasks.length === 2 && problemSolvingChoices.length === 3),
 };
 return { studentProfile, campusExperience, projectExperience,
  resumeProfile: buildResume(studentProfile, campusExperience, projectExperience),
  growth: buildGrowth(history, campusExperience, projectExperience) };
}

interface CourseState {
 unitIndex:number; stepIndex:number; selections:Selections; confirmed:Record<string,boolean>; choiceHistory:ChoiceHistoryEntry[];
 studentProfile:StudentProfile; campusExperience:CampusExperience; projectExperience:ProjectExperience; resumeProfile:ResumeProfile; growth:GrowthProgress;
 speakerVisible:boolean; timerVisible:boolean; timerRunning:boolean; elapsedSeconds:number; helpVisible:boolean; resetVisible:boolean;
 pendingRestore:SavedProgress|null; storageAvailable:boolean; storageNotice:string;
 selectOption:(id:string)=>void; confirmInteraction:()=>void; reopenInteraction:()=>void;
 nextStep:()=>void; previousStep:()=>void; requestReset:()=>void; cancelReset:()=>void; confirmReset:()=>void; restoreProgress:()=>void;
 toggleSpeaker:()=>void; toggleTimer:()=>void; hideTimer:()=>void; tick:()=>void; toggleHelp:()=>void;
}
export const isCourseBlocked = (state:Pick<CourseState,'helpVisible'|'resetVisible'|'pendingRestore'>) => Boolean(state.helpVisible||state.resetVisible||state.pendingRestore);
const fresh = () => ({unitIndex:0,stepIndex:0,selections:{} as Selections,confirmed:{} as Record<string,boolean>,choiceHistory:[] as ChoiceHistoryEntry[],
 ...derive([]),speakerVisible:false,timerVisible:false,timerRunning:false,elapsedSeconds:0,helpVisible:false,resetVisible:false,pendingRestore:null});
const recovery = readProgress();
export const useCourseStore = create<CourseState>((set,get) => {
 const confirm = () => {
  const state=get(),unit=course[state.unitIndex],step=unit.subSteps[state.stepIndex],interaction=step.interaction;
  const key=keyAt(state.unitIndex,state.stepIndex),selected=state.selections[key]??[];
  if(isCourseBlocked(state)||!interaction||state.confirmed[key]||selected.length!==(interaction.maxSelections??1))return;
  const entry:ChoiceHistoryEntry={chapterId:unit.id,interactionId:step.id,selectedOption:[...selected],timestamp:Date.now(),resumeMapping:interaction.resumeMapping??null};
  const choiceHistory=[...state.choiceHistory.filter(item=>item.interactionId!==step.id),entry];
  set({confirmed:{...state.confirmed,[key]:true},choiceHistory,...derive(choiceHistory)});
 };
 return {
  ...fresh(),pendingRestore:recovery.progress,storageAvailable:recovery.storageAvailable,storageNotice:recovery.notice,
  selectOption:(id)=>{
   const state=get(),interaction=course[state.unitIndex].subSteps[state.stepIndex].interaction,key=keyAt(state.unitIndex,state.stepIndex);
   if(isCourseBlocked(state)||!interaction||state.confirmed[key]||!interaction.options.some(option=>option.id===id))return;
   const current=state.selections[key]??[];
   const next=interaction.type==='single'?[id]:current.includes(id)?current.filter(value=>value!==id):current.length<(interaction.maxSelections??1)?[...current,id]:current;
   set({selections:{...state.selections,[key]:next}});
   if(interaction.type==='single')confirm();
  },
  confirmInteraction:confirm,
  reopenInteraction:()=>{
   const state=get(),step=course[state.unitIndex].subSteps[state.stepIndex],key=keyAt(state.unitIndex,state.stepIndex);
   if(isCourseBlocked(state)||!step.interaction||!state.confirmed[key])return;
   const choiceHistory=state.choiceHistory.filter(entry=>entry.interactionId!==step.id),confirmed={...state.confirmed};delete confirmed[key];
   set({confirmed,choiceHistory,...derive(choiceHistory)});
  },
  nextStep:()=>{
   const state=get(),unit=course[state.unitIndex],step=unit.subSteps[state.stepIndex],key=keyAt(state.unitIndex,state.stepIndex);
   if(isCourseBlocked(state)||step.interaction&&!state.confirmed[key])return;
   if(state.stepIndex<unit.subSteps.length-1)set({stepIndex:state.stepIndex+1});
   else if(state.unitIndex<course.length-1)set({unitIndex:state.unitIndex+1,stepIndex:0});
  },
  previousStep:()=>{
   const state=get();if(isCourseBlocked(state))return;
   if(state.stepIndex>0)set({stepIndex:state.stepIndex-1});
   else if(state.unitIndex>0)set({unitIndex:state.unitIndex-1,stepIndex:course[state.unitIndex-1].subSteps.length-1});
  },
  requestReset:()=>{if(!get().helpVisible)set({resetVisible:true});},
  cancelReset:()=>set({resetVisible:false}),
  confirmReset:()=>{if(get().resetVisible)set({...fresh(),storageNotice:''});},
  restoreProgress:()=>{
   const saved=get().pendingRestore;if(!saved||get().resetVisible)return;
   const unitIndex=course.findIndex(unit=>unit.id===saved.unitId),stepIndex=course[unitIndex].subSteps.findIndex(step=>step.id===saved.stepId);
   const choiceHistory:ChoiceHistoryEntry[]=course.flatMap(unit=>unit.subSteps.filter(step=>saved.confirmed.includes(`${unit.id}/${step.id}`)).map(step=>({
    chapterId:unit.id,interactionId:step.id,selectedOption:saved.selections[`${unit.id}/${step.id}`],timestamp:saved.savedAt,resumeMapping:step.interaction?.resumeMapping??null,
   })));
   set({unitIndex,stepIndex,selections:saved.selections,confirmed:Object.fromEntries(saved.confirmed.map(key=>[key,true])),choiceHistory,...derive(choiceHistory),
    elapsedSeconds:saved.elapsedSeconds,timerVisible:saved.timerVisible,timerRunning:false,pendingRestore:null,storageNotice:''});
  },
  toggleSpeaker:()=>{if(!isCourseBlocked(get()))set(state=>({speakerVisible:!state.speakerVisible}));},
  toggleTimer:()=>{if(!isCourseBlocked(get()))set(state=>({timerVisible:true,timerRunning:state.timerVisible?!state.timerRunning:state.timerRunning||state.elapsedSeconds===0}));},
  hideTimer:()=>set({timerVisible:false}),
  tick:()=>{if(get().timerRunning&&!isCourseBlocked(get()))set(state=>({elapsedSeconds:state.elapsedSeconds+1}));},
  toggleHelp:()=>{if(!get().pendingRestore&&!get().resetVisible)set(state=>({helpVisible:!state.helpVisible}));},
 };
});

// Save only source data; derived copy and capability keywords are regenerated
// on restore. Opening a recovery/reset dialog never overwrites the old record.
function persisted(state:CourseState) {
 const unit=course[state.unitIndex];
 return {version:1 as const,courseVersion:COURSE_VERSION,unitId:unit.id,stepId:unit.subSteps[state.stepIndex].id,
  selections:state.selections,confirmed:Object.keys(state.confirmed).filter(key=>state.confirmed[key]),elapsedSeconds:state.elapsedSeconds,timerVisible:state.timerVisible};
}
if(typeof window!=='undefined')useCourseStore.subscribe((state,previous)=>{
 if(state.pendingRestore||state.resetVisible)return;
 const value=persisted(state),old=persisted(previous);
 if(JSON.stringify(value)===JSON.stringify(old)&&!previous.pendingRestore)return;
 const hasProgress=state.unitIndex!==0||state.stepIndex!==0||Object.keys(state.selections).length>0||state.elapsedSeconds>0;
 const ok=writeProgress(hasProgress?{...value,savedAt:Date.now()}:null);
 if(ok!==state.storageAvailable)useCourseStore.setState({storageAvailable:ok,storageNotice:ok?'':'当前浏览器无法保存本机进度。'});
});
export const selectionKey=keyAt;
