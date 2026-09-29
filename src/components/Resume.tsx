import type { ResumeProfile } from '../types/course';

function Experience({ number, title, items }: { number: string; title: string; items: string[] }) {
  const [heading, ...details] = items;
  const [name, ...meta] = heading?.split('｜') ?? [];
  return <section className="resume-experience">
    <div className="resume-section-heading"><span>{number}</span><h3>{title}</h3></div>
    {heading ? <>
      <h4>{name}</h4>
      <p className="resume-experience-meta">{meta.join(' · ')}</p>
      <ul>{details.map((detail, index) => <li key={index}>{detail}</li>)}</ul>
    </> : <p className="resume-pending">完成对应课堂互动后，这里会呈现你的经历。</p>}
  </section>;
}

export function Resume({ profile }: { profile: ResumeProfile }) {
  return <article className="learning-resume" aria-label="根据课堂选择生成的模拟简历">
    <header className="resume-masthead">
      <div><p className="resume-eyebrow">MY UNIVERSITY JOURNEY · 2026—2030</p><h2>2030届秋招求职简历</h2></div>
      <span className="resume-simulation-badge">全班共同体验 · 课堂模拟</span>
    </header>
    <section className="resume-identity">
      <div><h3>{profile.name}</h3><p>{profile.school} · {profile.college}</p></div>
      <div className="resume-education"><strong>{profile.major} · {profile.degree}</strong><span>{profile.educationPeriod}</span></div>
    </section>
    <div className="resume-experiences">
      <Experience number="01" title="校园经历 / 团队协作" items={profile.campusExperiences} />
      <Experience number="02" title="项目经历 / 专业探索" items={profile.projects} />
    </div>
    <section className="resume-award"><span>竞赛成果</span><p>{profile.awards.join('；') || '完成项目体验后呈现'}</p></section>
    <footer className="resume-footnote"><p>尚待四年真实积累：学业成绩 · 专业技能 · 实习经历 · 证书</p><span>内容依据本次选择生成，属于课堂情境推演，不代表真实履历。</span></footer>
  </article>;
}
