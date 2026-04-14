import type { ExamCatalogItem, ProfileCert, StudyQuestion } from "@/lib/types"

function parseChoiceShape(choices: StudyQuestion["choices"] | string) {
  if (Array.isArray(choices)) {
    return choices
  }

  if (choices && typeof choices === "object") {
    return choices
  }

  if (typeof choices === "string") {
    try {
      const parsed = JSON.parse(choices)
      if (Array.isArray(parsed) || (parsed && typeof parsed === "object")) {
        return parsed as Record<string, string> | string[]
      }
    } catch {
      return [choices]
    }
  }

  return {}
}

export function choiceEntries(choices: StudyQuestion["choices"]) {
  const normalizedChoices = parseChoiceShape(choices)

  if (Array.isArray(normalizedChoices)) {
    return normalizedChoices.map((choice, index) => ({
      key: `${String.fromCharCode(65 + index)}.`,
      label: `${String.fromCharCode(65 + index)}.`,
      text: choice,
    }))
  }

  return Object.entries(normalizedChoices).map(([label, text]) => ({
    key: label,
    label,
    text,
  }))
}

export function answerKeys(answer: StudyQuestion["answer"]) {
  if (Array.isArray(answer)) {
    return answer
  }

  if (typeof answer === "string") {
    try {
      const parsed = JSON.parse(answer)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item))
      }
    } catch {
      if (answer.startsWith("{") && answer.endsWith("}")) {
        return answer
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim().replace(/^"+|"+$/g, ""))
          .filter(Boolean)
      }
    }
  }

  return [answer]
}

export function isQuestionCorrect(question: StudyQuestion, selectedAnswers: string[]) {
  const correctAnswers = answerKeys(question.answer)
  if (correctAnswers.length !== selectedAnswers.length) {
    return false
  }

  const selected = [...selectedAnswers].sort()
  const correct = [...correctAnswers].sort()
  return selected.every((value, index) => value === correct[index])
}

export function normalizeCertCatalog(
  cert: ProfileCert,
  exams: ExamCatalogItem[]
) {
  return exams.find((exam) => exam.normalized_name === cert.cert)
}

export function totalDomainQuestions(exams: ExamCatalogItem[]) {
  return exams.flatMap((exam) => exam.domains)
}
