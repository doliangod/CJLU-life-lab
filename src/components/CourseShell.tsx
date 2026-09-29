import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CircleHelp, Maximize2, RotateCcw, Sparkles, Mic2 } from 'lucide-react';
import { chapters, course } from '../data/course';
import { isCourseBlocked, selectionKey, useCourseStore } from '../store/courseStore';
import type { SubStep } from '../types/course';
import { GrowthDashboard } from './GrowthDashboard';
import { CourseTimer } from './CourseTimer';
import { KeyboardController } from './KeyboardController';
import { HelpOverlay } from './HelpOverlay';
import { SessionDialog } from './SessionDialog';
import { Resume } from './Resume';
import { SpeakerNotes } from './SpeakerNotes';
import { SolutionScene, ProjectRecapScene, ProjectBridge } from './ProjectJourney';
import { CountdownScene } from './CountdownScene';
import { activityCrisis, plannedCrisisTimeline } from '../data/activityCrisis';

function ChallengeIntro(){const stages=[['01','停车场','每天都可能见到'],['02','一辆汽车','正在缓慢倒车'],['03','一个问题','它为什么知道后面有东西？']];return <div className="challenge-entry"><div className="challenge-cards">{stages.map(([number,title,detail],index)=><motion.div key={number} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:index*.12}}><span>{number}</span><b>{title}</b><small>{detail}</small></motion.div>)}</div></div>}

function CanteenScene(){const observations=[['0.8 m','较远','滴——'],['0.6 m','靠近','滴—滴—'],['0.4 m','很近','滴滴滴——']];return <div className="life-scene radar-observation-scene"><p className="radar-scene-caption">2027 · 校园生活｜一辆汽车正在缓慢向后移动</p><div className="radar-car-stage"><div className="car"><i/><i/></div><div className="obstacle"/></div><div className="radar-distance-sequence">{observations.map(([distance,state,sound],index)=><div key={distance}><b>{distance}</b><small>{state}</small><span>{sound}</span>{index<observations.length-1&&<i>→</i>}</div>)}</div><div className="radar-observation-question"><b>汽车怎么知道障碍物有多远？</b><p>至少，它需要先获得目标和距离信息。</p></div></div>}

function ParkingScene({selected,confirmed}:{selected:string;confirmed:boolean}){
 return <div className={`life-scene parking-scene ${confirmed?`result-${selected}`:''}`}><div className="parking-lane"><div className="car"><i/><i/></div><div className="obstacle"/><div className="distance"><b>0.8 → 0.6 → 0.4 m</b><span>柱子 · 行人 · 低矮障碍物</span></div></div>{confirmed&&<div className="sensor-fusion">{['存在','距离','位置','目标类型','运动状态'].map((item,index)=><span className={selected==='A'&&index>0||selected==='B'&&index>1?'dim':''} key={item}>{item}</span>)}<b>理解现实世界</b></div>}</div>
}

function RadarSummaryScene(){const information=[['目标存在',''],['距离','0.6 m'],['位置','右后方'],['目标类型','低矮障碍物'],['运动状态','静止 / 移动']];return <div className="life-scene radar-summary-scene"><div className="radar-car-stage radar-current-state"><div className="car"><i/><i/></div><div className="obstacle"/><p><b>0.6 m</b><span>右后方 · 低矮障碍物</span></p></div><div className="radar-information-grid">{information.map(([title,value],index)=><motion.div key={title} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:index*.1}}><span>{String(index+1).padStart(2,'0')}</span><b>{title}</b>{value&&<small>{value}</small>}</motion.div>)}</div><div className="radar-summary-copy"><p>对机器来说，“看见”并不是得到一个数字，而是逐步获得距离、位置、目标类型和状态等信息。</p><p>从测量一个距离，到理解周围环境，这正是测控与智能感知不断延伸的问题。</p><strong>那么，雷达到底是怎么知道后面有什么的？</strong></div></div>}

