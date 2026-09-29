import { motion } from 'framer-motion';
import type { SubStep } from '../types/course';

export function CountdownScene({ step }: { step: SubStep }) {
  const years = step.title.split(' · ');
  const days = step.content[0].split(' · ');
  return <div className="countdown-scene" aria-label="大学四年时间推进">
    <p>2029年秋招开启，为2030年毕业做准备。</p>
    <div className="countdown-visual">{years.map((year, index) => <motion.b key={year}
      className={index === years.length - 1 ? 'current-year' : ''}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: index === years.length - 1 ? 1 : .55, y: 0 }}
      transition={{ delay: index * .12, duration: .3 }}>{year}</motion.b>)}</div>
    <div className="countdown-days" aria-label="距毕业的大约天数">{days.map((day, index) => <span key={day}>
      <b>{day}</b>{index < days.length - 1 && <i aria-hidden="true">→</i>}
    </span>)}<small>天（约）</small></div>
    <strong>{step.content[1]}</strong>
  </div>;
}
