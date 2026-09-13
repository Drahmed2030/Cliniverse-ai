import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareEchoAccountAttempt } from '../app/lib/competency/echoAccountAttempt.ts'
import { ECHO_A4C_COMPETENCY_TASKS } from '../app/lib/competency/echoA4cCompetencyTasks.ts'
const task=ECHO_A4C_COMPETENCY_TASKS[0]
const input=()=>({userId:'00000000-0000-4000-8000-000000000001',caseId:task.caseId,taskVersion:task.version,response:{taskId:task.id,selectedOptionIds:[task.answerKey[0]],confidence:3,responseTimeMs:500,attemptedAt:'2026-09-13T01:00:00.000Z'}})
test('actual governed tasks use existing scorer and preserve identity on retry',()=>{
  for(const task of ECHO_A4C_COMPETENCY_TASKS){const value=input();value.response.taskId=task.id;value.response.selectedOptionIds=[task.answerKey[0]];const event=prepareEchoAccountAttempt(value);assert.equal(event.normalizedScore,100);assert.equal(event.skillId,task.skillId);assert.deepEqual(prepareEchoAccountAttempt(value),event);assert.equal(Object.isFrozen(event),true)}
})
test('incorrect valid option produces assessment evidence with zero score',()=>{
 const value=input();value.response.selectedOptionIds=[task.options.find(x=>!task.answerKey.includes(x.id)).id];assert.equal(prepareEchoAccountAttempt(value).normalizedScore,0)
})
test('case, version and unknown task cannot be substituted',()=>{
 for(const patch of [{caseId:'another'},{taskVersion:'stale'},{response:{...input().response,taskId:'unknown'}}])assert.throws(()=>prepareEchoAccountAttempt({...input(),...patch}),/identity/)
})
test('invalid, empty, multiple and duplicated options rejected',()=>{
 for(const selectedOptionIds of [[],['unknown'],[task.answerKey[0],task.answerKey[0]]])assert.throws(()=>prepareEchoAccountAttempt({...input(),response:{...input().response,selectedOptionIds}}),/valid option/)
})
test('invalid confidence, time and account rejected before save',()=>{
 for(const patch of [{confidence:NaN},{confidence:6},{responseTimeMs:Infinity},{attemptedAt:'invalid'}])assert.throws(()=>prepareEchoAccountAttempt({...input(),response:{...input().response,...patch}}))
 assert.throws(()=>prepareEchoAccountAttempt({...input(),userId:'preview-session'}))
})