function EnterpriseReview(){const campus=['沟通协调','任务推进','现场应变','结果复盘'],project=['专业实践','问题解决','团队协作','结果验证'],questions=['你本人做了什么？','为什么这样做？','遇到了什么问题？','你怎么解决？','最后形成了什么结果？'];return <div className="enterprise-review-page"><div className="enterprise-review-grid"><section><span>校园经历</span><b>组织过一次校园活动</b><div>{campus.map(item=><i key={item}>{item}</i>)}</div></section><section><span>项目经历</span><b>持续参与一项挑战杯专业项目</b><div>{project.map(item=><i key={item}>{item}</i>)}</div></section></div><div className="enterprise-five-questions"><p>企业看到经历名称以后，往往还会继续问：</p><div>{questions.map(item=><span key={item}>{item}</span>)}</div></div><strong>经历名称只是入口，真实任务才会留下能力证据。</strong></div>}
function ChoicesScene(){const rows=['高数 · 室友 · 朋友 · 社团 · 学生组织 · 校园活动','志愿服务 · 实验室 · 竞赛 · 科研 · 运动 · 旅行 · AI','实习 · 考研 · 就业 · 兴趣 · 成长 · 方向'];return <div className="choices-scene">{rows.map(row=><p key={row}>{row}</p>)}</div>}
function GenericVisual({step,selected}:{step:SubStep;selected:string[]}){
 const state=useCourseStore();
 if(step.id==='days')return null;
 if(step.id==='thirty-days')return <div className="closing-actions">{step.content.map((item,index)=>{const [title,...detail]=item.split('：');return <article key={title}><span>0{index+1}</span><h2>{title}</h2><p>{detail.join('：')}</p></article>})}<strong>从其中一件开始。</strong></div>;
 if(step.id==='choices')return <ChoicesScene/>;
 if(step.visual==='canteen')return <CanteenScene/>;
 if(step.visual==='parking')return <RadarSummaryScene/>;
 if(step.visual==='challengeIntro')return <ChallengeIntro/>;
 if(step.id==='enterprise-origin')return <div className="reality-check enterprise-origin-scene">{step.content.map(item=><span key={item}>{item}</span>)}</div>;
 if(step.id==='reality')return <EnterpriseReview/>;
 if(step.id==='solution')return <SolutionScene/>;
 if(step.id==='project-recap')return <ProjectRecapScene/>;
 if(step.visual==='roadmap')return <div className="route-visual">{['生活','专业','实践','协作','职业','选择'].map(item=><span key={item}>{item}</span>)}</div>;
 if(step.visual==='countdown')return <CountdownScene step={step}/>;
 if(step.visual==='ending')return <div className="ending-visual">1460<small>YOUR DAYS</small></div>;
 if(step.visual==='dorm')return <div className="people-scene"><div className="people-row">{['室友A','室友B','我','同学'].map(item=><span key={item}><i/>{item}</span>)}</div><div className="message-wall">{step.content.map(item=><motion.p key={item} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}}>{item}</motion.p>)}</div></div>;

 if(step.visual==='infoWall'&&step.interaction)return null;
 if(step.visual==='infoWall')return <div className="info-wall">{step.content.join(' · ').split(' · ').map((item,index)=><motion.span key={`${item}-${index}`} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:index*.04}}>{item}</motion.span>)}</div>;
 if(step.visual==='activityRole')return <div className="activity-workbench"><b>{state.studentProfile.campusRole?'本次任务台':'校园活动体验成员'}</b>{(state.studentProfile.campusRole==='planning'?['主题','环节','时间','人员']:state.studentProfile.campusRole==='media'?['海报','推文','视频','现场素材']:state.studentProfile.campusRole==='execution'?['签到','引导','物资','现场秩序']:state.studentProfile.campusRole==='hosting'?['主持稿','互动流程','舞台时间表']:state.studentProfile.campusRole==='logistics'?['场地','设备','人员','物资','时间']:['7 DAYS','策划','分工','执行']).map(item=><span key={item}>{item}</span>)}</div>;
 if(step.visual==='taskBoard')return <div className="task-board"><b>{state.studentProfile.activityStyle??'活动筹备中'}</b>{selected.map(item=><span key={item}>{step.interaction?.options.find(option=>option.id===item)?.title}</span>)}</div>;
 if(step.visual==='activityCrisis'){
  const timeline=activityCrisis[state.campusExperience.crisisChoice??'']?.timeline??plannedCrisisTimeline;
  return <div className="crisis-timeline" style={{gridTemplateColumns:`repeat(${timeline.length},minmax(0,1fr))`}}>{timeline.map(item=><div key={item.time}><b>{item.time}</b><span>{item.description}</span></div>)}</div>;
 }
 if(step.visual==='activityRecap')return <div className="story-chain">{['策划','分工','沟通','协调','调整','执行','复盘'].map(item=><span key={item}>{item}</span>)}</div>;
 if(step.visual==='campusPreview')return <ExperienceCard title="2026级新生校园体验活动" subtitle={`${({planning:'活动策划',media:'宣传',execution:'现场执行',hosting:'主持互动',logistics:'后勤协调'} as Record<string,string>)[state.studentProfile.campusRole??'']??'活动'}成员`} bullets={state.resumeProfile.campusExperiences.slice(1)} />;
 if(step.visual==='lifeValues')return <div className="value-orbit">{['朋友','运动','兴趣','旅行','社团','校园文化活动'].map(item=><span key={item}>{item}</span>)}</div>;
 if(step.visual==='radarCuriosity')return <div className="curiosity-scene"><ParkingScene selected="C" confirmed/><blockquote>“雷达到底是怎么知道这些的？”</blockquote></div>;
 if(step.visual==='projectIntro')return <div className="project-board"><span>“挑战杯”大学生课外学术科技作品竞赛 · 项目成员</span><h3>复杂停车场景下毫米波雷达目标感知与安全预警研究</h3><p>让车辆更可靠地发现周围障碍物</p></div>;
 if(step.visual==='projectTasks')return <div className="task-board project">{selected.map(item=><span key={item}>{step.interaction?.options.find(option=>option.id===item)?.title}</span>)}</div>;
 if(step.visual==='projectProblem')return <div className="test-matrix"><span>普通车辆<b>正常</b></span><span>墙面<b>正常</b></span><span>较大柱体<b>正常</b></span><span className="unstable">低矮障碍物<b>0.6m · 数据不稳定</b></span></div>;
 if(step.visual==='solutionRoute')return <div className="story-chain solution">{step.interaction?.options.filter(item=>selected.includes(item.id)).map(item=><span key={item.id}>{item.title}</span>)}</div>;
 if(step.visual==='projectFormation')return <><ProjectBridge/><div className="formation-grid">{['研究问题','测试方法','实验数据','阶段结果','图表','作品材料','团队汇报'].map(item=><span key={item}>{item}</span>)}<b>挑战杯大学生课外学术科技作品竞赛 · 省赛金奖（团队情境成果）</b></div></>;
 if(step.visual==='projectPreview')return <ExperienceCard title="复杂停车场景下毫米波雷达目标感知与安全预警研究" subtitle="挑战杯大学生课外学术科技作品竞赛省赛金奖｜项目成员" bullets={state.resumeProfile.projects.slice(1)}/>;
 if(step.visual==='realityCheck')return <div className="reality-check"><b>REALITY CHECK</b>{step.content.map(item=><span key={item}>{item}</span>)}</div>;
 return <div className={`token-visual ${step.visual}`}>{step.content.map((item,index)=><motion.span className={selected.includes(item)?'selected':''} key={`${item}-${index}`} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:index*.07}}>{item}</motion.span>)}</div>;
}

