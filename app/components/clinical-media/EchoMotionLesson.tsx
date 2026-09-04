'use client'

import { CheckCircle2, RotateCcw, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import {
  createEchoMotionCompletionReceipt,
  ECHO_MOTION_TRAINING_ACTIVITY,
  matchesEchoAnswerKey,
  type EchoAssessmentAnswerId,
  type EchoAssessmentAnswers,
  type EchoAssessmentQuestionId,
  type EchoMotionCompletionReceipt,
} from '../../lib/codelab/echoTrainingActivity'
import type { EchoCineLocale } from '../../lib/clinicalMedia/echoCinePhantom'
import EchoCineCanvas from './EchoCineCanvas'
import styles from './clinical-media.module.css'

export interface EchoMotionLessonProps {
  locale: EchoCineLocale
  reducedMotion: boolean
}

interface LocalizedQuestion {
  id: EchoAssessmentQuestionId
  prompt: string
  options: { id: EchoAssessmentAnswerId; label: string }[]
}

const COPY: Record<EchoCineLocale, {
  eyebrow: string
  title: string
  objective: string
  assessmentTitle: string
  questions: LocalizedQuestion[]
  submit: string
  incomplete: string
  retryTitle: string
  retryBody: string
  passedTitle: string
  passedBody: string
  receiptTitle: string
  recorded: string
  receiptId: string
  content: string
  engine: string
  attempts: string
  receiptNote: string
  restart: string
  disclaimer: string
}> = {
  en: {
    eyebrow: 'ECHO CINE LAB · DRAFT',
    title: 'Recognize the scientific object and its safe boundary',
    objective: 'Learning objective: understand that ECHO uses ordered cine frames and observe one cyclical motion pattern in a synthetic phantom.',
    assessmentTitle: 'Two-question boundary check',
    questions: [
      {
        id: 'scientific-object',
        prompt: 'Which scientific object drives this ECHO prototype?',
        options: [
          { id: 'ordered-cine-frames', label: 'An ordered sequence of cine frames' },
          { id: 'time-series-signal', label: 'A mathematical time-series signal' },
          { id: 'voxel-volume', label: 'A calibrated voxel volume' },
        ],
      },
      {
        id: 'permitted-observation',
        prompt: 'What may this draft phantom teach?',
        options: [
          { id: 'describe-cyclical-motion', label: 'Describe the visible cyclical motion only' },
          { id: 'estimate-function', label: 'Estimate cardiac function' },
          { id: 'name-pathology', label: 'Name a pathology or diagnosis' },
        ],
      },
    ],
    submit: 'Check both answers',
    incomplete: 'Choose one answer for each question.',
    retryTitle: 'Review the modality boundary',
    retryBody: 'This draft teaches frame order and synthetic cyclical motion only. It cannot support measurements or clinical findings.',
    passedTitle: 'Boundary check passed',
    passedBody: 'The ordered-frame model and non-diagnostic learning limit matched the governed answer key.',
    receiptTitle: 'Unified completion receipt',
    recorded: 'Session only',
    receiptId: 'Receipt ID',
    content: 'Content',
    engine: 'Engine',
    attempts: 'Attempts',
    receiptNote: 'Deterministic structural evidence only; not certification, clinical validation or medical approval.',
    restart: 'Restart this lesson',
    disclaimer: 'Synthetic motion phantom. Not an echocardiogram, anatomy model, measurement tool or diagnostic output.',
  },
  ar: {
    eyebrow: 'مختبر حركة الإيكو · مسودة',
    title: 'تعرّف إلى الكائن العلمي وحدوده الآمنة',
    objective: 'هدف التعلّم: فهم أن الإيكو يعتمد تسلسلًا مرتبًا من إطارات الحركة، ومراقبة نمط دوري واحد في نموذج اصطناعي.',
    assessmentTitle: 'اختبار الحدود بسؤالين',
    questions: [
      {
        id: 'scientific-object',
        prompt: 'ما الكائن العلمي الذي يشغّل نموذج الإيكو هذا؟',
        options: [
          { id: 'ordered-cine-frames', label: 'تسلسل مرتب من إطارات الحركة' },
          { id: 'time-series-signal', label: 'إشارة زمنية رياضية' },
          { id: 'voxel-volume', label: 'حجم فوكسلات معاير' },
        ],
      },
      {
        id: 'permitted-observation',
        prompt: 'ما الذي يمكن أن يعلّمه هذا النموذج الأولي؟',
        options: [
          { id: 'describe-cyclical-motion', label: 'وصف الحركة الدورية الظاهرة فقط' },
          { id: 'estimate-function', label: 'تقدير وظيفة القلب' },
          { id: 'name-pathology', label: 'تسمية مرض أو تشخيص' },
        ],
      },
    ],
    submit: 'تحقّق من الإجابتين',
    incomplete: 'اختر إجابة واحدة لكل سؤال.',
    retryTitle: 'راجع حدود وسيلة التصوير',
    retryBody: 'تعلّم هذه المسودة ترتيب الإطارات والحركة الاصطناعية الدورية فقط، ولا تدعم القياسات أو النتائج السريرية.',
    passedTitle: 'نجح اختبار الحدود',
    passedBody: 'تطابق نموذج الإطارات المرتبة والحدّ غير التشخيصي مع مفتاح الإجابة المحكوم.',
    receiptTitle: 'إيصال إنجاز موحّد',
    recorded: 'لهذه الجلسة فقط',
    receiptId: 'معرّف الإيصال',
    content: 'المحتوى',
    engine: 'المحرك',
    attempts: 'المحاولات',
    receiptNote: 'دليل بنيوي حتمي فقط؛ ليس شهادة أو تحققًا سريريًا أو اعتمادًا طبيًا.',
    restart: 'إعادة بدء الدرس',
    disclaimer: 'نموذج حركة اصطناعي؛ ليس فحص إيكو أو نموذج تشريح أو أداة قياس أو مخرجًا تشخيصيًا.',
  },
}

export default function EchoMotionLesson({ locale, reducedMotion }: EchoMotionLessonProps) {
  const [answers, setAnswers] = useState<Partial<EchoAssessmentAnswers>>({})
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState<'idle' | 'needs-review' | 'passed'>('idle')
  const [receipt, setReceipt] = useState<EchoMotionCompletionReceipt | null>(null)
  const copy = COPY[locale]
  const isComplete = Boolean(answers['scientific-object'] && answers['permitted-observation'])

  function chooseAnswer(questionId: EchoAssessmentQuestionId, answerId: EchoAssessmentAnswerId) {
    if (receipt) return
    setAnswers(current => ({ ...current, [questionId]: answerId }))
    setResult('idle')
  }

  function checkAnswers() {
    const scientificObject = answers['scientific-object']
    const permittedObservation = answers['permitted-observation']
    if (!scientificObject || !permittedObservation) return

    const completeAnswers: EchoAssessmentAnswers = {
      'scientific-object': scientificObject,
      'permitted-observation': permittedObservation,
    }
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (!matchesEchoAnswerKey(completeAnswers)) {
      setReceipt(null)
      setResult('needs-review')
      return
    }

    setReceipt(createEchoMotionCompletionReceipt({ locale, attempts: nextAttempts, answers: completeAnswers }))
    setResult('passed')
  }

  function restartLesson() {
    setAnswers({})
    setAttempts(0)
    setReceipt(null)
    setResult('idle')
  }

  return (
    <section className={styles.echoLesson} aria-labelledby="echo-motion-lesson-title" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <header className={styles.echoLessonHeader}>
        <div>
          <p className={styles.echoEyebrow}>{copy.eyebrow}</p>
          <h2 id="echo-motion-lesson-title">{copy.title}</h2>
          <p>{copy.objective}</p>
        </div>
        <span className={styles.echoDraftBadge}>{locale === 'ar' ? 'مراجعة بشرية مطلوبة' : 'Human review required'}</span>
      </header>

      <EchoCineCanvas locale={locale} reducedMotion={reducedMotion} />

      <section className={styles.echoAssessment} aria-labelledby="echo-assessment-title">
        <h3 id="echo-assessment-title">{copy.assessmentTitle}</h3>
        <div className={styles.echoQuestionGrid}>
          {copy.questions.map((question, index) => (
            <fieldset className={styles.echoQuestion} key={question.id}>
              <legend><span>{index + 1}</span>{question.prompt}</legend>
              <div className={styles.echoOptions}>
                {question.options.map(option => {
                  const selected = answers[question.id] === option.id
                  return (
                    <button
                      aria-pressed={selected}
                      className={selected ? styles.echoOptionSelected : undefined}
                      disabled={receipt !== null}
                      key={option.id}
                      onClick={() => chooseAnswer(question.id, option.id)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className={styles.echoAssessmentActions}>
          <button className={styles.echoPrimaryAction} disabled={!isComplete || receipt !== null} onClick={checkAnswers} type="button">
            {copy.submit}
          </button>
          {!isComplete ? <span>{copy.incomplete}</span> : null}
        </div>

        {result === 'needs-review' ? (
          <div className={styles.echoResultWarning} role="alert">
            <ShieldAlert aria-hidden="true" size={21} />
            <div><strong>{copy.retryTitle}</strong><span>{copy.retryBody}</span></div>
          </div>
        ) : null}

        {result === 'passed' ? (
          <div className={styles.echoResultSuccess} role="status">
            <CheckCircle2 aria-hidden="true" size={21} />
            <div><strong>{copy.passedTitle}</strong><span>{copy.passedBody}</span></div>
          </div>
        ) : null}
      </section>

      {receipt ? (
        <section aria-label={copy.receiptTitle} className={styles.echoReceipt} role="status">
          <header>
            <div>
              <p className={styles.echoEyebrow}>{copy.receiptTitle}</p>
              <strong>{receipt.activityId}</strong>
            </div>
            <span>{copy.recorded}</span>
          </header>
          <dl>
            <div><dt>{copy.receiptId}</dt><dd>{receipt.receiptId}</dd></div>
            <div><dt>{copy.content}</dt><dd>{receipt.contentAssetId} · {receipt.contentVersion}</dd></div>
            <div><dt>{copy.engine}</dt><dd>{receipt.engineId}</dd></div>
            <div><dt>{copy.attempts}</dt><dd>{receipt.assessment.attempts}</dd></div>
          </dl>
          <p>{copy.receiptNote}</p>
          <button className={styles.echoSecondaryAction} onClick={restartLesson} type="button">
            <RotateCcw aria-hidden="true" size={18} /> {copy.restart}
          </button>
        </section>
      ) : null}

      <p className={styles.echoDisclaimer}>{copy.disclaimer}</p>
      <span className={styles.echoContractId}>{ECHO_MOTION_TRAINING_ACTIVITY.contentVersion} · {ECHO_MOTION_TRAINING_ACTIVITY.engineId}</span>
    </section>
  )
}
