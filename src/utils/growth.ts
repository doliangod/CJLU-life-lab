import type { CampusExperience, ChoiceHistoryEntry, GrowthProgress, ProjectExperience } from '../types/course';
import { course } from '../data/course';

const keywords: Record<string, Record<string, string>> = {
  participation: { A:'机会探索', B:'校园协作', C:'兴趣探索', D:'自我管理' },
  'campus-role': { planning:'活动策划', media:'信息表达', execution:'现场执行', hosting:'公众表达', logistics:'资源协调' },
  priorities: { content:'内容设计', publicity:'传播沟通', safety:'风险意识', interaction:'体验设计', schedule:'时间管理', materials:'资源配置' },
  crisis: { A:'时间协调', B:'现场表达', C:'流程调整', D:'设备排查' },
  interest: { A:'专业好奇', B:'专业探索', C:'实践意愿' },
  'initial-tasks': { research:'文献检索', observe:'场景分析', record:'测试记录', collect:'方案设计', organize:'数据整理', discuss:'团队讨论' },
  'problem-solving': { repeat:'实验验证', papers:'文献检索', ai:'AI辅助', teacher:'请教交流', team:'团队讨论', switch:'方向评估' },
};

export function buildGrowth(history: ChoiceHistoryEntry[], campus: CampusExperience, project: ProjectExperience): GrowthProgress {
  const involved = new Set<string>();
  // Course order keeps the display stable after revisiting a previous question.
  for (const [id, mapping] of Object.entries(keywords)) {
    const selected = history.find(entry => entry.interactionId === id)?.selectedOption ?? [];
    for (const [option, keyword] of Object.entries(mapping)) if (selected.includes(option)) involved.add(keyword);
  }
  return {
    keywords: [...involved], completedInteractions: history.length,
    totalInteractions: course.flatMap(unit => unit.subSteps).filter(step => step.interaction).length,
    completedExperiences: Number(campus.completed) + Number(project.completed),
    campusCompleted: campus.completed, projectCompleted: project.completed,
  };
}