function ExperienceCard({title,subtitle,bullets}:{title:string;subtitle:string;bullets:string[]}){return <div className="experience-card"><h3>{title}</h3><b>{subtitle}</b>{bullets.length?bullets.map(item=><p key={item}>{item}</p>):<p>—</p>}</div>}

function InteractionPanel({step,selected,confirmed}:{step:SubStep;selected:string[];confirmed:boolean}){
 const state=useCourseStore();const interaction=step.interaction!;const needed=interaction.type==='multiple'?(interaction.maxSelections??1):1;
 return <><p className="choice-hint" role="status">{confirmed?'本次课堂选择已记录':interaction.type==='multiple'&&selected.length===needed?'已选满，请先取消一项再替换，再点击确认。':`点击选项，或按数字 1—${interaction.options.length}（对应 A—${String.fromCharCode(64+interaction.options.length)}）${interaction.type==='multiple'?`；请选择${needed}项，选满后按 Enter 确认。`:'。'}`}</p><div className={`audience-options ${interaction.options.length>3?'many':''}`}>{interaction.options.map((item,index)=><motion.button whileTap={{scale:.97}} key={item.id} className={selected.includes(item.id)?'selected':''} onClick={()=>state.selectOption(item.id)} disabled={confirmed}><em>{String.fromCharCode(65+index)}</em><strong>{item.title}</strong>{item.description&&<span>{item.description}</span>}</motion.button>)}{interaction.type==='multiple'&&!confirmed&&<button className="confirm-choice" onClick={state.confirmInteraction} disabled={selected.length!==needed}>确认 {selected.length} / {needed}</button>}</div></>;
}

