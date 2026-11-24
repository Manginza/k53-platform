import type { ComponentType } from 'react'
import type { BlogPost } from '@/lib/blog'
import type { FaqItem } from './Article'
import LearnersLicenceStudyMaterials, { FAQ_ITEMS as studyMaterialsFaq } from './LearnersLicenceStudyMaterials'
import StudyInTwoWeeks, { FAQ_ITEMS as twoWeeksFaq } from './StudyInTwoWeeks'
import RoadSignsPeopleGetWrong, { FAQ_ITEMS as signsFaq } from './RoadSignsPeopleGetWrong'
import RulesOfTheRoadExplained, { FAQ_ITEMS as rulesFaq } from './RulesOfTheRoadExplained'
import VehicleControlsExplained, { FAQ_ITEMS as controlsFaq } from './VehicleControlsExplained'
import LearnersTestDay, { FAQ_ITEMS as testDayFaq } from './LearnersTestDay'
import WhyLearnersFail, { FAQ_ITEMS as failFaq } from './WhyLearnersFail'
import LearnersVsDriversLicence, { FAQ_ITEMS as codesFaq } from './LearnersVsDriversLicence'
import AfterYouPass, { FAQ_ITEMS as afterFaq } from './AfterYouPass'

/** slug → article body. Kept beside the metadata in lib/blog.ts. */
export const BODIES: Record<string, ComponentType<{ post: BlogPost }>> = {
  'how-to-study-for-the-k53-learners-test-in-two-weeks': StudyInTwoWeeks,
  'k53-road-signs-most-people-get-wrong': RoadSignsPeopleGetWrong,
  'k53-rules-of-the-road-explained': RulesOfTheRoadExplained,
  'k53-vehicle-controls-questions-explained': VehicleControlsExplained,
  'what-to-bring-on-learners-licence-test-day': LearnersTestDay,
  'common-reasons-people-fail-the-learners-test': WhyLearnersFail,
  'learners-licence-vs-drivers-licence-codes': LearnersVsDriversLicence,
  'what-you-can-do-after-passing-your-learners': AfterYouPass,
  'learners-licence-study-materials-south-africa': LearnersLicenceStudyMaterials,
}

/** Same questions and answers the article renders, used for FAQPage JSON-LD. */
export const FAQS: Record<string, FaqItem[]> = {
  'how-to-study-for-the-k53-learners-test-in-two-weeks': twoWeeksFaq,
  'k53-road-signs-most-people-get-wrong': signsFaq,
  'k53-rules-of-the-road-explained': rulesFaq,
  'k53-vehicle-controls-questions-explained': controlsFaq,
  'what-to-bring-on-learners-licence-test-day': testDayFaq,
  'common-reasons-people-fail-the-learners-test': failFaq,
  'learners-licence-vs-drivers-licence-codes': codesFaq,
  'what-you-can-do-after-passing-your-learners': afterFaq,
  'learners-licence-study-materials-south-africa': studyMaterialsFaq,
}
