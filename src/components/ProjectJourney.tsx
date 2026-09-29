import { useState } from 'react';
import { course } from '../data/course';
import { useCourseStore } from '../store/courseStore';

const options = course.flatMap(unit => unit.subSteps).find(step => step.id === 'problem-solving')!.interaction!.options;
const referenceStages = [
  ['复现实验', '确认问题是否稳定出现'],
  ['改变测试条件', '调整距离、角度和目标类型'],
  ['整理数据', '寻找异常出现的规律'],
  ['查资料 · 请教 · 讨论', '形成可能的原因解释'],
  ['AI辅助分析', '整理数据与图表，核对输出'],
  ['重新实验验证', '确认调整是否真正有效'],
];

function useSelectedActions() {
  const selected = useCourseStore(state => state.projectExperience.problemSolvingChoices);
  return options.filter(option => selected.includes(option.id));
}

export function ProjectBridge() {
  const selected = useCourseStore(state => state.projectExperience.problemSolvingChoices);
  return <p className="project-bridge">{selected.includes('switch')
    ? '你提出了换题的想法，需要进一步评估。后续课堂统一观察原项目团队的推进与成果，不表示你的换题方案已实施。'
    : '以上是本次选择的优先行动。后续课堂继续观察团队如何验证、调整并形成阶段成果。'}</p>;
}

export function SolutionScene() {
  const actions = useSelectedActions();
  const [showReference, setShowReference] = useState(false);
  return <div className="personal-solution">
    <div className="solution-toolbar">
      <b>{showReference ? '教师参考方法 · 可补充讨论' : '本次选择 · 优先行动'}</b>
      <button onClick={() => setShowReference(value => !value)} aria-expanded={showReference}>
        {showReference ? '返回本次选择' : '查看教师参考方法'}
      </button>
    </div>
    {showReference ? <>
      <p className="solution-explanation">以下是可供讨论的方法，不代表你已经选择或完成了全部步骤。AI不能替代专业判断与实验验证。</p>
      <div className="reference-methods">{referenceStages.map(([title, detail], index) => <div key={title}>
        <span>{String(index + 1).padStart(2, '0')}</span><b>{title}</b><small>{detail}</small>
      </div>)}</div>
    </> : <>
      <div className="chosen-methods">{actions.map((action, index) => <div key={action.id} data-choice={action.id}>
        <span>{String(index + 1).padStart(2, '0')}</span><b>{action.title}</b><small>{action.description}</small>
      </div>)}</div>
      <ProjectBridge />
      <p className="solution-explanation">真实问题很少一步解决，重要的是不断验证、调整和再尝试。</p>
    </>}
  </div>;
}

export function ProjectRecapScene() {
  const actions = useSelectedActions();
  const stages = [
    ['发现问题', '雷达怎么知道后面有什么？'],
    ['进入项目', '作为普通成员，承担基础任务'],
    ['遇到困难', '低矮障碍物感知结果出现异常'],
    ['你的优先行动', actions.map(action => action.title).join(' · ')],
    ['团队阶段成果', '挑战杯省赛金奖（课程情境）'],
  ];
  return <div className="project-recap-scene">
    <p className="project-recap-intro">从一个生活里的疑问，到一次专业项目体验。</p>
    <div className="project-recap-grid">{stages.map(([title, detail], index) => <div className="project-recap-node" key={title}>
      <span>{String(index + 1).padStart(2, '0')}</span><b>{title}</b><small>{detail}</small>
    </div>)}</div>
    <ProjectBridge />
    <strong>能力不是突然出现的，而是在一次次真实任务中慢慢长出来的。</strong>
  </div>;
}
