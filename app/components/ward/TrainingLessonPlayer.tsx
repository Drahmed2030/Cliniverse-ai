'use client'

import { ArrowLeft, Check, Film, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TrainingLesson } from '../../lib/codelab/trainingContent'
import styles from './code-lab.module.css'

interface Props {
  lesson: TrainingLesson
  totalLessons: number
  onComplete: () => void
  onBack: () => void
}

type Phase = 'learn' | 'practice' | 'check' | 'complete'
const PHASES: Phase[] = ['learn', 'practice', 'check', 'complete']

export default function TrainingLessonPlayer({ lesson, totalLessons, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('learn')
  const [practiceChecks, setPracticeChecks] = useState<Set<number>>(new Set())
  const [answers, setAnswers] = useState<(number | null)[]>(lesson.mcqs.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [seconds, setSeconds] = useState(120)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const score = useMemo(
    () => answers.filter((answer, index) => answer === lesson.mcqs[index]?.answerIndex).length,
    [answers, lesson.mcqs],
  )
  const passScore = Math.ceil(lesson.mcqs.length / 2)

  function togglePractice(index: number) {
    setPracticeChecks(current => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setSeconds(120)
    setTimerRunning(true)
    timerRef.current = setInterval(() => {
      setSeconds(value => {
        if (value <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimerRunning(false)
          return 0
        }
        return value - 1
      })
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerRunning(false)
  }

  function move(next: Phase) {
    setPhase(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className={styles.shell}>
      <div className={styles.content}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={onBack} type="button">
            <ArrowLeft aria-hidden="true" size={18} /> Code Lab
          </button>
          <span className={styles.badge}>{lesson.track.toUpperCase()} · {lesson.order}/{totalLessons}</span>
        </header>

        <div className={styles.lessonHeader}>
          <p className={styles.eyebrow}>UNIFIED TRAINING PLAYER · ~{lesson.durationMin} MIN</p>
          <h1>{lesson.title}</h1>
          <p>{lesson.objective}</p>
        </div>

        <ol className={styles.stepper} aria-label="Lesson progress">
          {PHASES.map(item => (
            <li className={PHASES.indexOf(item) <= PHASES.indexOf(phase) ? styles.stepActive : ''} key={item}>
              {item === 'learn' ? 'Learn' : item === 'practice' ? 'Practise' : item === 'check' ? 'Check' : 'Complete'}
            </li>
          ))}
        </ol>

        {phase === 'learn' && (
          <section className={styles.panel} aria-labelledby="learn-title">
            <h2 id="learn-title">Learning brief</h2>
            {lesson.clinicalContext && <div className={styles.notice}>{lesson.clinicalContext}</div>}
            <ul className={styles.bulletList}>{lesson.keyPoints.map(point => <li key={point}>{point}</li>)}</ul>
            {lesson.keyNumbers.length > 0 && (
              <>
                <h3>Reference numbers</h3>
                <div className={styles.keyGrid}>
                  {lesson.keyNumbers.map(item => (
                    <div className={styles.keyTile} key={item.label}>
                      <strong>{item.label}</strong><span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className={styles.notice}>
              <Film aria-hidden="true" size={18} />
              <strong> Remotion-ready lesson brief:</strong> {lesson.videoBrief}
            </div>
            <button className={styles.primaryButton} onClick={() => move('practice')} type="button">Start practice</button>
          </section>
        )}

        {phase === 'practice' && (
          <section className={styles.panel} aria-labelledby="practice-title">
            <h2 id="practice-title">Guided practice</h2>
            <p className={styles.subtitle}>{lesson.practice.prompt}</p>
            {lesson.practice.type === 'timer' && (
              <div className={styles.score} aria-live="polite">
                <strong>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</strong>
                <span>Two-minute training interval</span>
                <div className={styles.actions}>
                  <button className={styles.secondaryButton} onClick={timerRunning ? stopTimer : startTimer} type="button">
                    {timerRunning ? 'Stop timer' : 'Start timer'}
                  </button>
                  <button className={styles.secondaryButton} onClick={() => { stopTimer(); setSeconds(120) }} type="button">
                    <RotateCcw aria-hidden="true" size={16} /> Reset
                  </button>
                </div>
              </div>
            )}
            <div className={styles.practiceList}>
              {lesson.practice.items.map((item, index) => (
                <button
                  aria-pressed={practiceChecks.has(index)}
                  className={`${styles.checkButton} ${practiceChecks.has(index) ? styles.selected : ''}`}
                  key={item}
                  onClick={() => togglePractice(index)}
                  type="button"
                >
                  {practiceChecks.has(index) ? <Check aria-hidden="true" size={16} /> : `${index + 1}.`} {item}
                </button>
              ))}
            </div>
            {lesson.commonMistakes.length > 0 && (
              <details className={styles.notice}>
                <summary>Common mistakes to review</summary>
                <ul>{lesson.commonMistakes.map(item => <li key={item}>{item}</li>)}</ul>
              </details>
            )}
            <div className={styles.actions}>
              <button className={styles.secondaryButton} onClick={() => move('learn')} type="button">Back</button>
              <button className={styles.primaryButton} onClick={() => move('check')} type="button">Knowledge check</button>
            </div>
          </section>
        )}

        {phase === 'check' && (
          <section className={styles.panel} aria-labelledby="check-title">
            <h2 id="check-title">Knowledge check</h2>
            <div className={styles.questionList}>
              {lesson.mcqs.map((question, questionIndex) => (
                <div className={styles.question} key={question.q}>
                  <strong>{questionIndex + 1}. {question.q}</strong>
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[questionIndex] === optionIndex
                    const correct = question.answerIndex === optionIndex
                    const resultClass = submitted && correct ? styles.correct : submitted && selected ? styles.wrong : selected ? styles.selected : ''
                    return (
                      <button
                        aria-pressed={selected}
                        className={`${styles.choiceButton} ${resultClass}`}
                        disabled={submitted}
                        key={option}
                        onClick={() => setAnswers(current => current.map((value, index) => index === questionIndex ? optionIndex : value))}
                        type="button"
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </button>
                    )
                  })}
                  {submitted && question.explanation && <p className={styles.explanation}>{question.explanation}</p>}
                </div>
              ))}
            </div>
            {!submitted ? (
              <button className={styles.primaryButton} disabled={!answers.every(answer => answer !== null)} onClick={() => setSubmitted(true)} type="button">Submit answers</button>
            ) : score >= passScore ? (
              <div className={styles.actions}>
                <div className={styles.score}><strong>{score}/{lesson.mcqs.length}</strong><span>Training threshold met</span></div>
                <button className={styles.primaryButton} onClick={() => move('complete')} type="button">Continue</button>
              </div>
            ) : (
              <button className={styles.secondaryButton} onClick={() => { setAnswers(lesson.mcqs.map(() => null)); setSubmitted(false) }} type="button">Review and retry</button>
            )}
          </section>
        )}

        {phase === 'complete' && (
          <section className={styles.panel} aria-labelledby="complete-title">
            <h2 id="complete-title">Lesson complete</h2>
            <div className={styles.score}><strong><Check aria-hidden="true" size={30} /></strong><span>Local training progress ready to save</span></div>
            <p className={styles.subtitle}>This records educational completion only. It is not certification or clinical authorization.</p>
            <button className={styles.primaryButton} onClick={onComplete} type="button">Save and return to Code Lab</button>
          </section>
        )}

        <footer className={styles.disclaimer}>{lesson.disclaimer}</footer>
      </div>
    </main>
  )
}