export function CourseShell(){
 const state=useCourseStore();const blocked=isCourseBlocked(state);const unit=course[state.unitIndex];const step=unit.subSteps[state.stepIndex];const key=selectionKey(state.unitIndex,state.stepIndex);const selected=state.selections[key]??[];const selectedId=selected[0]??'';const confirmed=Boolean(state.confirmed[key]);const chapterNumber=unit.kind==='chapter'?chapters.findIndex(item=>item.id===unit.id)+1:null;const totalSteps=course.reduce((sum,item)=>sum+item.subSteps.length,0);const currentStep=course.slice(0,state.unitIndex).reduce((sum,item)=>sum+item.subSteps.length,0)+state.stepIndex+1;const resultText=step.interaction&&confirmed?(step.interaction.resultLogic[selectedId]??step.interaction.resultLogic.default):'';const isResume=step.visual==='resume';const timeline=step.timeline??unit;
 return <div className={`lab-shell visual-${step.visual} page-${step.id} ${isResume?'resume-mode':''}`}><KeyboardController/><HelpOverlay/><SessionDialog/><CourseTimer/><SpeakerNotes/>
  <header className="lab-header" inert={blocked}><div className="brand"><Sparkles/><b>大学四年人生实验室</b></div><div className="course-meta"><p><span>{timeline.year}</span></p><p><b>{chapterNumber?`CHAPTER ${String(chapterNumber).padStart(2,'0')} / 06`:unit.kind.toUpperCase()}</b></p><p><span>剩余约</span><b>{timeline.remainingDays} DAYS</b></p></div></header>
  <main className="lab-stage" inert={blocked}><aside className="chapter-rail"><span>{timeline.year}</span><h2>{step.timeline?'回到大学起点':unit.title}</h2><div>{unit.subSteps.map((item,index)=><i className={index===state.stepIndex?'current':index<state.stepIndex?'done':''} key={item.id}/>)}</div><small>{state.stepIndex+1} / {unit.subSteps.length}</small></aside>
   <section className="step-stage" data-step-id={step.id} key={`${unit.id}-${step.id}`}>{step.visual!=='countdown'&&<div className="step-copy"><h1>{step.title}</h1>{!['canteen','parking'].includes(step.visual??'')&&!isResume&&!['choices','reality','enterprise-origin','solution','project-recap'].includes(step.id)&&step.visual!=='dorm'&&(step.visual!=='infoWall'||Boolean(step.interaction))&&<div className="lead-lines">{step.content.map(item=><p key={item}>{item}</p>)}</div>}</div>}
    {isResume?<Resume profile={state.resumeProfile}/>:<GenericVisual step={step} selected={selected}/>} {step.interaction&&<InteractionPanel step={step} selected={selected} confirmed={confirmed}/>} {resultText&&<motion.div className="big-feedback" initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{duration:.35}}><b>选择已记录</b><p>{resultText}</p>{step.interaction&&<button className="reopen-choice" onClick={state.reopenInteraction}>重新选择</button>}</motion.div>}

   </section><GrowthDashboard/></main>
  <footer className="lab-footer" inert={blocked}><div className="overall-progress"><i style={{width:`${currentStep/totalSteps*100}%`}}/><span>{currentStep} / {totalSteps}</span></div><span className="session-status" role="status">{currentStep===totalSteps?'课程结束 · ':''}{state.storageNotice||(state.pendingRestore?'等待恢复上次进度':state.storageAvailable?'进度自动保存在本机':'本机保存不可用')}</span><nav><button onClick={state.previousStep} disabled={currentStep===1} aria-label="上一步"><ChevronLeft/></button><button onClick={state.nextStep} disabled={currentStep===totalSteps||Boolean(step.interaction&&!confirmed)} aria-label="下一阶段"><ChevronRight/></button><button onClick={state.toggleSpeaker} aria-label="讲师提示" aria-pressed={state.speakerVisible} title="讲师提示（P）"><Mic2/></button><button onClick={state.toggleHelp} aria-label="快捷键帮助" title="快捷键帮助（H）"><CircleHelp/></button><button aria-label="切换全屏" onClick={()=>void (document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{})}><Maximize2/></button><button onClick={state.requestReset} aria-label="重置课程"><RotateCcw/></button></nav></footer>
 </div>
}
